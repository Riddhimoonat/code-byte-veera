import { getRiskScore } from '../services/ml.service.js';
import PoliceStation from '../models/PoliceStation.model.js';
import CommunityReport from '../models/communityReport.model.js';
import { findNearestStation } from '../services/haversine.service.js';

// POST /api/risk-score/nearest-stations
const findNearestStationsHandler = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (latitude == null || longitude == null) {
      return res.status(400).json({ success: false, message: 'latitude and longitude are required' });
    }

    const stations = await PoliceStation.find().lean();
    const nearest = findNearestStation(latitude, longitude, stations);

    if (!nearest) {
       return res.json({ success: true, data: [] });
    }

    res.json({ 
      success: true, 
      data: [{
        id: nearest.station._id,
        name: nearest.station.name,
        latitude: nearest.station.latitude,
        longitude: nearest.station.longitude,
        phone: nearest.station.phone,
        distance_km: nearest.distanceKm.toFixed(2),
        type: 'Police Station'
      }]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/risk-score
const getRiskScoreHandler = async (req, res) => {
  try {
    const { latitude, longitude, timestamp, is_isolated } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ success: false, message: 'latitude and longitude are required' });
    }

    const ts = timestamp || new Date().toISOString();
    let result = await getRiskScore(latitude, longitude, ts, is_isolated ?? false);

    // 🔥 Dynamic Intelligence: Check for community reports within 500m
    const nearReports = await CommunityReport.find({
      'location.latitude': { $gt: latitude - 0.005, $lt: parseFloat(latitude) + 0.005 },
      'location.longitude': { $gt: longitude - 0.005, $lt: parseFloat(longitude) + 0.005 }
    }).sort({ createdAt: -1 });

    if (nearReports.length > 0) {
      // Boost risk by 10 points per recent report (max 100)
      result.risk_score = Math.min(100, result.risk_score + (nearReports.length * 10));
      if (result.risk_score > 70) result.risk_category = 'High';
      
      // Inject alert icons or notices into the factors list
      nearReports.forEach(r => {
        result.risk_factors.unshift(`⚠️ COMMUNITY: ${r.type} reported here recently`);
      });
    }

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

export { getRiskScoreHandler, getRiskMapHandler, findNearestStationsHandler };
