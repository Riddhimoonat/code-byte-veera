from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
import requests 

# -------------------------
# Load model
# -------------------------
model = joblib.load("women_safety_xgb_model.pkl")


import requests

def get_poi_count(lat, lon, radius=500):
    query = f"""
    [out:json];
    node(around:{radius},{lat},{lon})["amenity"];
    out;
    """

    url = "https://overpass-api.de/api/interpreter"

    try:
        response = requests.post(url, data=query, timeout=5)
        data = response.json()
        return len(data.get("elements", []))
    except:
        return 5  # fallback if API fails

app = FastAPI()

# -------------------------
# Request Schema
# -------------------------
class RiskInput(BaseModel):
    latitude: float
    longitude: float
    hour: int
    crime_density: float
    poi_count: int

# -------------------------
# Prediction Function
# -------------------------
def predict_risk_final(model, input_df):
    row = input_df.iloc[0]

    score = 0

    # Night logic
    if row['hour'] >= 22 or row['hour'] <= 4:
        score += 35
    elif row['hour'] >= 18:
        score += 20

    # Isolation
    threshold = 5  # static (since no df_balanced here)
    if row['poi_count'] < threshold:
        score += 30
    elif row['poi_count'] < threshold * 2:
        score += 15

    # Crime density (non-linear)
    if row['crime_density'] < 2:
        score += row['crime_density'] * 8
    elif row['crime_density'] < 4:
        score += row['crime_density'] * 12
    else:
        score += row['crime_density'] * 18

    score = min(score, 100)

    # ML prediction
    probs = model.predict_proba(input_df)

    weights = [0, 70, 100]
    xgb_score = int(sum(p*w for p, w in zip(probs[0], weights)))

    # Combine
    final_score = int(0.6 * score + 0.4 * xgb_score)
    final_score = max(0, min(final_score, 100))

    # Risk Level
    if final_score < 30:
        level = "LOW"
    elif final_score < 65:
        level = "MEDIUM"
    else:
        level = "HIGH"

    return final_score, level

# -------------------------
# API Endpoint
# -------------------------
@app.post("/predict")
def predict(data: RiskInput):
    input_data = data.dict()

    # 🔥 get live POI count
    poi_count = get_poi_count(
        input_data["latitude"],
        input_data["longitude"]
    )


    # override value
    input_data["poi_count"] = poi_count
    input_df = pd.DataFrame([input_data])

    score, level = predict_risk_final(model, input_df)

    return {
        "risk_score": score,
        "risk_level": level
    }

# -------------------------
# Health Check
# -------------------------
@app.get("/")
def home():
    return {"status": "API is running 🚀"}

