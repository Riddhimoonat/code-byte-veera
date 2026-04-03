# Veera — Mobile App

> **Personal safety app with SOS alerting and ML-based risk detection**
> Built with React Native + Expo for iOS & Android

---

## 📁 Project Structure

```
apps/mobile-app/
├── App.tsx                     # Root navigator (Stack + Bottom Tabs)
├── app.json                    # Expo config — permissions, plugins, bundle IDs
├── package.json
├── tsconfig.json               # Strict TypeScript + path aliases
├── babel.config.js             # Module resolver for @-aliases
├── .env.example                # Copy to .env and fill in backend URL
│
└── src/
    ├── screens/
    │   ├── HomeScreen.tsx      # SOS button, risk badge, quick contacts
    │   ├── ContactsScreen.tsx  # Manage up to 5 emergency contacts
    │   ├── RiskMapScreen.tsx   # react-native-maps + risk circle overlay
    │   └── SettingsScreen.tsx  # Profile, SOS sensitivity, notification toggle
    │
    ├── components/
    │   ├── SOSButton.tsx       # 3-second hold + 5-second cancel countdown
    │   ├── RiskLevelBadge.tsx  # Color-coded pill (Low/Medium/High/Critical)
    │   ├── LocationDisplay.tsx # Reverse-geocoded address widget
    │   ├── QuickContactsBar.tsx# Horizontal scroll of contact avatars
    │   └── AddContactModal.tsx # Bottom-sheet modal for adding contacts
    │
    ├── services/
    │   └── api.ts              # Axios client — all backend calls centralised
    │
    ├── hooks/
    │   ├── useContacts.ts      # AsyncStorage-backed emergency contacts state
    │   └── useLocation.ts      # Foreground location + reverse geocoding
    │
    ├── tasks/
    │   └── backgroundTasks.ts  # expo-task-manager background location + risk polling
    │
    ├── types/
    │   └── index.ts            # All TypeScript types + nav param lists
    │
    └── constants/
        └── index.ts            # Colors, spacing, SOS config, API paths
```

---

## 🚀 Getting Started

### 1. Setup Environment

```bash
cp .env.example .env
# Edit .env — set EXPO_PUBLIC_API_BASE_URL to the backend team's deployed URL
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Start the Dev Server

```bash
npx expo start

# Then:
#   Press 'a' for Android emulator
#   Press 'i' for iOS simulator
#   Scan QR code with Expo Go app on physical device
```

---

## 🔑 Key Architecture Decisions

### ✅ What was fixed from the old prototype

| Prototype Flaw | New Implementation |
|---|---|
| Single-tap SOS (accidental triggers) | `Pressable` with 3-second `delayLongPress` + haptics + 5-second cancel modal |
| `useState` contacts (lost on restart) | `AsyncStorage` via `useContacts` hook — persists across app restarts |
| Foreground `setInterval` "background" polling | `expo-task-manager` + `Location.startLocationUpdatesAsync` — true OS-level background |
| Mobile app computing `crime_density`, `isNight` | Only sends `lat/lng/timestamp` — backend + ML service computes all features |
| Native SMS via `Linking.openURL` hacks | Clean `POST /api/sos` — backend dispatches Twilio SMS to all contacts + police |
| Everything crammed into `main.tsx` | 4 dedicated screens in a proper bottom-tab navigator |
| No map screen | `react-native-maps` with dark theme + risk circle overlay |

### Background Task Priority
The `import './src/tasks/backgroundTasks'` at the **top** of `App.tsx` is intentional and critical.
Expo TaskManager requires task definitions to exist in the JS bundle before any component mounts — including when the OS wakes the app silently in the background.

---

## 🌐 Backend API Contract (coordinate with backend team)

| Endpoint | Method | Payload | Returns |
|---|---|---|---|
| `/api/risk-score` | POST | `{ latitude, longitude, timestamp }` | `{ risk_level, risk_category, risk_factors[] }` |
| `/api/sos` | POST | `{ latitude, longitude }` | `{ sos_event_id, contacts_notified, police_station_notified }` |
| `/api/contacts` | GET | — | `Contact[]` |
| `/api/contacts` | POST | `{ name, phone, relationship }` | `Contact` |
| `/api/contacts/:id` | DELETE | — | — |

The mobile app sends **only coordinates** to `/api/risk-score`. The backend + ML service handles all feature engineering (crime density, isolation, time-of-day, police proximity).

---

## 📋 Team Collaboration Notes

- **Mobile dev** owns: `apps/mobile-app/` only
- **Backend dev** owns: `backend/` or `node-service/`
- **ML dev** owns: `ml/` or `python-service/`
- **Dashboard dev** owns: `apps/dashboard/`

Update `EXPO_PUBLIC_API_BASE_URL` in your `.env` when the backend URL changes.
