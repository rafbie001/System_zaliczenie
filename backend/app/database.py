from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import os

from dotenv import load_dotenv

# Załaduj zmienne środowiskowe
load_dotenv()

# Konfiguracja bazy danych
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "medical_dispatch")


class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None


db = Database()


async def get_database() -> AsyncIOMotorDatabase:
    """
    Dependency function that returns database instance
    """
    return db.db


async def connect_to_mongo():
    """Creates database connection."""
    db.client = AsyncIOMotorClient(MONGODB_URL)
    db.db = db.client[DATABASE_NAME]


async def close_mongo_connection():
    """Closes database connection."""
    if db.client is not None:
        db.client.close()