from fastapi import APIRouter
from .auth import router as auth_router
from .teams import router as teams_router
from .dispatches import router as dispatches_router

# Główny router
router = APIRouter()

# Dołączanie poszczególnych routerów
router.include_router(auth_router, tags=["authentication"])
router.include_router(teams_router, prefix="/api", tags=["teams"])
router.include_router(dispatches_router, prefix="/api", tags=["dispatches"])