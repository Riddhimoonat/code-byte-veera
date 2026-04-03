import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

/**
 * Send an SMS via Twilio.
 * @param {string} to      - recipient phone number (E.164 format, e.g. +919876543210)
 * @param {string} message - SMS body
 * @returns {Promise<{ success: boolean, sid?: string, error?: string }>}
 */
const sendSMS = async (to, message) => {
  try {
    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Twilio credentials are not configured in environment variables');
    }

    const client = twilio(accountSid, authToken);

    const msg = await client.messages.create({
      body: message,
      from: fromNumber,
      to,
    });

    console.log(`[Twilio] SMS sent to ${to} | SID: ${msg.sid}`);
    return { success: true, sid: msg.sid };
  } catch (err) {
    console.error(`[Twilio] Failed to send SMS to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
};

export { sendSMS };
