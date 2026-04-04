import axios from 'axios';

const ML_API_URL = process.env.ML_API_URL || 'https://veera-ml-api.onrender.com';

/**
 * Fetches a risk score from the FastAPI ML service.
 * @param {number}  lat         - latitude
 * @param {number}  lng         - longitude
 * @param {string}  timestamp   - ISO timestamp string
 * @param {boolean} is_isolated - whether user is in an isolated area
 * @returns {Promise<{ risk_score: number, risk_level: string }>}
 */
const getRiskScore = async (lat, lng, timestamp, is_isolated) => {
  try {
    const hour = new Date(timestamp).getHours();

    const response = await axios.post(
      `${ML_API_URL}/predict`,
      {
        latitude: lat,
        longitude: lng,
        hour
      },
      { timeout: 10000 }
    );

    return response.data; // expects { risk_score: 0.87, risk_level: "high" }
  } catch (err) {
    console.error('[ML Service] Failed to get risk score:', err.message);
    // Fallback — return a neutral score so the SOS flow isn't blocked
    return { risk_score: 0.5, risk_level: 'medium' };
  }
};

export { getRiskScore };
