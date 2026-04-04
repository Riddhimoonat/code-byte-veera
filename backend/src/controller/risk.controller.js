import { getRiskScore } from '../services/ml.service.js';

// POST /api/risk-score
const getRiskScoreHandler = async (req, res) => {
  try {
    const { latitude, longitude, timestamp, is_isolated } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ success: false, message: 'latitude and longitude are required' });
    }

    const ts = timestamp || new Date().toISOString();
    const result = await getRiskScore(latitude, longitude, ts, is_isolated ?? false);

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/risk-score/map
const getRiskMapHandler = async (req, res) => {
  try {
    const { latitude, longitude, timestamp } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ success: false, message: 'latitude and longitude are required' });
    }

    const ts = timestamp || new Date().toISOString();
    
    // Generate a 3x3 grid around the point
    const grid = [];
    const offset = 0.005; // ~500m
    
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        grid.push({
          lat: latitude + (i * offset),
          lng: longitude + (j * offset)
        });
      }
    }

    // Call ML service for each point in parallel
    const promises = grid.map(async (point) => {
      const result = await getRiskScore(point.lat, point.lng, ts, false);
      return {
        latitude: point.lat,
        longitude: point.lng,
        ...result
      };
    });

    const results = await Promise.all(promises);

    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export { getRiskScoreHandler, getRiskMapHandler };
