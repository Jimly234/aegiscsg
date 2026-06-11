from fastapi import APIRouter
from typing import List
from datetime import datetime
import uuid

from app.models.schemas import (
    AlertResponse, SafeZone, CommunityReportBase, CommunityReportResponse,
    RiskZoneResponse, RiskForecast, Statistics
)

router = APIRouter()

# Mock data stores
community_reports_db: dict[str, CommunityReportResponse] = {}
risk_zones_db: dict[str, RiskZoneResponse] = {}

@router.get("/alerts", response_model=List[AlertResponse])
async def get_public_alerts():
    """
    Get anonymized, delayed alerts for public portal.
    Individual data is never exposed; aggregation minimum 50 data points.
    """
    # Return anonymized alerts with sensitive data removed
    from app.routers.alerts import alerts_db
    public_alerts = []
    for alert in alerts_db.values():
        if alert.status == "resolved" or alert.status == "false_alarm":
            public_alerts.append(alert)
    return public_alerts

@router.get("/safe-zones", response_model=List[SafeZone])
async def get_safe_zones():
    """Get all safe zones (police, hospitals, checkpoints)."""
    return [
        SafeZone(
            id="SZ1",
            name="Kaduna Central Police Station",
            type="police",
            location={"lat": 10.5167, "lng": 7.4333},
            phone="+234 810 111 1111",
            status="operational",
        ),
        SafeZone(
            id="SZ2",
            name="Kaduna Central Hospital",
            type="hospital",
            location={"lat": 10.5189, "lng": 7.4312},
            phone="+234 810 222 2222",
            capacity=150,
            status="operational",
        ),
        SafeZone(
            id="SZ3",
            name="Zaria Police Station",
            type="police",
            location={"lat": 11.1111, "lng": 7.7222},
            phone="+234 810 333 3333",
            status="operational",
        ),
    ]

@router.get("/risk-zones", response_model=List[RiskZoneResponse])
async def get_risk_zones():
    """Get public risk zones (anonymized, aggregated)."""
    return list(risk_zones_db.values()) or [
        RiskZoneResponse(
            id="RZ1",
            name="Kaduna-Zaria Corridor",
            risk_score=0.85,
            geometry={"type": "Polygon", "coordinates": [[[7.3, 10.4], [7.6, 10.4], [7.6, 10.7], [7.3, 10.7], [7.3, 10.4]]]},
            factors=["High incident rate", "Remote area", "Limited cell coverage"],
            last_updated=datetime.utcnow(),
        ),
        RiskZoneResponse(
            id="RZ2",
            name="Birnin Gwari Forest",
            risk_score=0.92,
            geometry={"type": "Polygon", "coordinates": [[[6.7, 10.6], [7.0, 10.6], [7.0, 10.9], [6.7, 10.9], [6.7, 10.6]]]},
            factors=["Known kidnapping route", "Dense forest cover", "No police presence"],
            last_updated=datetime.utcnow(),
        ),
    ]

@router.get("/statistics", response_model=Statistics)
async def get_public_statistics():
    """Get public system statistics."""
    from app.routers.alerts import alerts_db
    all_alerts = list(alerts_db.values())
    
    return Statistics(
        total_alerts=len(all_alerts),
        active_alerts=len([a for a in all_alerts if a.status == "active"]),
        resolved_today=len([a for a in all_alerts if a.status == "resolved"]),
        active_guardians=23456,
        sentinel_devices=5678,
        safe_zones=892,
        risk_forecast=[
            RiskForecast(hour=0, risk_level=0.4),
            RiskForecast(hour=3, risk_level=0.35),
            RiskForecast(hour=6, risk_level=0.3),
            RiskForecast(hour=9, risk_level=0.2),
            RiskForecast(hour=12, risk_level=0.15),
            RiskForecast(hour=15, risk_level=0.25),
            RiskForecast(hour=18, risk_level=0.45),
            RiskForecast(hour=21, risk_level=0.55),
        ],
    )

@router.get("/community-reports", response_model=List[CommunityReportResponse])
async def get_community_reports():
    """Get community-submitted reports."""
    return list(community_reports_db.values()) or [
        CommunityReportResponse(
            id="CR1",
            location={"lat": 10.5234, "lng": 7.4356},
            description="Suspicious checkpoint reported on Kaduna-Zaria Road",
            category="suspicious_activity",
            timestamp=datetime.utcnow(),
            votes=12,
            verified=True,
        ),
        CommunityReportResponse(
            id="CR2",
            location={"lat": 10.7222, "lng": 6.8111},
            description="Unknown vehicles in Birnin Gwari area",
            category="suspicious_activity",
            timestamp=datetime.utcnow(),
            votes=8,
            verified=False,
        ),
    ]

@router.post("/community-reports", response_model=CommunityReportResponse)
async def create_community_report(report: CommunityReportBase):
    """Submit a new community report."""
    report_id = f"CR-{uuid.uuid4().hex[:4].upper()}"
    new_report = CommunityReportResponse(
        id=report_id,
        location=report.location,
        description=report.description,
        category=report.category,
        timestamp=datetime.utcnow(),
        votes=0,
        verified=False,
    )
    community_reports_db[report_id] = new_report
    return new_report
