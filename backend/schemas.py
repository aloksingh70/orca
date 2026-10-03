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
    port_id: Optional[str] = "kolkata-haldia"
    region_id: Optional[str] = "bay-of-bengal"
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
    isLive: Optional[bool] = False
    dataSource: Optional[str] = None
    liveVerification: Optional[Any] = None

class ScanRequest(BaseModel):
    date: Optional[str] = None # ISO format YYYY-MM-DD
    zone_ids: Optional[List[str]] = None
    region: Optional[str] = None
    port: Optional[str] = None
    port_id: Optional[str] = None
    region_id: Optional[str] = None

class VesselOut(BaseModel):
    mmsi: str
    imo: Optional[str] = None
    name: str
    call_sign: Optional[str] = None
    flag: str
    vessel_type: str
    category_label: str
    lat: float
    lng: float
    speed_knots: float
    course_deg: int
    length_m: Optional[float] = None
    width_m: Optional[float] = None
    draught_m: Optional[float] = None
    destination: str
    eta: Optional[str] = None
    nav_status: str
    cargo_type: Optional[str] = None
    operator: Optional[str] = None
    risk_level: Optional[str] = None
    closest_sector_id: Optional[str] = None
    closest_sector_name: Optional[str] = None
    distance_to_closest_sector_nm: Optional[float] = None
    proximity_hazard: bool = False
    hazard_note: Optional[str] = None
    last_ais_update: Optional[str] = None
    source_provider: Optional[str] = None

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

# -------------------------------------------------------------
# Catch & Landing Logs Schemas
# -------------------------------------------------------------
class CatchLogCreate(BaseModel):
    zone_id: str
    zone_name: Optional[str] = None
    trip_date: str
    estimated_kg: float
    species: str
    notes: Optional[str] = None

class CatchLogOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    zone_id: str
    zone_name: str
    trip_date: str
    estimated_kg: float
    species: str
    notes: Optional[str] = None
    logged_at: datetime

    class Config:
        from_attributes = True

class LandingLogCreate(BaseModel):
    zone_id: str
    zone_name: Optional[str] = None
    landing_date: str
    actual_kg: float
    species: str
    notes: Optional[str] = None

class LandingLogOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    zone_id: str
    zone_name: str
    landing_date: str
    actual_kg: float
    species: str
    notes: Optional[str] = None
    logged_at: datetime

    class Config:
        from_attributes = True

# -------------------------------------------------------------
# Scan Log & Audit Schemas
# -------------------------------------------------------------
class ScanLogOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    zone_id: str
    zone_name: Optional[str] = None
    scan_date: str
    combined_score: int
    verdict: str
    orchestrator_note: str
    agent_readouts: Any
    created_at: datetime

    class Config:
        from_attributes = True

class ViolationOut(BaseModel):
    id: int
    zone_id: str
    zone_name: str
    scan_date: str
    combined_score: int
    verdict: str
    orchestrator_note: str
    agent_readouts: Any
    created_at: datetime

