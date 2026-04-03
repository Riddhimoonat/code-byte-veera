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

export { getRiskScoreHandler };
