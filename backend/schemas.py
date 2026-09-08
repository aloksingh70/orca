from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# -------------------------------------------------------------
# User & Auth Schemas
# -------------------------------------------------------------
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    full_name: str = Field(..., min_length=2)
    role: Optional[str] = "skipper" # "skipper", "officer", "researcher", "admin"
    officer_type: Optional[str] = None # "incois_scientist", "coast_guard", "fisheries_officer", "port_master"
    govt_id_number: Optional[str] = None
    department: Optional[str] = None
    vessel_name: Optional[str] = None
    registration_number: Optional[str] = None
    harbor_base: Optional[str] = None
    auth_provider: Optional[str] = "credentials"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class OfficerVerifyRequest(BaseModel):
    govt_id_number: str
    officer_type: str # incois_scientist, coast_guard, fisheries_officer, port_master
    department: Optional[str] = None
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class SSOLoginRequest(BaseModel):
    provider: str # google, digilocker, navic
    email: EmailStr
    full_name: str
    role: Optional[str] = "skipper"
    officer_type: Optional[str] = None
    govt_id_number: Optional[str] = None
    department: Optional[str] = None
    vessel_name: Optional[str] = None
    registration_number: Optional[str] = None
    harbor_base: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    officer_type: Optional[str] = None
    govt_id_number: Optional[str] = None
    department: Optional[str] = None
    vessel_name: Optional[str] = None
    registration_number: Optional[str] = None
    harbor_base: Optional[str] = None
    is_verified: bool = True
    auth_provider: str = "credentials"
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None
    officer_type: Optional[str] = None
    is_verified: Optional[bool] = None

# -------------------------------------------------------------
# Zone & Multi-Agent Schemas
# -------------------------------------------------------------
class ZoneOut(BaseModel):
    id: str
    name: str
    sector_code: str
    distance_offshore: str
    sounding_depth: int
    seabed: str
    coordinates: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    coastal_district: str
    harbor_name: str
    fleet_type: str
    base_sst: float
    base_chlorophyll: float
    base_wind: float
    base_wave: float
    seasonal_catch_index: List[int]
    peak_catch: int
    near_protected_area: bool
    description: Optional[str] = None

    class Config:
        from_attributes = True

class ReadoutItem(BaseModel):
    label: str
    value: str

class AgentResult(BaseModel):
    agent: str
    label: str
    score: int
    readouts: List[ReadoutItem]
    summary: str
    unsafe: Optional[bool] = None
    closed: Optional[bool] = None

class ScanResult(BaseModel):
    zoneId: str
    zoneName: str
    sectorCode: str
    distanceOffshore: str
    soundingDepth: int
    seabed: str
    coordinates: str
    coastalDistrict: str
    harborName: str
    fleetType: str
    date: str
    combinedScore: int
    verdict: str
    orchestratorNote: str
    agents: List[AgentResult]

class ScanRequest(BaseModel):
    date: Optional[str] = None # ISO format YYYY-MM-DD
    zone_ids: Optional[List[str]] = None

# -------------------------------------------------------------
# Bookmarking / Saved Zones Schemas
# -------------------------------------------------------------
class SavedZoneCreate(BaseModel):
    zone_id: str
    notes: Optional[str] = None

class SavedZoneOut(BaseModel):
    id: int
    user_id: int
    zone_id: str
    notes: Optional[str] = None
    saved_at: datetime
    zone: Optional[ZoneOut] = None

    class Config:
        from_attributes = True
