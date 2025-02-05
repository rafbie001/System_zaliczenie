from fastapi import APIRouter, Depends, HTTPException, status
from ..utils.security import get_current_active_user
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..database import get_database
from bson import ObjectId
from typing import List
from ..models import Team, TeamCreate, TeamUpdate

router = APIRouter(tags=["teams"])


@router.post("/teams", response_model=Team)
async def create_team(
        team: TeamCreate,
        current_user: dict = Depends(get_current_active_user),
        db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Tworzy nowy zespół ratowniczy (tylko dla dyspozytora)
    """
    if current_user["role"] != "dispatcher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tylko dyspozytor może tworzyć zespoły"
        )

    team_dict = team.dict()
    team_dict["status"] = "available"  # Domyślny status
    result = await db.teams.insert_one(team_dict)

    created_team = await db.teams.find_one({"_id": result.inserted_id})
    return created_team


@router.get("/teams", response_model=List[Team])
async def get_teams(
        current_user: dict = Depends(get_current_active_user),
        db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Pobiera listę wszystkich zespołów
    """
    teams = await db.teams.find().to_list(1000)
    return teams


@router.get("/teams/{team_id}", response_model=Team)
async def get_team(
        team_id: str,
        current_user: dict = Depends(get_current_active_user),
        db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Pobiera szczegóły konkretnego zespołu
    """
    team = await db.teams.find_one({"_id": ObjectId(team_id)})
    if not team:
        raise HTTPException(status_code=404, detail="Zespół nie znaleziony")
    return team


@router.put("/teams/{team_id}", response_model=Team)
async def update_team(
        team_id: str,
        team_update: TeamUpdate,
        current_user: dict = Depends(get_current_active_user),
        db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Aktualizuje dane zespołu (tylko dla dyspozytora)
    """
    if current_user["role"] != "dispatcher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tylko dyspozytor może aktualizować zespoły"
        )

    team = await db.teams.find_one({"_id": ObjectId(team_id)})
    if not team:
        raise HTTPException(status_code=404, detail="Zespół nie znaleziony")

    update_data = team_update.dict(exclude_unset=True)

    await db.teams.update_one(
        {"_id": ObjectId(team_id)},
        {"$set": update_data}
    )

    updated_team = await db.teams.find_one({"_id": ObjectId(team_id)})
    return updated_team


@router.delete("/teams/{team_id}")
async def delete_team(
        team_id: str,
        current_user: dict = Depends(get_current_active_user),
        db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Usuwa zespół (tylko dla dyspozytora)
    """
    if current_user["role"] != "dispatcher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tylko dyspozytor może usuwać zespoły"
        )

    result = await db.teams.delete_one({"_id": ObjectId(team_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Zespół nie znaleziony")

    return {"message": "Zespół został usunięty"}


@router.patch("/teams/{team_id}/status")
async def update_team_status(
        team_id: str,
        status: str,
        current_user: dict = Depends(get_current_active_user),
        db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Aktualizuje status zespołu (available/busy)
    """
    if status not in ["available", "busy"]:
        raise HTTPException(
            status_code=400,
            detail="Nieprawidłowy status. Dozwolone wartości: available, busy"
        )

    result = await db.teams.update_one(
        {"_id": ObjectId(team_id)},
        {"$set": {"status": status}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Zespół nie znaleziony")

    return {"message": f"Status zespołu zaktualizowany na: {status}"}