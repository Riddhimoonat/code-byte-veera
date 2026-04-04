# 🛡️ VEERA - Women Safety Platform

> **AI-powered personal safety companion with real-time risk assessment, SOS alerting, and emergency response coordination**

Veera is a comprehensive safety platform that combines machine learning, real-time location tracking, and instant emergency communication to protect women in potentially dangerous situations. The system uses environmental data, time-based analysis, and crowd-sourced intelligence to predict risk levels and enable rapid response when needed.

---

## 🎯 The Problem We're Solving

Women face safety concerns when traveling alone, especially in unfamiliar areas or during late hours. Traditional safety apps either:
- Require manual activation (often too late)
- Lack intelligent risk assessment
- Don't integrate with emergency services
- Fail to work in background/offline scenarios

Veera addresses all these gaps with a proactive, intelligent, and reliable safety system.

---

## 💡 Our Solution

### Core Features

1. **AI-Powered Risk Assessment**
   - Real-time risk scoring (0-100) based on location, time, and environmental factors
   - Machine learning model trained on safety datasets
   - Dynamic POI (Points of Interest) analysis using OpenStreetMap
   - Automatic risk level categorization: Low, Medium, High, Critical

2. **Smart SOS System**
   - 3-second hold activation (prevents accidental triggers)
   - 5-second cancellation window
   - Automatic SMS alerts to up to 5 emergency contacts
   - Police station notification with exact coordinates
   - Background operation even when app is closed

3. **Emergency Contact Management**
   - Store up to 5 trusted contacts
   - Quick-access contact bar on home screen
   - Offline-first storage with cloud sync
   - One-tap emergency calling

4. **Interactive Risk Map**
   - Visual heat map showing risk levels in surrounding areas
   - Real-time location tracking
   - Nearest police station markers
   - Dark mode optimized for night use

5. **Background Monitoring**
   - Continuous location tracking (with user consent)
   - Automatic risk assessment every 5 minutes
   - Low battery optimization
   - Works even when app is minimized

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────┐
│  Mobile App     │  React Native + Expo
│  (iOS/Android)  │  - User Interface
└────────┬────────┘  - Location Services
         │           - Local Storage
         │
         ▼
┌─────────────────┐
│  Node.js API    │  Express + Socket.io
│  (Backend)      │  - Authentication (JWT)
└────────┬────────┘  - Contact Management
         │           - SOS Coordination
         │           - Twilio SMS Integration
         │
         ▼
┌─────────────────┐
│  ML Service     │  Python + FastAPI
│  (Risk Engine)  │  - XGBoost Model
└─────────────────┘  - POI Analysis
                     - Risk Scoring
```

### Technology Stack

#### Mobile App (`apps/mobile-app/`)
- **Framework**: React Native 0.74.5 with Expo 51
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State Management**: React Hooks + AsyncStorage
- **Location**: expo-location with background tracking
- **Maps**: react-native-maps
- **Notifications**: expo-notifications
- **Language**: TypeScript

#### Backend (`backend/`)
- **Runtime**: Node.js with ES Modules
- **Framework**: Express 5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Real-time**: Socket.io for live updates
- **SMS**: Twilio API
- **Language**: JavaScript (ES6+)

#### ML Service (`backend/ML/`)
- **Framework**: FastAPI
- **Model**: XGBoost Classifier
- **Data Processing**: Pandas, NumPy
- **External APIs**: OpenStreetMap Overpass API
- **Deployment**: Docker containerized
- **Language**: Python 3.9+

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- MongoDB (local or Atlas)
- Expo CLI (`npm install -g expo-cli`)
- Android Studio / Xcode (for mobile development)
- Twilio account (for SMS)

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/veera-safety.git
cd veera-safety
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI, Twilio credentials, etc.

# Seed initial data (police stations, etc.)
node seedData.js

# Start development server
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Setup ML Service

```bash
cd backend/ML

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn api:app --reload --port 8000
```

ML API runs on `http://localhost:8000`

### 4. Setup Mobile App

```bash
cd apps/mobile-app

# Install dependencies
npm install --legacy-peer-deps

# Configure environment
cp .env.example .env
# Set EXPO_PUBLIC_API_BASE_URL to your backend URL

# Start Expo development server
npx expo start

# Then press:
# 'a' for Android emulator
# 'i' for iOS simulator
# Scan QR code for physical device
```

---

## 📱 Mobile App Features

### Authentication Flow
- Phone number-based registration
- OTP verification (6-digit code)
- JWT token storage for persistent sessions
- Secure logout with token cleanup

