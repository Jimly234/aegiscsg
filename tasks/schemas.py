from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class AlertStatus(str, Enum):
    ACTIVE = "active"
    ACKNOWLEDGED = "acknowledged"
    DISPATCHED = "dispatched"
    RESOLVED = "resolved"
    FALSE_ALARM = "false_alarm"

class AlertPriority(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class GeoLocation(BaseModel):
    lat: float
    lng: float
    accuracy: Optional[float] = None

class AIAnalysis(BaseModel):
    voices_detected: int
    language: str
    confidence: float
    keywords: List[str]
    stress_level: str
    vehicle_engine: bool
    threat_score: float

class LogEntry(BaseModel):
    id: str
    timestamp: str
    message: str
    author: str
    type: str

class AlertBase(BaseModel):
    victim_name: str
    victim_age: Optional[int] = None
    victim_gender: Optional[str] = None
    location: GeoLocation
    address: Optional[str] = None
    priority: AlertPriority = AlertPriority.MEDIUM
    battery_level: Optional[int] = None
    signal_strength: Optional[str] = None

class AlertCreate(AlertBase):
    device_id: str
    user_id: str

class AlertResponse(AlertBase):
    id: str
    status: AlertStatus
    timestamp: datetime
    guardians_notified: int = 0
    guardians_acknowledged: int = 0
    audio_streaming: bool = False
    speed: Optional[float] = None
    heading: Optional[str] = None
    movement_pattern: Optional[str] = None
    ai_analysis: Optional[AIAnalysis] = None
    log_entries: List[LogEntry] = []

class GuardianBase(BaseModel):
    name: str
    relationship: str
    phone: str
    user_id: str

class GuardianResponse(GuardianBase):
    id: str
    status: str
    location: Optional[GeoLocation] = None
    distance: Optional[float] = None
    last_seen: Optional[datetime] = None
    message: Optional[str] = None

class ResponseUnitBase(BaseModel):
    name: str
    unit_type: str
    region: str

class ResponseUnitResponse(ResponseUnitBase):
    id: str
    status: str
    location: Optional[GeoLocation] = None
    eta: Optional[int] = None
    current_alert: Optional[str] = None

class SafeZone(BaseModel):
    id: str
    name: str
    type: str
    location: GeoLocation
    address: Optional[str] = None
    phone: Optional[str] = None
    capacity: Optional[int] = None
    status: str = "operational"

class RiskZoneBase(BaseModel):
    name: str
    risk_score: float = Field(ge=0.0, le=1.0)
    geometry: Dict[str, Any]
    factors: List[str]

class RiskZoneResponse(RiskZoneBase):
    id: str
    last_updated: datetime

class CommunityReportBase(BaseModel):
    location: GeoLocation
    description: str
    category: str

class CommunityReportResponse(CommunityReportBase):
    id: str
    timestamp: datetime
    votes: int = 0
    verified: bool = False

class RiskForecast(BaseModel):
    hour: int
    risk_level: float

class Statistics(BaseModel):
    total_alerts: int
    active_alerts: int
    resolved_today: int
    active_guardians: int
    sentinel_devices: int
    safe_zones: int
    risk_forecast: List[RiskForecast]

class AnomalyResult(BaseModel):
    anomaly_score: float
    confidence: float
    factors: List[str]

class RiskAssessment(BaseModel):
    location: GeoLocation
    risk_score: float
    threat_level: str
    recommendations: List[str]

class UserCreate(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    role: str = "citizen"

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    role: str
    region: Optional[str] = None
    unit: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

class EvidenceEntry(BaseModel):
    id: str
    alert_id: str
    entry_type: str
    data: Dict[str, Any]
    hash: str
    timestamp: datetime
    verified: bool = False

class SensorEvent(BaseModel):
    device_id: str
    event_type: str
    timestamp: int
    location: tuple[float, float]
    data: Dict[str, Any]
