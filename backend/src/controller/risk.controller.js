import { getRiskScore } from '../services/ml.service.js';
import PoliceStation from '../models/PoliceStation.model.js';
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

export { getRiskScoreHandler, getRiskMapHandler, findNearestStationsHandler };