### Home Screen
- Large SOS button with haptic feedback
- Real-time risk level badge
- Current location display with reverse geocoding
- Quick access to emergency contacts
- Last risk assessment timestamp

### Contacts Screen
- Add up to 5 emergency contacts
- Name, phone number, and relationship fields
- Swipe-to-delete functionality
- Automatic backend sync
- Offline-first architecture

### Risk Map Screen
- Interactive map with user location marker
- Risk level heat map overlay
- Nearest police stations with distance
- Pan and zoom controls
- Dark theme for night visibility

### Settings Screen
- User profile management
- SOS sensitivity adjustment
- Notification preferences
- Background tracking toggle
- App version and diagnostics

---

## 🧠 How the ML Model Works

### Input Features
1. **Latitude & Longitude**: User's current position
2. **Hour of Day**: Time-based risk factor (0-23)
3. **POI Count**: Real-time amenities nearby (fetched from OpenStreetMap)
4. **Crime Density**: Estimated from isolation level

### Risk Calculation Algorithm

```python
# Rule-based scoring (60% weight)
score = 0

# Night time risk
if hour >= 22 or hour <= 4:
    score += 35
elif hour >= 18:
    score += 20

# Isolation risk
if poi_count < 5:
    score += 30
elif poi_count < 10:
    score += 15

# Crime density impact
score += crime_density * (8 to 18)

# ML prediction (40% weight)
xgb_score = model.predict_proba(features)

# Final score
final_score = 0.6 * score + 0.4 * xgb_score
```

### Risk Categories
- **Low (0-29)**: Safe area, normal precautions
- **Medium (30-64)**: Moderate risk, stay alert
- **High (65-84)**: Elevated risk, avoid if possible
- **Critical (85-100)**: Dangerous, seek help immediately

---

## 🚨 SOS Flow

### User Triggers SOS
1. User holds SOS button for 3 seconds
2. Haptic feedback confirms activation
3. 5-second countdown modal appears
4. User can cancel within 5 seconds

### Backend Processing
1. Receives POST request with lat/lng
2. Finds nearest police station (Haversine formula)
3. Creates SOS event in database
4. Sends SMS to all emergency contacts via Twilio
5. Sends SMS to nearest police station
6. Emits real-time event to admin dashboard (Socket.io)
7. Returns confirmation to mobile app

### SMS Template
```
🚨 EMERGENCY ALERT 🚨
[Name] has triggered an SOS alert.
Location: [Address]
Coordinates: [Lat, Lng]
Time: [Timestamp]
Google Maps: https://maps.google.com/?q=[Lat],[Lng]
```

---

## 🔐 Security & Privacy

### Data Protection
- All API requests use JWT authentication
- Passwords hashed with bcrypt (12 rounds)
- Environment variables for sensitive credentials
- HTTPS enforced in production
- MongoDB connection with authentication

### Location Privacy
- Location data only stored during active sessions
- User can disable background tracking
- No location history retained after 24 hours
- Explicit permission requests for location access

### SMS Security
- Twilio API with secure credentials
- Rate limiting on SOS triggers (prevent spam)
- Contact verification before adding
- No SMS content stored in database

---

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  phone: String (unique, indexed),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Emergency Contacts Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  name: String,
  phone: String,
  relationship: String,
  createdAt: Date
}
```

### SOS Events Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  latitude: Number,
  longitude: Number,
  timestamp: Date,
  contactsNotified: Number,
  policeStationNotified: String,
  status: String (enum: active, resolved, false_alarm)
}
```

### Police Stations Collection
```javascript
{
  _id: ObjectId,
  name: String,
  phone: String,
  latitude: Number,
  longitude: Number,
  address: String,
  city: String,
  state: String
}
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Request OTP code
- `POST /api/auth/verify-otp` - Verify OTP and get JWT token

### Risk Assessment
- `POST /api/risk-score` - Get risk score for location
- `POST /api/risk-score/map` - Get risk map data for area
- `POST /api/risk-score/nearest-stations` - Find nearby police stations

### Emergency
- `POST /api/sos` - Trigger SOS alert
- `GET /api/sos/history` - Get user's SOS history

### Contacts
- `GET /api/contacts` - List user's emergency contacts
- `POST /api/contacts` - Add new emergency contact
- `DELETE /api/contacts/:id` - Remove emergency contact

---

## 🎨 Design Philosophy

### User Experience
- **Minimal friction**: SOS activation in under 3 seconds
- **Clear feedback**: Haptics, animations, and visual cues
- **Dark mode first**: Optimized for night use
- **Offline resilient**: Core features work without internet

### Visual Design
- **Color coding**: Intuitive risk level colors (green → red)
- **Large touch targets**: Easy to use in stressful situations
- **High contrast**: Readable in all lighting conditions
- **Consistent iconography**: Ionicons throughout

---

## 🧪 Testing

### Mobile App Testing
```bash
cd apps/mobile-app

