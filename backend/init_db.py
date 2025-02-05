from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import asyncio
import os
from dotenv import load_dotenv

# Załaduj zmienne środowiskowe
load_dotenv()

# Konfiguracja
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "medical_dispatch")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    """Generuje hash hasła."""
    return pwd_context.hash(password)


async def init_database():
    # Połącz z bazą danych
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]

    try:
        # Utwórz indeksy
        await db.users.create_index("username", unique=True)
        await db.teams.create_index("name", unique=True)
        await db.dispatches.create_index([("created_at", -1)])

        # Dodaj przykładowych użytkowników
        test_users = [
            {
                "username": "dispatcher1",
                "hashed_password": get_password_hash("test123"),
                "role": "dispatcher",
                "full_name": "Jan Kowalski"
            },
            {
                "username": "medic1",
                "hashed_password": get_password_hash("test123"),
                "role": "medic",
                "full_name": "Anna Nowak"
            }
        ]

        # Usuń istniejących użytkowników testowych
        await db.users.delete_many({"username": {"$in": ["dispatcher1", "medic1"]}})

        # Dodaj nowych użytkowników
        await db.users.insert_many(test_users)
        print("Utworzono użytkowników testowych:")
        print("- Login: dispatcher1, hasło: test123 (dyspozytor)")
        print("- Login: medic1, hasło: test123 (ratownik)")

    except Exception as e:
        print(f"Błąd podczas inicjalizacji bazy danych: {e}")
    finally:
        client.close()


def main():
    asyncio.run(init_database())


if __name__ == "__main__":
    main()