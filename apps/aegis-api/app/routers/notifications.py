from fastapi import APIRouter
from typing import List
from datetime import datetime
import uuid

router = APIRouter()

notifications_db: list = []

@router.post("/sms")
async def send_sms_notification(phone: str, message: str, alert_id: str = None):
    """Send SMS notification via Africa's Talking or similar gateway."""
    notification = {
        "id": f"SMS-{uuid.uuid4().hex[:6].upper()}",
        "type": "sms",
        "recipient": phone,
        "message": message,
        "alert_id": alert_id,
        "status": "sent",
        "timestamp": datetime.utcnow().isoformat(),
    }
    notifications_db.append(notification)
    return notification

@router.post("/push")
async def send_push_notification(user_id: str, title: str, body: str, alert_id: str = None):
    """Send push notification to Sentinel app."""
    notification = {
        "id": f"PUSH-{uuid.uuid4().hex[:6].upper()}",
        "type": "push",
        "user_id": user_id,
        "title": title,
        "body": body,
        "alert_id": alert_id,
        "status": "delivered",
        "timestamp": datetime.utcnow().isoformat(),
    }
    notifications_db.append(notification)
    return notification

@router.post("/broadcast")
async def broadcast_notification(message: str, region: str = None):
    """Broadcast notification to all users in a region."""
    notification = {
        "id": f"BC-{uuid.uuid4().hex[:6].upper()}",
        "type": "broadcast",
        "message": message,
        "region": region,
        "status": "broadcasting",
        "timestamp": datetime.utcnow().isoformat(),
    }
    notifications_db.append(notification)
    return notification

@router.get("/")
async def list_notifications(limit: int = 50):
    return notifications_db[-limit:]
