from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

# ObjectId handler (przeniesiony na początek)
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

# Auth Models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    username: str
    full_name: Optional[str] = None
    role: str

    class Config:
        orm_mode = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserInDB(UserBase):
    hashed_password: str

class User(UserBase):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    disabled: Optional[bool] = None

# Team Models
class TeamBase(BaseModel):
    name: str
    members: List[str]
    vehicle_id: str
    fcm_token: Optional[str] = None

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class TeamCreate(TeamBase):
    pass

class TeamUpdate(TeamBase):
    name: Optional[str] = None
    members: Optional[List[str]] = None
    vehicle_id: Optional[str] = None
    status: Optional[str] = None

class Team(TeamBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    status: str = "available"

# Dispatch Models
class DispatchBase(BaseModel):
    team_id: PyObjectId
    caller_name: str
    caller_phone: str
    address: str
    description: Optional[str] = None

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class DispatchCreate(DispatchBase):
    pass

class Dispatch(DispatchBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

# Medical Form Models
class VitalSigns(BaseModel):
    blood_pressure: str
    pulse: int
    temperature: float
    saturation: int

class MedicalFormBase(BaseModel):
    patient_name: str
    patient_age: int
    symptoms: List[str]
    vital_signs: VitalSigns
    procedures: List[str]
    medications: List[str]
    notes: Optional[str] = None

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class MedicalFormCreate(MedicalFormBase):
    pass

class MedicalForm(MedicalFormBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    dispatch_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)