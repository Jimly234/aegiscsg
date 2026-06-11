from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import get_settings
from app.routers import (
    alerts_router, auth_router, evidence_router, guardians_router,
    notifications_router, oracle_router, public_router, units_router,
)
from app.services.websocket_manager import ConnectionManager

settings = get_settings()
ws_manager = ConnectionManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    print(f"=== Aegis CSG API v{settings.version} Starting ===")
    yield
    print("=== Aegis CSG API Shutting Down ===")


app = FastAPI(
    title=settings.app_name,
    description="Civilian Safety Grid - Multi-layered safety technology system",
    version=settings.version,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(alerts_router, prefix="/api/v1/alerts", tags=["Alerts"])
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(evidence_router, prefix="/api/v1/evidence", tags=["Evidence"])
app.include_router(guardians_router, prefix="/api/v1/guardians", tags=["Guardians"])
app.include_router(notifications_router, prefix="/api/v1/notifications", tags=["Notifications"])
app.include_router(oracle_router, prefix="/api/v1/oracle", tags=["Oracle"])
app.include_router(public_router, prefix="/api/v1/public", tags=["Public"])
app.include_router(units_router, prefix="/api/v1/units", tags=["Units"])


@app.get("/")
async def root():
    return {
        "name": settings.app_name,
        "version": settings.version,
        "status": "operational",
        "environment": "production" if not settings.debug else "development",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.version}


@app.get("/api/v1/status")
async def system_status():
    return {
        "api": "operational",
        "version": settings.version,
        "services": {
            "database": "connected",
            "redis": "connected",
            "kafka": "connected",
            "blockchain": "connected",
        },
        "timestamp": "2026-06-10T00:00:00Z",
    }


# WebSocket endpoints for real-time communication
@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    await ws_manager.connect(websocket, "alerts")
    try:
        while True:
            data = await websocket.receive_json()
            await ws_manager.broadcast_to_group("alerts", data)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, "alerts")


@app.websocket("/ws/command")
async def websocket_command(websocket: WebSocket):
    await ws_manager.connect(websocket, "command")
    try:
        while True:
            data = await websocket.receive_json()
            await ws_manager.broadcast_to_group("command", data)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, "command")


@app.websocket("/ws/guardians")
async def websocket_guardians(websocket: WebSocket):
    await ws_manager.connect(websocket, "guardians")
    try:
        while True:
            data = await websocket.receive_json()
            await ws_manager.broadcast_to_group("guardians", data)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, "guardians")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
    )
