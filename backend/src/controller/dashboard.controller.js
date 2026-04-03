import SOSEvent from '../models/SOSEvent.model.js';
import { emitSOSUpdated } from '../services/socket.service.js';

// GET /api/dashboard/alerts
const getAlerts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const alerts = await SOSEvent.find(filter)
      .populate('user_id', 'name phone')
      .sort({ triggered_at: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await SOSEvent.countDocuments(filter);

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
    const { status } = req.body;
    const validStatuses = ['active', 'dispatched', 'resolved'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const update = { status };
    if (status === 'resolved') update.resolved_at = new Date();

    const alert = await SOSEvent.findByIdAndUpdate(req.params.id, update, { new: true }).populate(
      'user_id',
      'name phone'
    );

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    // Emit real-time update to dashboard clients
    emitSOSUpdated(alert.toObject());

    res.json({ success: true, data: alert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/dashboard/stats
const getStats = async (req, res) => {
  try {
    const [total, active, dispatched, resolved] = await Promise.all([
      SOSEvent.countDocuments(),
      SOSEvent.countDocuments({ status: 'active' }),
      SOSEvent.countDocuments({ status: 'dispatched' }),
      SOSEvent.countDocuments({ status: 'resolved' }),
    ]);

    // Average risk level
    const aggResult = await SOSEvent.aggregate([
      { $group: { _id: null, avgRisk: { $avg: '$risk_level' } } },
    ]);
    const avgRiskLevel = aggResult.length ? aggResult[0].avgRisk : 0;

    res.json({
      success: true,
      data: { total, active, dispatched, resolved, avgRiskLevel: +avgRiskLevel.toFixed(3) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export { getAlerts, updateAlertStatus, getStats };
