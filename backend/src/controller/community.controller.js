import CommunityReport from '../models/communityReport.model.js';

export const createReportHandler = async (req, res) => {
  try {
    const { type, description, location, severity } = req.body;
    
    // We assume req.user._id is populated by auth middleware
    const report = await CommunityReport.create({
      reporterId: req.user?._id || '000000000000000000000000', // fallback if testing
      type,
      description,
      location,
      severity
    });
    
    res.status(201).json({ success: true, message: 'Report published to the community!', report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getNearReportsHandler = async (req, res) => {
  try {
    const { latitude, longitude, radius = 2000 } = req.query;
    
    // Simple radius filter (1 deg approx 111km)
    // For production, we'd use $near Sphere, but for TIC, simple delta check is fast
    const delta = radius / 111000; 

    const reports = await CommunityReport.find({
      'location.latitude': { $gt: latitude - delta, $lt: parseFloat(latitude) + delta },
      'location.longitude': { $gt: longitude - delta, $lt: parseFloat(longitude) + delta }
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: reports.length, reports });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
