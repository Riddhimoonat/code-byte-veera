# 🚀 VEERA – Women Safety Risk Prediction API

A real-time, context-aware machine learning API that predicts safety risk based on user location, time, and environmental conditions.

---

## 🧠 Overview

This API uses:

* 📍 **User Location (Latitude & Longitude)**
* ⏰ **Time of Day**
* 🌍 **Real-time Environmental Data (POI)**
* 🧠 **Machine Learning Model (XGBoost)**

To predict a **risk score** and classify it into:

* 🟢 LOW
* 🟡 MEDIUM
* 🔴 HIGH

---

## ⚙️ How It Works

### 1️⃣ Input from User

```json
{
  "latitude": 23.30,
  "longitude": 77.40,
  "hour": 23
}
```

---

### 2️⃣ Real-Time Data Processing

#### 🔹 POI (Points of Interest)

* Fetched using OpenStreetMap (Overpass API)
* Counts nearby amenities (shops, cafes, etc.)
* Determines **activity level of area**

#### 🔹 Crime Density (Estimated)

* Derived from POI count (isolation logic)
* Fewer POIs → Higher risk
* More POIs → Safer environment

---

### 3️⃣ Risk Calculation

#### Rule-Based Factors:

* 🌙 Night time → higher risk
* 🏝️ Isolation → higher risk
* 🚨 Crime density → higher risk

#### ML Model:

* XGBoost predicts probability of risk classes

#### Final Score:

```text
Final Score = 60% Rule-based + 40% ML prediction
```

---

## 📦 API Endpoint

### 🔸 POST `/predict`

#### Request Body:

```json
{
  "latitude": 23.30,
  "longitude": 77.40,
  "hour": 23
}
```

#### Response:

```json
{
  "risk_score": 72,
  "risk_level": "HIGH"
}
```

---

## 🧪 Testing the API

### 🔹 Swagger UI

After running the server:

```bash
http://localhost:8000/docs
```

---

### 🔹 cURL Example

```bash
curl -X POST "http://localhost:8000/predict" \
-H "Content-Type: application/json" \
-d '{
  "latitude": 23.30,
  "longitude": 77.40,
  "hour": 23
}'
```

---

## 🐳 Docker Setup

### Build Image

```bash
docker build -t veera-ml-api .
```

### Run Container

```bash
docker run -p 8000:8000 veera-ml-api
```

---

## ☁️ Deployment

The API is deployed using:

* 🐳 Docker
* 🌐 Render (cloud hosting)
* 📦 Docker Hub (image registry)

---

## 🧠 Tech Stack

* Python
* FastAPI
* XGBoost
* Pandas / NumPy
* OpenStreetMap API
* Docker
* Render

---

## 🎯 Key Features

✅ Real-time POI integration
✅ Dynamic crime estimation
✅ Hybrid ML + rule-based model
✅ Clean and minimal API
✅ Fully containerized deployment

---

## ⚠️ Notes

* Crime density is estimated (no real-time crime API available)
* POI data depends on OpenStreetMap availability
* Fallback values are used if external API fails

---

## 🎤 Project Insight

> “This system combines machine learning with real-time environmental awareness to provide context-driven safety predictions.”

---

## 👨‍💻 Author

Developed as part of a hackathon project focused on women safety and AI-based risk prediction.

---
