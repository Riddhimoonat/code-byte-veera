import SOSEvent from '../models/SOSEvent.model.js';
import EmergencyContact from '../models/EmergencyContact.model.js';
import PoliceStation from '../models/PoliceStation.model.js';
import SMSLog from '../models/SMSLog.model.js';
import { findNearestStation } from '../services/haversine.service.js';
import { sendSMS } from '../services/twilio.service.js';
import { getRiskScore } from '../services/ml.service.js';
import { emitSOSNew } from '../services/socket.service.js';

// POST /api/sos
const triggerSOS = async (req, res) => {
  try {
    const { latitude, longitude, is_isolated } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ success: false, message: 'latitude and longitude are required' });
    }

    const timestamp = new Date().toISOString();

    // 1. Get ML risk score (non-blocking fallback built-in)
    const { risk_score } = await getRiskScore(latitude, longitude, timestamp, is_isolated ?? false);

    // 2. Create SOS event
    const sosEvent = await SOSEvent.create({
      user_id: req.userId,
      latitude,
      longitude,
      risk_level: risk_score,
      status: 'active',
      triggered_at: new Date(),
    });

    // 3. Find nearest police station
    const stations = await PoliceStation.find();
    const nearest = findNearestStation(latitude, longitude, stations);

    // 4. Get user's emergency contacts
    const contacts = await EmergencyContact.find({ user_id: req.userId });

    // 5. Build SMS message
    const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
    const userMessage = `🚨 VEERA SOS ALERT 🚨\nAn emergency has been triggered.\nLocation: ${mapsLink}\nRisk Level: ${(risk_score * 100).toFixed(0)}%`;

    const policeMessage = nearest
      ? `🚨 SOS ALERT\nUser at ${mapsLink}\nRisk: ${(risk_score * 100).toFixed(0)}%\nPlease respond immediately.`
      : null;

    // 6. Send SMS to emergency contacts + nearest station (parallel)
    const smsPromises = [];

    for (const contact of contacts) {
      smsPromises.push(
        sendSMS(contact.phone, userMessage).then((result) =>
          SMSLog.create({
            sos_event_id: sosEvent._id,
            recipient_phone: contact.phone,
            message: userMessage,
            status: result.success ? 'sent' : 'failed',
            sent_at: new Date(),
          })
        )
      );
    }

    if (nearest && policeMessage) {
      smsPromises.push(
        sendSMS(nearest.station.phone, policeMessage).then((result) =>
          SMSLog.create({
            sos_event_id: sosEvent._id,
            recipient_phone: nearest.station.phone,
            message: policeMessage,
            status: result.success ? 'sent' : 'failed',
            sent_at: new Date(),
          })
        )
      );
    }

    // Fire and forget — don't block the response
    Promise.allSettled(smsPromises).then(() => {
      SOSEvent.findByIdAndUpdate(sosEvent._id, { status: 'dispatched' }).exec();
    });

    // 7. Emit real-time event to dashboard clients
    emitSOSNew({
      ...sosEvent.toObject(),
      nearestStation: nearest?.station ?? null,
      distanceKm: nearest?.distanceKm ?? null,
    });

    res.status(201).json({
      success: true,
      message: 'SOS triggered',
      data: {
        sosEventId: sosEvent._id,
        risk_score,
        nearestStation: nearest?.station?.name ?? null,
        distanceKm: nearest?.distanceKm?.toFixed(2) ?? null,
      },
    });
  } catch (err) {
    console.error('[SOS] Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export { triggerSOS };
