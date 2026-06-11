from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
import uuid

from app.models.schemas import GuardianBase, GuardianResponse, GeoLocation

router = APIRouter()

guardians_db: dict[str, GuardianResponse] = {}

@router.post("/", response_model=GuardianResponse)
async def create_guardian(guardian: GuardianBase):
    guardian_id = f"G-{uuid.uuid4().hex[:4].upper()}"
    new_guardian = GuardianResponse(
        id=guardian_id,
        name=guardian.name,
        relationship=guardian.relationship,
        phone=guardian.phone,
        user_id=guardian.user_id,
        status="offline",
    )
    guardians_db[guardian_id] = new_guardian
    return new_guardian

@router.get("/", response_model=List[GuardianResponse])
async def list_guardians(user_id: str = None):
    result = list(guardians_db.values())
    if user_id:
        result = [g for g in result if g.user_id == user_id]
    return result

@router.get("/{guardian_id}", response_model=GuardianResponse)
async def get_guardian(guardian_id: str):
    if guardian_id not in guardians_db:
        raise HTTPException(status_code=404, detail="Guardian not found")
    return guardians_db[guardian_id]

@router.patch("/{guardian_id}/location")
async def update_guardian_location(guardian_id: str, location: GeoLocation):
    if guardian_id not in guardians_db:
        raise HTTPException(status_code=404, detail="Guardian not found")
    guardian = guardians_db[guardian_id]
    guardian.location = location
    guardian.last_seen = datetime.utcnow()
    guardian.status = "online"
    return guardian

@router.post("/{guardian_id}/acknowledge")
async def guardian_acknowledge(guardian_id: str):
    if guardian_id not in guardians_db:
        raise HTTPException(status_code=404, detail="Guardian not found")
    guardian = guardians_db[guardian_id]
    guardian.status = "acknowledged"
    return guardian
