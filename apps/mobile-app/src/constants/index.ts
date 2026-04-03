// ─── Color Palette ─────────────────────────────────────────────────────────────
// Deep dark navy inspired by safety/security apps (think police dashboards)
export const COLORS = {
  background: '#0f0f14',
  surface: '#1a1a24',
  surfaceElevated: '#22222f',
  border: '#2e2e3e',

  primary: '#e85d5d',       // Veera red
  primaryDark: '#c94848',
  primaryGlow: 'rgba(232, 93, 93, 0.25)',

  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  critical: '#dc2626',

  textPrimary: '#f1f1f5',
  textSecondary: '#9191a8',
  textMuted: '#55556a',

  // Risk level colours — map these to risk_category from backend
  riskLow: '#22c55e',
  riskMedium: '#f59e0b',
  riskHigh: '#ef4444',
  riskCritical: '#dc2626',
  riskUnknown: '#55556a',
};

// ─── Typography ────────────────────────────────────────────────────────────────
export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  hero: 36,
};

// ─── Spacing ───────────────────────────────────────────────────────────────────
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ─── SOS Config ────────────────────────────────────────────────────────────────
/**
 * How long the user must hold the SOS button before it arms (milliseconds).
 * Spec: 3 seconds. Prevents accidental triggers.
 */
export const SOS_HOLD_DURATION_MS = 3000;

/**
 * After arming, how many seconds the cancel countdown lasts before SOS fires.
 */
export const SOS_CANCEL_WINDOW_SECONDS = 5;

/**
 * Maximum number of emergency contacts allowed per user.
 */
export const MAX_CONTACTS = 5;

// ─── Background Task Names ─────────────────────────────────────────────────────
export const BACKGROUND_RISK_POLL_TASK = 'VEERA_BACKGROUND_RISK_POLL';
export const BACKGROUND_LOCATION_TASK = 'VEERA_BACKGROUND_LOCATION';

// ─── Risk Polling Interval ─────────────────────────────────────────────────────
/**
 * How often the background task polls /api/risk-score.  Spec: 60 seconds.
 */
export const RISK_POLL_INTERVAL_SECONDS = 60;

/**
 * If risk_level returned from backend >= this threshold, fire a push notification.
 */
export const HIGH_RISK_NOTIFICATION_THRESHOLD = 75;

// ─── AsyncStorage Keys ─────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  CONTACTS: '@veera/emergency_contacts',
  USER_NAME: '@veera/user_name',
  AUTH_TOKEN: '@veera/auth_token',
  LAST_RISK_SCORE: '@veera/last_risk_score',
};

// ─── Backend API Endpoints ─────────────────────────────────────────────────────
// Base URL is read from EXPO_PUBLIC_API_BASE_URL env var at runtime.
// These are the path suffixes only.
export const API_PATHS = {
  RISK_SCORE: '/risk-score',
  SOS: '/sos',
  CONTACTS_GET: '/contacts',
  CONTACTS_POST: '/contacts',
  CONTACTS_DELETE: (id: string) => `/contacts/${id}`,
};
