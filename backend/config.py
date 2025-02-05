import os
from dotenv import load_dotenv
from pathlib import Path

# Załaduj zmienne środowiskowe z pliku .env
load_dotenv()


# Podstawowe ustawienia
class Settings:
    # Nazwa projektu
    PROJECT_NAME: str = "Medical Dispatch System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Backend URLs
    BACKEND_CORS_ORIGINS: list = [
        "http://localhost:3000",  # React web app
        "http://localhost:19006",  # React Native dev
        "http://localhost:19001",  # React Native web
        "http://localhost:19002",  # React Native web
    ]

    # MongoDB settings
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "medical_dispatch")

    # JWT settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

    # Firebase settings (dla powiadomień push)
    FIREBASE_CREDENTIALS_PATH: str = os.getenv(
        "FIREBASE_CREDENTIALS_PATH",
        str(Path(__file__).parent / "firebase-credentials.json")
    )

    # Security settings
    PASSWORD_MIN_LENGTH: int = 8
    MAX_LOGIN_ATTEMPTS: int = 5

    # Logging settings
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "app.log"


settings = Settings()