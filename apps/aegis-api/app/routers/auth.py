from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
import uuid

from app.models.schemas import UserCreate, UserResponse, Token
from pydantic import BaseModel

router = APIRouter()

users_db: dict[str, UserResponse] = {}
device_db: dict[str, dict] = {}

class DeviceRegister(BaseModel):
    device_id: str
    platform: str = "android"
    platform_version: str = "unknown"
    app_version: str = "2.0.0"
    device_model: str = "unknown"

@router.post("/device/register")
async def register_device(device: DeviceRegister):
    device_db[device.device_id] = device.model_dump()
    return {
        "device_id": device.device_id,
        "token": f"aegis_token_{device.device_id}",
        "api_key": f"aegis_sk_{device.device_id}",
        "status": "registered"
    }

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    if any(u.email == user.email for u in users_db.values()):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"U-{uuid.uuid4().hex[:6].upper()}"
    new_user = UserResponse(
        id=user_id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role,
    )
    users_db[user_id] = new_user
    return new_user

@router.post("/login", response_model=Token)
async def login(email: str, password: str):
    user = next((u for u in users_db.values() if u.email == email), None)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Demo token
    return Token(
        access_token=f"demo_token_{user.id}_{uuid.uuid4().hex[:8]}",
        expires_in=1800,
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user():
    # Demo - return first user
    if users_db:
        return list(users_db.values())[0]
    return UserResponse(
        id="U-DEMO",
        name="Demo User",
        email="demo@aegis.ng",
        phone="+234 810 000 0000",
        role="citizen",
    )
