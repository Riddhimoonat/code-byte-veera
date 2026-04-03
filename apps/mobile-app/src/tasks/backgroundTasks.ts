import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { fetchRiskScore } from '../services/api';
import {
  BACKGROUND_RISK_POLL_TASK,
  BACKGROUND_LOCATION_TASK,
  HIGH_RISK_NOTIFICATION_THRESHOLD,
} from '../constants';
import type { RiskScoreRequest } from '../types';

// ─── Background Location Task Definition ──────────────────────────────────────
/**
 * WHY: The prototype watched location only while the app was in the foreground
 * using watchPositionAsync in a useEffect. This means safety monitoring stopped
 * the moment the user minimised Veera.
 *
 * The spec explicitly requires ACCESS_FINE_LOCATION "always-on for background
 * tracking". We use Expo's TaskManager to register a named background task that
 * the OS can wake us for even when the app is not visible.
 *
 * This task is registered at the MODULE LEVEL (outside any component or hook)
 * because TaskManager requires the task to be defined before any component mounts.
 */
TaskManager.defineTask(
  BACKGROUND_LOCATION_TASK,
  async ({ data, error }: TaskManager.TaskManagerTaskBody<{ locations: Location.LocationObject[] }>) => {
    if (error) {
      console.error('[BG Location Task] Error:', error.message);
      return;
    }

    if (!data?.locations?.length) return;

    const latest = data.locations[data.locations.length - 1];
    const { latitude, longitude } = latest.coords;

    try {
      const payload: RiskScoreRequest = {
        latitude,
        longitude,
        timestamp: new Date(latest.timestamp).toISOString(),
      };

      const result = await fetchRiskScore(payload);

      // Spec: If risk >= 75, fire a local push notification to user
      if (result.risk_level >= HIGH_RISK_NOTIFICATION_THRESHOLD) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `⚠️ ${result.risk_category} Risk Detected`,
            body:
              result.risk_factors.slice(0, 2).join('. ') ||
              'You are in a potentially unsafe area.',
            data: { riskLevel: result.risk_level, category: result.risk_category },
            sound: true,
          },
          trigger: null, // fire immediately
        });
      }
    } catch (err) {
      // Silent fail in background — we cannot alert the user here,
      // but we don't want the task to crash.
      console.error('[BG Location Task] Risk poll failed:', err);
    }
  }
);

// ─── Start Background Location Updates ────────────────────────────────────────
/**
 * Call this when the user turns on Safety Mode.
 * Uses BACKGROUND_LOCATION_TASK defined above.
 * Spec: background task runs every 60 seconds.
 */
export async function startBackgroundLocationTracking(): Promise<void> {
  const { status: foreground } =
    await Location.requestForegroundPermissionsAsync();
  if (foreground !== 'granted') {
    throw new Error('Foreground location permission denied.');
  }

  const { status: background } =
    await Location.requestBackgroundPermissionsAsync();
  if (background !== 'granted') {
    throw new Error(
      'Background location permission denied. Please allow "Always" in settings.'
    );
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_LOCATION_TASK
  );

  if (!isRegistered) {
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 60_000,        // Poll every 60 seconds (spec requirement)
      distanceInterval: 50,        // Or whenever user moves 50m — whichever first
      showsBackgroundLocationIndicator: true, // iOS blue bar — required by App Store
      foregroundService: {
        // Android requires a foreground service notification for background location
        notificationTitle: 'Veera Safety Monitor Active',
        notificationBody: 'Your location is being monitored for safety.',
        notificationColor: '#e85d5d',
      },
    });
  }
}

// ─── Stop Background Location Updates ─────────────────────────────────────────
/**
 * Call this when the user turns off Safety Mode.
 */
export async function stopBackgroundLocationTracking(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_LOCATION_TASK
  );
  if (isRegistered) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  }
}

// ─── Notification Setup ────────────────────────────────────────────────────────
export async function configureNotifications(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.warn('[Notifications] Permission not granted.');
  }
}
