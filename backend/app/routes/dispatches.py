from fastapi import APIRouter, Depends, HTTPException, status
from ..utils.security import get_current_active_user
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..database import get_database
from ..models import Dispatch, DispatchCreate, MedicalForm, MedicalFormCreate
from bson import ObjectId
from typing import List
from datetime import datetime
import firebase_admin
from firebase_admin import messaging
from flask import Blueprint, request, jsonify
from ..utils.push_notifications import (send_expo_push_notification, registered_tokens)



router = APIRouter(tags=["dispatches"])

dispatches_bp = Blueprint('dispatches', __name__)

@dispatches_bp.route('/api/dispatches', methods=['POST'])
def create_dispatch():
    new_dispatch_data = request.get_json()
    new_dispatch = {
        "id": 123,  # Możesz zamienić na ID z bazy
        "data": new_dispatch_data
    }

    # Wysłanie powiadomień push do wszystkich zarejestrowanych tokenów
    title = "Nowe zgłoszenie!"
    body = "Pojawiło się nowe zgłoszenie przypisane do Twojego zespołu."

    for token in registered_tokens:
        send_expo_push_notification(token, title, body, data={"dispatchId": str(new_dispatch["id"])})

    return jsonify({"message": "Zgłoszenie utworzone", "dispatch": new_dispatch}), 201

@router.delete("/dispatches/{dispatch_id}")
async def delete_dispatch(
        dispatch_id: str,
        current_user: dict = Depends(get_current_active_user),
        db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Usuwa zgłoszenie (tylko dla dyspozytora)
    """
    if current_user["role"] != "dispatcher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tylko dyspozytor może usuwać zgłoszenia"
        )

    result = await db.dispatches.delete_one({"_id": ObjectId(dispatch_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Zgłoszenie nie znalezione")

    return {"message": "Zgłoszenie zostało usunięte"}

@router.post("/dispatches", response_model=Dispatch)
async def create_dispatch(
        dispatch: DispatchCreate,
        current_user: dict = Depends(get_current_active_user),
        db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Tworzy nowe zgłoszenie (tylko dla dyspozytora)
    """
    if current_user["role"] != "dispatcher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tylko dyspozytor może tworzyć zgłoszenia"
        )

    # Sprawdź czy zespół istnieje i jest dostępny
    team = await db.teams.find_one({"_id": dispatch.team_id})
    if not team:
        raise HTTPException(status_code=404, detail="Zespół nie znaleziony")
    if team["status"] == "busy":
        raise HTTPException(status_code=400, detail="Zespół jest już zajęty")

    # Utwórz zgłoszenie
    dispatch_dict = dispatch.dict()
    dispatch_dict["status"] = "pending"
    dispatch_dict["created_at"] = datetime.utcnow()

    result = await db.dispatches.insert_one(dispatch_dict)

    # Aktualizuj status zespołu
    await db.teams.update_one(
        {"_id": dispatch.team_id},
        {"$set": {"status": "busy"}}
    )

    # Wyślij powiadomienie push jeśli jest token FCM
    if team.get("fcm_token"):
        try:
            message = messaging.Message(
                data={
                    "dispatch_id": str(result.inserted_id),
                    "type": "new_dispatch",
                    "address": dispatch.address,
                    "caller_name": dispatch.caller_name
                },
                token=team["fcm_token"]
            )
            messaging.send(message)
        except Exception as e:
            print(f"Błąd wysyłania powiadomienia: {e}")

    created_dispatch = await db.dispatches.find_one({"_id": result.inserted_id})
    return created_dispatch


@router.get("/dispatches", response_model=List[Dispatch])
async def get_dispatches(
        current_user: dict = Depends(get_current_active_user),
        db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Pobiera listę zgłoszeń (dla dyspozytora wszystkie, dla zespołu tylko jego)
    """
    if current_user["role"] == "dispatcher":
        dispatches = await db.dispatches.find().to_list(1000)
    else:
        # Znajdź zespół użytkownika
        team = await db.teams.find_one({"members": current_user["username"]})
        if not team:
            return []
        # Pobierz zgłoszenia dla tego zespołu
        dispatches = await db.dispatches.find({"team_id": team["_id"]}).to_list(1000)

    return dispatches


@router.get("/dispatches/{dispatch_id}", response_model=Dispatch)
async def get_dispatch(
        dispatch_id: str,
        current_user: dict = Depends(get_current_active_user),
        db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Pobiera szczegóły konkretnego zgłoszenia
    """
    dispatch = await db.dispatches.find_one({"_id": ObjectId(dispatch_id)})
    if not dispatch:
        raise HTTPException(status_code=404, detail="Zgłoszenie nie znalezione")

    # Sprawdź uprawnienia
    if current_user["role"] != "dispatcher":
        team = await db.teams.find_one({"members": current_user["username"]})
        if not team or team["_id"] != dispatch["team_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Brak dostępu do tego zgłoszenia"
            )

    return dispatch


@router.post("/dispatches/{dispatch_id}/medical-form", response_model=MedicalForm)
async def create_medical_form(
        dispatch_id: str,
        medical_form: MedicalFormCreate,
        current_user: dict = Depends(get_current_active_user),
        db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Tworzy kartę medyczną dla zgłoszenia (tylko dla zespołu)
    """
    if current_user["role"] != "medic":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tylko ratownik może tworzyć kartę medyczną"
        )

    dispatch = await db.dispatches.find_one({"_id": ObjectId(dispatch_id)})
    if not dispatch:
        raise HTTPException(status_code=404, detail="Zgłoszenie nie znalezione")

    # Sprawdź czy użytkownik należy do zespołu
    team = await db.teams.find_one({"members": current_user["username"]})
    if not team or team["_id"] != dispatch["team_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Brak dostępu do tego zgłoszenia"
        )

    # Utwórz kartę medyczną
    form_dict = medical_form.dict()
    form_dict["dispatch_id"] = ObjectId(dispatch_id)
    form_dict["created_at"] = datetime.utcnow()

    result = await db.medical_forms.insert_one(form_dict)

    # Zaktualizuj status zgłoszenia i zespołu
    await db.dispatches.update_one(
        {"_id": ObjectId(dispatch_id)},
        {
            "$set": {
                "status": "completed",
                "completed_at": datetime.utcnow()
            }
        }
    )

    await db.teams.update_one(
        {"_id": dispatch["team_id"]},
        {"$set": {"status": "available"}}
    )

    created_form = await db.medical_forms.find_one({"_id": result.inserted_id})
    return created_form


@router.get("/dispatches/{dispatch_id}/medical-form", response_model=MedicalForm)
async def get_medical_form(
        dispatch_id: str,
        current_user: dict = Depends(get_current_active_user),
        db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Pobiera kartę medyczną dla zgłoszenia
    """
    medical_form = await db.medical_forms.find_one({"dispatch_id": ObjectId(dispatch_id)})
    if not medical_form:
        raise HTTPException(status_code=404, detail="Karta medyczna nie znaleziona")

    # Sprawdź uprawnienia
    if current_user["role"] != "dispatcher":
        team = await db.teams.find_one({"members": current_user["username"]})
        if not team:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Brak dostępu do tej karty medycznej"
            )

        dispatch = await db.dispatches.find_one({"_id": ObjectId(dispatch_id)})
        if not dispatch or team["_id"] != dispatch["team_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Brak dostępu do tej karty medycznej"
            )

    return medical_form