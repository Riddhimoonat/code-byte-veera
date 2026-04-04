import SOSEvent from '../models/SOSEvent.model.js';
import EmergencyContact from '../models/EmergencyContact.model.js';
import PoliceStation from '../models/PoliceStation.model.js';
import SMSLog from '../models/SMSLog.model.js';
import { findNearestStation } from '../services/haversine.service.js';
import { sendSMS } from '../services/twilio.service.js';
import { getRiskScore } from '../services/ml.service.js';
import { emitSOSNew } from '../services/socket.service.js';
import UserModel from '../models/auth.model.js';

// POST /api/sos
const triggerSOS = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ success: false, message: 'latitude and longitude are required' });
    }

    // Get current hour for the event
    const currentHour = new Date().getHours();

    // Create SOS event with new simplified schema
    const sosEvent = await SOSEvent.create({
      latitude,
      longitude,
      hour: currentHour,
    });

    // Find nearest police station
    const stations = await PoliceStation.find();
    const nearest = findNearestStation(latitude, longitude, stations);

    // Get user's emergency contacts
    const contacts = await EmergencyContact.find({ user_id: req.userId });

    // Get ML risk score for additional context
    const timestamp = new Date().toISOString();
    const { risk_score } = await getRiskScore(latitude, longitude, timestamp, false);

    // Build SMS message
    const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
    const userMessage = `🚨 VEERA SOS ALERT 🚨\nAn emergency has been triggered.\nLocation: ${mapsLink}\nRisk Level: ${(risk_score * 100).toFixed(0)}%`;

    const policeMessage = nearest
      ? `🚨 SOS ALERT\nUser at ${mapsLink}\nRisk: ${(risk_score * 100).toFixed(0)}%\nPlease respond immediately.`
      : null;

    // Send SMS to emergency contacts + nearest station (parallel)
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

    // 🦸 COMMUNITY VOLUNTEERS: Alert nearby first-responders (2km radius)
    const volunteerDelta = 0.02; // ~2km
    const nearbyVolunteers = await UserModel.find({
      isVolunteer: true,
      'lastLocation.latitude': { $gt: latitude - volunteerDelta, $lt: parseFloat(latitude) + volunteerDelta },
      'lastLocation.longitude': { $gt: longitude - volunteerDelta, $lt: parseFloat(longitude) + volunteerDelta }
    }).limit(5); // Don't spam, just alert the 5 closest ones

    const volunteerMessage = `🆘 COMMUNITY EMERGENCY 🆘\nA Veera user nearby needs help!\nLocation: ${mapsLink}\nPlease respond if you are nearby.`;

    for (const v of nearbyVolunteers) {
      smsPromises.push(
        sendSMS(v.phone, volunteerMessage).catch(e => console.error(`[Volunteer SMS] Failed for ${v.phone}:`, e.message))
      );
    }

    // Fire and forget — don't block the response
    Promise.allSettled(smsPromises);

    // Emit real-time event to dashboard clients
    emitSOSNew({
      ...sosEvent.toObject(),
      nearestStation: nearest?.station ?? null,
      distanceKm: nearest?.distanceKm ?? null,
      risk_score,
    });

    res.status(201).json({
      success: true,
      message: 'SOS triggered',
      contacts_notified: contacts.length,
      police_station_notified: nearest?.station?.name ?? 'Dispatched',
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
