import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from .routes import router
from .database import connect_to_mongo, close_mongo_connection
import logging
from fastapi.responses import JSONResponse
from flask import Flask
from utils.push_notifications import push_notifications_bp
from routes.dispatches import dispatches_bp

app = Flask(__name__)

# Rejestracja blueprintów
app.register_blueprint(push_notifications_bp)
app.register_blueprint(dispatches_bp)

# Konfiguracja logowania
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Inicjalizacja aplikacji FastAPI
app = FastAPI(
    title="Medical Dispatch System",
    description="System zarządzania zespołami ratownictwa medycznego",
    version="1.0.0"
)

# Konfiguracja CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://192.168.1.125:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Events
@app.on_event("startup")
async def startup_event():
    """Wykonywane przy starcie aplikacji"""
    await connect_to_mongo()
    logger.info("Connected to MongoDB")

@app.on_event("shutdown")
async def shutdown_event():
    """Wykonywane przy zamknięciu aplikacji"""
    await close_mongo_connection()
    logger.info("Disconnected from MongoDB")

# Middleware do obsługi wyjątków
@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        logger.error(f"Nieobsłużony wyjątek: {e}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Wystąpił wewnętrzny błąd serwera"}
        )

# Podstawowy endpoint
@app.get("/")
async def root():
    """
    Endpoint główny - informacje o API
    """
    return {
        "name": "Medical Dispatch System API",
        "version": "1.0.0",
        "status": "running"
    }

# Endpoint do sprawdzenia stanu serwera
@app.get("/health")
async def health_check():
    """
    Endpoint do sprawdzenia stanu serwera
    """
    return {
        "status": "healthy",
        "timestamp": "datetime.now().isoformat()"
    }

# Dołączenie routerów
app.include_router(router)

# Uruchomienie aplikacji (tylko w trybie developerskim)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)