import { Expo } from 'expo-server-sdk';

const expo = new Expo();

/**
 * Sends a push notification to one or more Expo push tokens.
 * @param {string[]} tokens - Array of Expo push tokens.
 * @param {string} title - Notification title.
 * @param {string} body - Notification body.
 * @param {object} data - Optional data payload.
 */
export async function sendPushNotification(tokens, title, body, data = {}) {
  const messages = [];
  for (const pushToken of tokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    messages.push({
      to: pushToken,
      sound: 'default',
      title,
      body,
      data,
    });
  }

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('[Expo Notification Service] Error sending push notification:', error);
    }
  }

  return tickets;
}
