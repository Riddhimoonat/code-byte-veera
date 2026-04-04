import SOSEvent from '../models/SOSEvent.model.js';
import { emitSOSUpdated } from '../services/socket.service.js';

// GET /api/dashboard/alerts
const getAlerts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // With new simplified schema, we can't filter by status
    // Just get all events ordered by creation time
    const alerts = await SOSEvent.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await SOSEvent.countDocuments();

    res.json({
      success: true,
      data: alerts,
      meta: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/dashboard/alerts/:id
const updateAlertStatus = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Alert ID from params:', id);

    // With the new simplified schema, we can't update status
    // The SOSEvent model only has latitude, longitude, and hour
    // We'll return a message indicating this limitation
    return res.status(400).json({
      success: false,
      message: 'Status updates are not supported with the current SOSEvent schema. The model only contains latitude, longitude, and hour fields.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/dashboard/stats
const getStats = async (req, res) => {
  try {
    // With new simplified schema, we can only get total count
    const total = await SOSEvent.countDocuments();

    // Since we don't have status or risk_level fields anymore,
    // we'll provide basic statistics based on available data
    const hourlyStats = await SOSEvent.aggregate([
      {
        $group: {
          _id: '$hour',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        total,
        hourlyDistribution: hourlyStats,
        // Note: active, dispatched, resolved, and avgRiskLevel are no longer available
        // with the simplified schema containing only latitude, longitude, and hour
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export { getAlerts, updateAlertStatus, getStats };
