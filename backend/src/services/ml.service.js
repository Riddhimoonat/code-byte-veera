import axios from 'axios';
import axiosRetry from 'axios-retry';
import PoliceStation from '../models/PoliceStation.model.js';
import { findNearestStation } from './haversine.service.js';

const ML_API_URL = process.env.ML_API_URL || 'https://veera-ml-api.onrender.com';

// 🔄 Cold-Start Resilience Logic
// Render free-tier sleeps. We configure axios-retry to handle the 30s wake-up time.
axiosRetry(axios, { 
  retries: 3, 
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === 'ECONNABORTED';
  }
});

/**
 * Procedural Risk Factor Logic
 * WHY: The Python ML API only returns raw scores. We need to explain 'WHY' 
 * the risk is high to the user for TIC 2K26 feature completeness.
 */
const generateRiskFactors = (score, hour, poi_count, crime_density) => {
  const factors = [];
  
  if (hour >= 20 || hour <= 4) factors.push("Late night hours increase vulnerability");
  if (poi_count < 5) factors.push("Isolated area with low public footfall");
  if (crime_density > 4) factors.push("Historically higher incident reports in this sector");
  if (score > 70) factors.push("Active safety monitoring recommended");
  
  // Default if nothing matches
  if (factors.length === 0) {
    factors.push("Standard urban safety profile");
    factors.push("Stay aware of your surroundings");
  }
  
  return factors;
};

/**
 * Fetches the risk score from the Python FastAPI microservice.
 * FIX: Updated schema to match the 'hour' field requirement and increased timeout.
 */
const getRiskScore = async (lat, lng, timestamp, is_isolated) => {
  if (lat == null || lng == null) {
      return { success: false, message: 'latitude and longitude are required' };
    }

    console.log(`[RISK_API] Assessment Request: (${lat}, ${lng})`);
    const ts = timestamp || new Date().toISOString();
  try {
    const dateObj = new Date(ts);
    const hour = dateObj.getHours();

    // Send the exact field names expected by the FastAPI /predict endpoint
    const response = await axios.post(
      `${ML_API_URL}/predict`,
      {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        timestamp: ts,
        hour: hour, // Python API expects 'hour', not 'hour_of_day'
        is_isolated: is_isolated || false
      },
      { timeout: 30000 } // Increased to 30s for Render cold starts
    );

    const data = response.data;
    
    // 🧠 Intelligence: Generate human-readable factors based on the raw metrics
    // The Python API might not return poi_count if fallback was triggered, so we use fallbacks
    const poi = data.poi_count || 5; 
    const crime = data.crime_density || 3.0;
    
    const factors = generateRiskFactors(data.risk_score, hour, poi, crime);
    
    return {
      risk_score: data.risk_score || 50,
      risk_category: (data.risk_level || 'Medium').charAt(0).toUpperCase() + (data.risk_level || 'Medium').slice(1).toLowerCase(),
      risk_factors: factors
    };
  } catch (err) {
    console.error('[ML Service] Failed to get robust risk score:', err.message);
    
    if (err.response?.data) {
        console.error('[ML Service Detail]', JSON.stringify(err.response.data));
    }

    // High Fallback — safer for user if we don't know the risk
    return { 
      risk_score: 55, 
      risk_category: 'Medium', 
      risk_factors: ["Live risk engine reached via fallback. Accuracy may vary."] 
    };
  }
};

export { getRiskScore };
