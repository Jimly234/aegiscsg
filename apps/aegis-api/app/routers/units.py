from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
import uuid

from app.models.schemas import ResponseUnitBase, ResponseUnitResponse, GeoLocation

router = APIRouter()

units_db: dict[str, ResponseUnitResponse] = {}

@router.post("/", response_model=ResponseUnitResponse)
async def create_unit(unit: ResponseUnitBase):
    unit_id = f"U-{uuid.uuid4().hex[:4].upper()}"
    new_unit = ResponseUnitResponse(
        id=unit_id,
        name=unit.name,
        unit_type=unit.unit_type,
        region=unit.region,
        status="available",
    )
    units_db[unit_id] = new_unit
    return new_unit

@router.get("/", response_model=List[ResponseUnitResponse])
async def list_units(region: str = None, status: str = None):
    result = list(units_db.values())
    if region:
        result = [u for u in result if u.region == region]
    if status:
        result = [u for u in result if u.status == status]
    return result

@router.get("/{unit_id}", response_model=ResponseUnitResponse)
async def get_unit(unit_id: str):
    if unit_id not in units_db:
        raise HTTPException(status_code=404, detail="Unit not found")
    return units_db[unit_id]

@router.patch("/{unit_id}/location")
async def update_unit_location(unit_id: str, location: GeoLocation):
    if unit_id not in units_db:
        raise HTTPException(status_code=404, detail="Unit not found")
    unit = units_db[unit_id]
    unit.location = location
    return unit

@router.post("/{unit_id}/dispatch")
async def dispatch_unit(unit_id: str, alert_id: str):
    if unit_id not in units_db:
        raise HTTPException(status_code=404, detail="Unit not found")
    unit = units_db[unit_id]
    unit.status = "responding"
    unit.current_alert = alert_id
    unit.eta = 15
    return unit

@router.post("/{unit_id}/return")
async def return_unit(unit_id: str):
    if unit_id not in units_db:
        raise HTTPException(status_code=404, detail="Unit not found")
    unit = units_db[unit_id]
    unit.status = "available"
    unit.current_alert = None
    unit.eta = None
    return unit
