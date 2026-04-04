import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, API_PATHS } from '../constants';
import type {
  RiskScoreRequest,
  RiskScoreResponse,
  SOSRequest,
  SOSResponse,
  EmergencyContact,
  RiskMapPoint,
} from '../types';

// ─── API Client Setup ──────────────────────────────────────────────────────────
/**
 * WHY: The prototype scattered fetch() calls everywhere and hardcoded the URL.
 * We centralise all HTTP logic here with proper interceptors, timeouts, and
 * token injection. The BASE_URL comes from the .env file so the team can
 * switch between local dev and production without touching source code.
 */
const BASE_URL = 'https://code-byte-veera-gg55.onrender.com/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
  },
});

// ─── Request Interceptor — JWT Injection ───────────────────────────────────────
/**
 * WHY: The backend uses JWT auth. We read the token from AsyncStorage and
 * attach it to every request automatically, so individual callers don't have
 * to worry about auth headers.
 */
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {
    // If storage is unavailable, proceed without token.
  }
  return config;
});

// ─── Response Interceptor — Error Normalisation ────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message =
      (error.response?.data as any)?.message ??
      error.message ??
      'Unknown API error';
    // Rethrow with a clean Error object that components can display.
    throw new Error(message);
  }
);

// ─── Risk Score API ────────────────────────────────────────────────────────────
/**
 * POST /api/risk-score
 *
 * CRITICAL ARCHITECTURAL CHANGE FROM PROTOTYPE:
 * The old prototype computed crime_density, isNight, isIsolated on-device
 * and sent them to the backend. This is wrong — the mobile app doesn't have
 * access to real crime datasets. We now send ONLY lat/lng/timestamp and let
 * the backend + ML service (Python FastAPI) do all the feature engineering.
 */
export async function fetchRiskScore(
  payload: RiskScoreRequest
): Promise<RiskScoreResponse> {
  const { data } = await apiClient.post<any>('/risk-score', payload);
  // Backend wraps in { success: true, data: result } 
  return data.data || data;
}

export async function fetchNearestStations(
  payload: { latitude: number, longitude: number }
): Promise<any[]> {
  const { data } = await apiClient.post<any>('/risk-score/nearest-stations', payload);
  return data.data || [];
}

export async function fetchRiskMap(
  payload: RiskScoreRequest
): Promise<RiskMapPoint[]> {
  const { data } = await apiClient.post<any>('/risk-score/map', payload);
  return data.data || data;
}

// ─── SOS Trigger API ───────────────────────────────────────────────────────────
/**
 * POST /api/sos
 *
 * CRITICAL ARCHITECTURAL CHANGE FROM PROTOTYPE:
 * The old prototype tried to open `sms:` URI links from the app itself using
 * Linking.openURL(). This is unreliable (different Android SMS apps use
 * different URI schemes), requires the app to be in foreground, and completely
 * bypasses our backend audit log (sms_logs table).
 *
 * Now we simply POST to the backend. The backend's SOS handler:
 *   1. Finds nearest police station (Haversine formula)
 *   2. Sends SMS to ALL emergency contacts via Twilio
 *   3. Sends SMS to police station via Twilio
 *   4. Creates a row in sos_events table
 *   5. Emits a socket.io event to the admin dashboard
 *
 * The mobile app just needs to confirm the request arrived — not manage SMS.
 */
export async function triggerSOS(payload: SOSRequest): Promise<SOSResponse> {
  const { data } = await apiClient.post<SOSResponse>('/sos', payload);
  return data;
}

// ─── Contacts Sync API ─────────────────────────────────────────────────────────
/**
 * Contacts are stored locally in AsyncStorage (always available, even offline).
 * When online, we sync additions/deletions to the backend.
 * If the backend is unreachable, the local store is the source of truth.
 */
export async function syncContactToBackend(
  contact: Omit<EmergencyContact, 'id'>
): Promise<void> {
  await apiClient.post('/contacts', {
    name: contact.name,
    phone: contact.phone,
    relationship: contact.relationship,
  });
}

export async function deleteContactFromBackend(
  contactId: string
): Promise<void> {
  await apiClient.delete(`/contacts/${contactId}`);
}

export async function fetchContactsFromBackend(): Promise<EmergencyContact[]> {
  const { data } = await apiClient.get<{ success: boolean; data: any[] }>('/contacts');
  // Backend returns them with _id, need to map to id for local state
  return (data.data || []).map(c => ({
    id: c._id,
    name: c.name,
    phone: c.phone,
    relationship: c.relationship
  }));
}

// ─── VOLUNTEER API ────────────────────────────────────────────────────────────
export async function toggleVolunteerMode(isVolunteer: boolean): Promise<boolean> {
  const { data } = await apiClient.post<{ success: boolean; isVolunteer: boolean }>(
    API_PATHS.TOGGLE_VOLUNTEER,
    { isVolunteer }
  );
  return data.isVolunteer;
}

export async function updateVolunteerLocation(latitude: number, longitude: number): Promise<void> {
  await apiClient.post(API_PATHS.UPDATE_LOCATION, { latitude, longitude });
}

export default apiClient;
