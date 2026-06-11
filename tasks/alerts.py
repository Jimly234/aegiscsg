from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
import uuid

from app.models.schemas import (
    AlertCreate, AlertResponse, AlertStatus, AlertPriority,
    GeoLocation, AIAnalysis, LogEntry
)

router = APIRouter()

# In-memory storage for demo
alerts_db: dict[str, AlertResponse] = {}

@router.post("/", response_model=AlertResponse)
async def create_alert(alert: AlertCreate):
    alert_id = f"ALT-{uuid.uuid4().hex[:4].upper()}"
    new_alert = AlertResponse(
        id=alert_id,
        victim_name=alert.victim_name,
        victim_age=alert.victim_age,
        victim_gender=alert.victim_gender,
        location=alert.location,
        address=alert.address,
        status=AlertStatus.ACTIVE,
        priority=alert.priority,
        timestamp=datetime.utcnow(),
        battery_level=alert.battery_level,
        signal_strength=alert.signal_strength,
        guardians_notified=0,
        guardians_acknowledged=0,
        audio_streaming=False,
        log_entries=[
            LogEntry(
                id=f"L{uuid.uuid4().hex[:4]}",
                timestamp=datetime.utcnow().isoformat(),
                message="Alert received from Sentinel device",
                author="System",
                type="system",
            )
        ],
    )
    alerts_db[alert_id] = new_alert
    return new_alert

@router.get("/", response_model=List[AlertResponse])
async def list_alerts(
    status: Optional[AlertStatus] = None,
    priority: Optional[AlertPriority] = None,
    skip: int = 0,
    limit: int = 100,
):
    result = list(alerts_db.values())
    if status:
        result = [a for a in result if a.status == status]
    if priority:
        result = [a for a in result if a.priority == priority]
    return result[skip:skip + limit]

@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(alert_id: str):
    if alert_id not in alerts_db:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alerts_db[alert_id]

@router.patch("/{alert_id}")
async def update_alert(alert_id: str, updates: dict):
    if alert_id not in alerts_db:
        raise HTTPException(status_code=404, detail="Alert not found")
    current = alerts_db[alert_id]
    for field, value in updates.items():
        if hasattr(current, field):
            setattr(current, field, value)
    alerts_db[alert_id] = current
    return current

@router.post("/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str, guardian_id: str):
    if alert_id not in alerts_db:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert = alerts_db[alert_id]
    alert.guardians_acknowledged += 1
    alert.log_entries.append(
        LogEntry(
            id=f"L{uuid.uuid4().hex[:4]}",
            timestamp=datetime.utcnow().isoformat(),
            message=f"Guardian {guardian_id} acknowledged alert",
            author="System",
            type="system",
        )
    )
    return alert

@router.post("/{alert_id}/dispatch")
async def dispatch_alert(alert_id: str, unit_id: str):
    if alert_id not in alerts_db:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert = alerts_db[alert_id]
    alert.status = AlertStatus.DISPATCHED
    alert.log_entries.append(
        LogEntry(
            id=f"L{uuid.uuid4().hex[:4]}",
            timestamp=datetime.utcnow().isoformat(),
            message=f"Unit {unit_id} dispatched to alert",
            author="System",
            type="system",
        )
    )
    return alert

@router.post("/{alert_id}/resolve")
async def resolve_alert(alert_id: str, resolution_notes: Optional[str] = None):
    if alert_id not in alerts_db:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert = alerts_db[alert_id]
    alert.status = AlertStatus.RESOLVED
    alert.log_entries.append(
        LogEntry(
            id=f"L{uuid.uuid4().hex[:4]}",
            timestamp=datetime.utcnow().isoformat(),
            message=f"Alert resolved. Notes: {resolution_notes or 'None'}",
            author="Officer",
            type="officer",
        )
    )
    return alert
