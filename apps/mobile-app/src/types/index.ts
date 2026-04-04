// ─── Navigation ────────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Contacts: undefined;
  RiskMap: undefined;
  Settings: undefined;
};

// ─── Contacts ──────────────────────────────────────────────────────────────────
/**
 * Matches the backend schema for emergency_contacts table.
 * The 'id' is a local UUID generated on the device before sync.
 */
export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;        // 10-digit Indian number, stored without +91
  relationship: string;
}

// ─── Risk Assessment ───────────────────────────────────────────────────────────
/**
 * What WE send to the backend /api/risk-score endpoint.
 * IMPORTANT: Unlike the prototype, we ONLY send coordinates + timestamp.
 * The backend and ML service derive crime_density, is_isolated, etc. themselves.
 * The mobile app has no business hardcoding environmental ML features.
 */
export interface RiskScoreRequest {
  latitude: number;
  longitude: number;
  timestamp: string; // ISO 8601
}

/**
 * What the backend returns after scoring.
 */
export interface RiskScoreResponse {
  risk_score?: number;          // 0-100 (returned by Python API)
  risk_level?: number;          // backwards compatibility
  risk_category: 'Low' | 'Medium' | 'High' | 'Critical';
  risk_factors: string[];
}

export interface RiskMapPoint extends RiskScoreResponse {
  latitude: number;
  longitude: number;
}

// ─── SOS ───────────────────────────────────────────────────────────────────────
/**
 * What WE send to the backend POST /api/sos endpoint.
 * No SMS logic here — that is entirely handled by Twilio on the backend.
 */
export interface SOSRequest {
  latitude: number;
  longitude: number;
}

export interface SOSResponse {
  sos_event_id: string;
  contacts_notified: number;
  police_station_notified: string;
}

// ─── Risk Display ──────────────────────────────────────────────────────────────
export type RiskCategory = 'Low' | 'Medium' | 'High' | 'Critical' | 'Unknown';
