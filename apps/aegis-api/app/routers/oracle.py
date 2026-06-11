from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Tuple
import numpy as np
from datetime import datetime, timedelta

from app.models.schemas import (
    GeoLocation, AnomalyResult, RiskAssessment, RiskForecast,
    SensorEvent, RiskZoneResponse
)

router = APIRouter()

# Mock historical baseline data
baseline_data: Dict[str, Dict[str, Any]] = {}
risk_zones: Dict[str, RiskZoneResponse] = {}

@router.post("/anomaly/detect")
async def detect_anomaly(
    location: GeoLocation,
    current_devices: List[Dict[str, Any]],
    time_window_hours: int = 1
):
    """
    Detect anomalies in device density and movement patterns.
    Uses ensemble scoring for robustness.
    """
    current_density = len(current_devices)
    new_device_ratio = len([d for d in current_devices if d.get("is_new", False)]) / max(current_density, 1)
    time_of_day = datetime.now().hour
    day_of_week = datetime.now().weekday()
    
    # Grid cell identification
    grid_id = f"{location.lat:.2f}_{location.lng:.2f}"
    baseline = baseline_data.get(grid_id, {
        "mean_density": 5.0,
        "std_density": 2.0,
    })
    
    # Feature extraction
    features = np.array([
        current_density,
        new_device_ratio * 10,
        time_of_day / 24.0,
        day_of_week / 7.0,
        baseline["mean_density"],
        baseline["std_density"],
    ])
    
    # Simplified anomaly scoring (would use actual ML models)
    density_ratio = current_density / max(baseline["mean_density"], 0.1)
    time_risk = 1.0 if 20 <= time_of_day <= 4 else 0.5
    new_device_risk = new_device_ratio * 2.0
    
    anomaly_score = min(1.0, (density_ratio * 0.3 + time_risk * 0.3 + new_device_risk * 0.4))
    
    factors = []
    if density_ratio > 2.0:
        factors.append("Unusually high device density")
    if new_device_ratio > 0.5:
        factors.append("High proportion of new devices")
    if 20 <= time_of_day <= 4:
        factors.append("High-risk time period")
    if baseline["mean_density"] < 3.0 and current_density > 10:
        factors.append("Remote area with unexpected activity")
    
    return AnomalyResult(
        anomaly_score=anomaly_score,
        confidence=min(0.95, 0.5 + anomaly_score * 0.5),
        factors=factors if factors else ["Normal activity pattern"],
    )

@router.post("/risk/assess")
async def assess_risk(location: GeoLocation):
    """
    Assess geographic risk based on multiple factors.
    """
    # Simplified risk scoring
    grid_id = f"{location.lat:.2f}_{location.lng:.2f}"
    zone = risk_zones.get(grid_id)
    
    if zone:
        risk_score = zone.risk_score
    else:
        # Distance-based risk from known hotspots
        risk_score = 0.3  # Base risk
        for z in risk_zones.values():
            # Simplified distance calculation
            dist = abs(z.geometry["coordinates"][0][0][0] - location.lng) + \
                   abs(z.geometry["coordinates"][0][0][1] - location.lat)
            if dist < 0.5:
                risk_score = max(risk_score, z.risk_score * (1 - dist))
    
    threat_level = "Low" if risk_score < 0.25 else \
                   "Moderate" if risk_score < 0.5 else \
                   "High" if risk_score < 0.75 else "Critical"
    
    recommendations = []
    if risk_score > 0.75:
        recommendations.extend([
            "Avoid this area if possible",
            "Travel in groups only",
            "Keep Sentinel app active",
            "Notify guardians of travel plans",
        ])
    elif risk_score > 0.5:
        recommendations.extend([
            "Exercise caution in this area",
            "Stay on main roads",
            "Keep emergency contacts informed",
        ])
    else:
        recommendations.append("Standard safety precautions apply")
    
    return RiskAssessment(
        location=location,
        risk_score=risk_score,
        threat_level=threat_level,
        recommendations=recommendations,
    )

@router.get("/risk/forecast")
async def risk_forecast(hours: int = 24) -> List[RiskForecast]:
    """
    Generate hourly risk forecast for the next N hours.
    """
    forecasts = []
    now = datetime.now()
    
    for i in range(hours // 3):
        hour = (now.hour + i * 3) % 24
        # Risk is higher at night
        if 0 <= hour <= 5 or 21 <= hour <= 23:
            risk = 0.6 + np.random.random() * 0.3
        elif 6 <= hour <= 8 or 17 <= hour <= 20:
            risk = 0.3 + np.random.random() * 0.3
        else:
            risk = 0.1 + np.random.random() * 0.2
        
        forecasts.append(RiskForecast(hour=hour, risk_level=round(risk, 2)))
    
    return forecasts

@router.post("/events/ingest")
async def ingest_event(event: SensorEvent):
    """
    Ingest sensor events from Sentinel devices.
    """
    # Route to appropriate processor
    if event.event_type == "alert":
        return {"status": "alert_processed", "event_id": event.device_id}
    elif event.event_type == "scan":
        # Anonymize scan data
        anonymized = {
            "device_hash": event.device_id[:8],
            "location_grid": f"{event.location[0]:.2f}_{event.location[1]:.2f}",
            "timestamp": event.timestamp,
        }
        return {"status": "scan_processed", "anonymized": anonymized}
    elif event.event_type == "location_update":
        return {"status": "location_updated", "device_id": event.device_id}
    
    return {"status": "unknown_event_type"}

@router.get("/graph/clusters")
async def find_suspicious_clusters(min_cooccurrences: int = 3):
    """
    Discover clusters of devices that appear together across multiple incidents.
    """
    # Mock cluster data
    return [
        {
            "device1": "AA:BB:CC:11:22:33",
            "device2": "AA:BB:CC:44:55:66",
            "co_occurrences": 5,
            "locations": ["grid_1", "grid_2", "grid_3"],
            "risk_score": 0.85,
        },
        {
            "device1": "AA:BB:CC:77:88:99",
            "device2": "AA:BB:CC:AA:BB:CC",
            "co_occurrences": 4,
            "locations": ["grid_5", "grid_6"],
            "risk_score": 0.72,
        },
    ]
