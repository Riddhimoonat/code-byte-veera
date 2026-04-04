import axios from 'axios';
import PoliceStation from '../models/PoliceStation.model.js';
import { findNearestStation } from './haversine.service.js';

const ML_API_URL = process.env.ML_API_URL || 'https://veera-ml-api.onrender.com';

/**
 * Fetches the highly accurate, multi-feature risk score from the Python FastAPI service.
 * Refactored to perfectly match the system_prompt.json specifications.
 */
const getRiskScore = async (lat, lng, timestamp, is_isolated) => {
  try {
    const dateObj = new Date(timestamp);
    const hour = dateObj.getHours();
    const day_of_week = dateObj.getDay(); // 0-6
    const is_night = hour < 6 || hour >= 20;

    // The ML model needs distance to nearest police station. 
    // We cache this or use a very short timeout to avoid hanging the entire API response.
    let distance_km = 10.0; // default/fallback
    try {
      const stations = await PoliceStation.find().maxTimeMS(500).lean();
      const nearest = findNearestStation(lat, lng, stations);
      if (nearest) distance_km = nearest.distanceKm;
    } catch (dbErr) {
      console.warn('[ML Service] PoliceStation DB check failed/timed out, using fallback distance.');
    }

    // Send the absolute complete feature set to the ML microservice
    const response = await axios.post(
      `${ML_API_URL}/predict`,
      {
        latitude: lat,
        longitude: lng,
        timestamp: timestamp,
        hour_of_day: hour,
        day_of_week: day_of_week,
        is_night: is_night,
        is_isolated: is_isolated || false,
        distance_to_police_km: distance_km
      },
      { timeout: 3000 }
    );

    return response.data;
  } catch (err) {
    console.error('[ML Service] Failed to get robust risk score:', err.message);
    // Fallback — return a neutral score so the SOS flow isn't blocked completely
    return { 
      risk_score: 50, 
      risk_category: 'Medium', 
      risk_factors: ["Could not connect to live prediction engine. Using regional average."] 
    };
  }
};

export { getRiskScore };