# Run on Android emulator
npm run android

# Run on iOS simulator
npm run ios

# Test specific features
# - Add 5 contacts
# - Trigger SOS (cancel before 5 seconds)
# - Check background location updates
# - Verify offline contact storage
```

### Backend Testing
```bash
cd backend

# Test ML API connection
node test-ml.js

# Manual API testing with curl
curl -X POST http://localhost:5000/api/risk-score \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"latitude": 28.6139, "longitude": 77.2090, "timestamp": "2024-01-15T20:30:00Z"}'
```

### ML Service Testing
```bash
# Access Swagger UI
open http://localhost:8000/docs

# Test prediction endpoint
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"latitude": 28.6139, "longitude": 77.2090, "hour": 22}'
```

---

## 🚀 Deployment

### Backend Deployment (Render/Railway)
1. Push code to GitHub
2. Connect repository to Render
3. Set environment variables
4. Deploy as Web Service
5. Note the deployed URL

### ML Service Deployment (Docker)
```bash
cd backend/ML

# Build Docker image
docker build -t veera-ml-api .

# Push to Docker Hub
docker tag veera-ml-api your-username/veera-ml-api
docker push your-username/veera-ml-api

# Deploy to cloud (Render/Railway)
# Use Docker image: your-username/veera-ml-api
```

### Mobile App Deployment

#### Android
```bash
cd apps/mobile-app

# Build APK
eas build --platform android --profile production

# Or build locally
npx expo run:android --variant release
```

#### iOS
```bash
# Build IPA
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

---

## 🤝 Team Collaboration

### Project Structure
```
veera-safety/
├── apps/
│   └── mobile-app/          # Mobile team owns this
├── backend/
│   ├── src/                 # Backend team owns this
│   └── ML/                  # ML team owns this
└── README.md                # This file
```

### Development Workflow
1. **Mobile Team**: Focuses on UI/UX, location services, and offline features
2. **Backend Team**: Handles API, database, authentication, and Twilio integration
3. **ML Team**: Maintains risk model, POI integration, and prediction accuracy

### Communication
- Mobile app expects backend at `EXPO_PUBLIC_API_BASE_URL`
- Backend expects ML service at `ML_API_URL`
- All teams coordinate on API contract changes

---

## 📈 Future Enhancements

### Planned Features
- [ ] Live location sharing with trusted contacts
- [ ] Voice-activated SOS trigger
- [ ] Integration with local police APIs
- [ ] Community-reported incident markers
- [ ] Safe route recommendations
- [ ] Panic button widget for lock screen
- [ ] Apple Watch / Wear OS companion app
- [ ] Multi-language support
- [ ] Offline maps caching
- [ ] AI-powered threat detection from ambient audio

### ML Model Improvements
- [ ] Train on larger, more diverse datasets
- [ ] Incorporate real crime statistics APIs
- [ ] Weather condition integration
- [ ] Public transport safety scores
- [ ] Time-series analysis for pattern detection

---

## 🐛 Known Issues

1. **Background Location (iOS)**: Requires "Always Allow" permission, which App Store reviewers scrutinize heavily
2. **POI API Rate Limits**: OpenStreetMap Overpass API has rate limits; fallback values used
3. **SMS Delivery**: Twilio requires verified numbers in trial mode
4. **Battery Drain**: Continuous location tracking impacts battery life (optimizations in progress)

---

## 📄 License

This project is developed for educational and hackathon purposes. 

---

## 👥 Contributors

- **Mobile Development**: React Native + Expo implementation
- **Backend Development**: Node.js API + MongoDB + Twilio integration
- **ML Engineering**: XGBoost model + FastAPI service
- **UI/UX Design**: Dark mode interface + risk visualization

---

## 📞 Support

For questions, issues, or contributions:
- Open an issue on GitHub
- Contact the development team
- Check the documentation in each subdirectory

---

## 🙏 Acknowledgments

- OpenStreetMap for POI data
- Twilio for SMS infrastructure
- Expo team for excellent mobile development tools
- XGBoost community for ML framework
- All contributors and testers

---

**Built with ❤️ for women's safety**

*"Technology should empower everyone to feel safe, everywhere."*
