from .alerts import router as alerts_router
from .auth import router as auth_router
from .evidence import router as evidence_router
from .guardians import router as guardians_router
from .notifications import router as notifications_router
from .oracle import router as oracle_router
from .public import router as public_router
from .units import router as units_router

__all__ = [
    "alerts_router",
    "auth_router",
    "evidence_router",
    "guardians_router",
    "notifications_router",
    "oracle_router",
    "public_router",
    "units_router",
]
