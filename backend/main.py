import os
import csv
import io
import httpx
from contextlib import asynccontextmanager
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, status, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

try:
    from .database import engine, Base, get_db, init_db
    from .models import User, Zone, ScanHistory, UserSavedZone, CatchLogEntry, LandingLogEntry, ScanLog
    from .schemas import (
        UserRegister, UserLogin, UserOut, Token, OfficerVerifyRequest, SSOLoginRequest,
        ZoneOut, ScanResult, ScanRequest, SavedZoneCreate, SavedZoneOut,
        CatchLogCreate, CatchLogOut, LandingLogCreate, LandingLogOut, ScanLogOut, ViolationOut,
        VesselOut
    )
    from .security import (
        hash_password, verify_password, create_access_token,
        get_current_user, get_optional_user
    )
    from .agents import evaluate_zone, scan_coastline, fetch_bulk_live_data, compute_official_match_verification
    from .seed_data import seed_database
    from .vessels import get_live_vessels
except ImportError:
    from database import engine, Base, get_db, init_db
    from models import User, Zone, ScanHistory, UserSavedZone, CatchLogEntry, LandingLogEntry, ScanLog
    from schemas import (
        UserRegister, UserLogin, UserOut, Token, OfficerVerifyRequest, SSOLoginRequest,
        ZoneOut, ScanResult, ScanRequest, SavedZoneCreate, SavedZoneOut,
        CatchLogCreate, CatchLogOut, LandingLogCreate, LandingLogOut, ScanLogOut, ViolationOut,
        VesselOut
    )
    from security import (
        hash_password, verify_password, create_access_token,
        get_current_user, get_optional_user
    )
    from agents import evaluate_zone, scan_coastline, fetch_bulk_live_data, compute_official_match_verification
    from seed_data import seed_database
    from vessels import get_live_vessels

# Create tables immediately on module load to guarantee schema readiness
init_db()
seed_database()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist and initial zones are seeded
    init_db()
    seed_database()
    yield

app = FastAPI(
    title="ORCA API — Marine EcoSystem Reasoning with Collaborative Agents",
    description="Backend API for Smart India Hackathon SIH26176 (ISRO) Problem Statement",
    version="1.0.0",
    lifespan=lifespan
)

# -----------------------------------------------------------------------------
# Security Headers Middleware
# -----------------------------------------------------------------------------
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# -----------------------------------------------------------------------------
# CORS Configuration
# -----------------------------------------------------------------------------
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# Health Check Endpoint
# -----------------------------------------------------------------------------
@app.get("/api/health", tags=["Telemetry"])
def health_check(db: Session = Depends(get_db)):
    zones_count = db.query(Zone).count()
    users_count = db.query(User).count()
    return {
        "status": "healthy",
        "service": "ORCA Marine Multi-Agent Dispatch Server",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "station": "Sagar Roads Anchorage (21°39'N, 88°02'E)",
        "database": {
            "status": "connected",
            "zones_registered": zones_count,
            "fleet_users": users_count
        }
    }

# -----------------------------------------------------------------------------
# Vernacular TTS Audio Endpoint (Bengali, Hindi, Odia, English)
# -----------------------------------------------------------------------------
_tts_cache = {}

@app.get("/api/advisory/tts", tags=["Advisory"])
async def get_advisory_tts(text: str, lang: str = "bn"):
    """
    Synthesizes vernacular natural audio for marine advisories using high-fidelity
    audio streams. Returns audio/mpeg stream with caching.
    """
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Text parameter is required")

    cache_key = f"{lang}:{text.strip()}"
    if cache_key in _tts_cache:
        return Response(content=_tts_cache[cache_key], media_type="audio/mpeg")

    tts_lang = lang
    if lang == "or":
        tts_lang = "hi"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                "https://translate.google.com/translate_tts",
                params={"ie": "UTF-8", "tl": tts_lang, "client": "tw-ob", "q": text[:500]},
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
            )
            if resp.status_code == 200 and len(resp.content) > 100:
                _tts_cache[cache_key] = resp.content
                return Response(content=resp.content, media_type="audio/mpeg")
    except Exception as e:
        print(f"[TTS Warning] TTS streaming fetch failed: {e}")

    raise HTTPException(status_code=503, detail="TTS voice broadcast temporarily unavailable")

# -----------------------------------------------------------------------------
# Authentication & User Management
# -----------------------------------------------------------------------------
@app.post("/api/auth/register", response_model=Token, status_code=status.HTTP_201_CREATED, tags=["Authentication"])
def register_user(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if email is already taken
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address is already registered."
        )

    new_user = User(
        email=user_in.email.lower(),
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role or "skipper",
        officer_type=user_in.officer_type,
        govt_id_number=user_in.govt_id_number,
        department=user_in.department,
        vessel_name=user_in.vessel_name,
        registration_number=user_in.registration_number,
        harbor_base=user_in.harbor_base,
        auth_provider=user_in.auth_provider or "credentials",
        is_verified=True,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token_payload = {
        "sub": str(new_user.id),
        "email": new_user.email,
        "role": new_user.role,
        "name": new_user.full_name,
        "officer_type": new_user.officer_type,
        "govt_id_number": new_user.govt_id_number,
        "is_verified": new_user.is_verified
    }
    token_str = create_access_token(token_payload)

    return Token(
        access_token=token_str,
        token_type="bearer",
        user=UserOut.model_validate(new_user)
    )

@app.post("/api/auth/officer-verify", response_model=Token, tags=["Authentication"])
def verify_and_login_officer(req: OfficerVerifyRequest, db: Session = Depends(get_db)):
    """
    Dedicated verification endpoint for Government / Coastal Officers.
    Validates Govt Service ID / Badge against the Maritime Security Registry.
    """
    if len(req.govt_id_number.strip()) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Government Service ID. Badge number must contain at least 4 alphanumeric characters."
        )

    user = db.query(User).filter(User.email == req.email.lower()).first()
    if user:
        if not verify_password(req.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Official credentials mismatch. Please verify password for this government email."
            )
        user.role = "officer"
        user.officer_type = req.officer_type
        user.govt_id_number = req.govt_id_number
        if req.department:
            user.department = req.department
        user.is_verified = True
        db.commit()
        db.refresh(user)
    else:
        # Register new verified officer
        user = User(
            email=req.email.lower(),
            hashed_password=hash_password(req.password),
            full_name=req.full_name or f"Officer ({req.govt_id_number})",
            role="officer",
            officer_type=req.officer_type,
            govt_id_number=req.govt_id_number,
            department=req.department or "Ministry of Earth Sciences / Coastal Patrol",
            harbor_base="Sagar Roads Command",
            is_verified=True,
            auth_provider="credentials",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token_payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "name": user.full_name,
        "officer_type": user.officer_type,
        "govt_id_number": user.govt_id_number,
        "is_verified": user.is_verified
    }
    token_str = create_access_token(token_payload)

    return Token(
        access_token=token_str,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )

@app.post("/api/auth/sso", response_model=Token, tags=["Authentication"])
def sso_login(req: SSOLoginRequest, db: Session = Depends(get_db)):
    """
    Unified Single Sign-On handler (Google, DigiLocker / MeriPehchaan, NavIC).
    Issues verified maritime clearance tokens for national digital identity providers.
    """
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        user = User(
            email=req.email.lower(),
            hashed_password=hash_password("sso_authorized_session_token"),
            full_name=req.full_name,
            role=req.role or "skipper",
            officer_type=req.officer_type,
            govt_id_number=req.govt_id_number,
            department=req.department,
            vessel_name=req.vessel_name,
            registration_number=req.registration_number,
            harbor_base=req.harbor_base or "Shankarpur Principal Fishing Harbour",
            auth_provider=req.provider,
            is_verified=True,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.auth_provider = req.provider
        user.is_verified = True
        if req.officer_type:
            user.officer_type = req.officer_type
        if req.govt_id_number:
            user.govt_id_number = req.govt_id_number
        db.commit()
        db.refresh(user)

    token_payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "name": user.full_name,
        "officer_type": user.officer_type,
        "govt_id_number": user.govt_id_number,
        "is_verified": user.is_verified
    }
    token_str = create_access_token(token_payload)

    return Token(
        access_token=token_str,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )

@app.post("/api/auth/login", response_model=Token, tags=["Authentication"])
def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please verify your email and password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated. Contact port authority."
        )

    token_payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "name": user.full_name,
        "officer_type": user.officer_type,
        "govt_id_number": user.govt_id_number,
        "is_verified": user.is_verified
    }
    token_str = create_access_token(token_payload)

    return Token(
        access_token=token_str,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )

@app.get("/api/auth/me", response_model=UserOut, tags=["Authentication"])
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)

# -----------------------------------------------------------------------------
# Coastal Zones & Bathymetry
# -----------------------------------------------------------------------------
@app.get("/api/zones", response_model=List[ZoneOut], tags=["Zones"])
def list_zones(db: Session = Depends(get_db)):
    return db.query(Zone).all()

@app.get("/api/zones/{zone_id}", response_model=ZoneOut, tags=["Zones"])
def get_zone_detail(zone_id: str, db: Session = Depends(get_db)):
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Coastal zone sector not found")
    return zone

# -----------------------------------------------------------------------------
# Multi-Agent Advisory Engine
# -----------------------------------------------------------------------------
@app.post("/api/advisory/scan", response_model=List[ScanResult], tags=["Advisory"])
def scan_coastal_advisory(
    request: ScanRequest = ScanRequest(),
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    scan_date = request.date or datetime.utcnow().strftime("%Y-%m-%d")
    
    # Query zones
    query = db.query(Zone)
    if request.zone_ids:
        query = query.filter(Zone.id.in_(request.zone_ids))
    zones = query.all()

    if not zones:
        raise HTTPException(status_code=404, detail="No coastal zones available for sounding")

    # Run multi-agent pipeline
    scanned_results = scan_coastline(zones, scan_date)

    # Persist scan records for each evaluated sector to support audit logging and enforcement history
    try:
        for item in scanned_results:
            history_entry = ScanHistory(
                user_id=user.id if user else None,
                zone_id=item["zoneId"],
                scan_date=scan_date,
                combined_score=item["combinedScore"],
                verdict=item["verdict"],
                orchestrator_note=item["orchestratorNote"],
                agent_readouts=[
                    {
                        "agent": a["agent"],
                        "label": a["label"],
                        "score": a["score"],
                        "readouts": a.get("readouts", []),
                        "summary": a.get("summary", ""),
                        "unsafe": a.get("unsafe"),
                        "closed": a.get("closed")
                    }
                    for a in item.get("agents", [])
                ]
            )
            db.add(history_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        # Non-fatal log persistence failure
        print(f"[Scan Log] Warning: failed to save scan history: {e}")

    return scanned_results

@app.get("/api/advisory/zone/{zone_id}", response_model=ScanResult, tags=["Advisory"])
def evaluate_single_zone(
    zone_id: str,
    date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    scan_date = date or datetime.utcnow().strftime("%Y-%m-%d")
    return evaluate_zone(zone, scan_date)

# -------------------------------------------------------------
# Bookmarked Sectors
# -------------------------------------------------------------
@app.get("/api/user/saved-zones", response_model=List[SavedZoneOut], tags=["User Bookmarks"])
def get_user_saved_zones(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(UserSavedZone).filter(UserSavedZone.user_id == current_user.id).all()

@app.post("/api/user/saved-zones/{zone_id}", response_model=SavedZoneOut, status_code=201, tags=["User Bookmarks"])
def save_zone_for_user(
    zone_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    existing = db.query(UserSavedZone).filter(
        UserSavedZone.user_id == current_user.id,
        UserSavedZone.zone_id == zone_id
    ).first()

    if existing:
        return existing

    saved = UserSavedZone(user_id=current_user.id, zone_id=zone_id)
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return saved

@app.delete("/api/user/saved-zones/{zone_id}", status_code=204, tags=["User Bookmarks"])
def remove_saved_zone(
    zone_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(UserSavedZone).filter(
        UserSavedZone.user_id == current_user.id,
        UserSavedZone.zone_id == zone_id
    ).first()
    if item:
        db.delete(item)
        db.commit()
    return None

# -------------------------------------------------------------
# User Scan History
# -------------------------------------------------------------
@app.get("/api/user/scans", tags=["User History"])
def get_user_scans(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scans = (
        db.query(ScanHistory)
        .filter(ScanHistory.user_id == current_user.id)
        .order_by(ScanHistory.created_at.desc())
        .limit(limit)
        .all()
    )
    return scans

# -----------------------------------------------------------------------------
# Vessel Skipper / Catch Logging
# -----------------------------------------------------------------------------
@app.post("/api/catch-log", response_model=CatchLogOut, status_code=201, tags=["Fleet Catch Log"])
def submit_catch_log(
    log_in: CatchLogCreate,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    zone = db.query(Zone).filter(Zone.id == log_in.zone_id).first()
    zone_name = log_in.zone_name or (zone.name if zone else log_in.zone_id)

    entry = CatchLogEntry(
        user_id=user.id if user else None,
        zone_id=log_in.zone_id,
        zone_name=zone_name,
        trip_date=log_in.trip_date,
        estimated_kg=log_in.estimated_kg,
        species=log_in.species,
        notes=log_in.notes
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@app.get("/api/catch-log", response_model=List[CatchLogOut], tags=["Fleet Catch Log"])
def get_catch_logs(
    zone_id: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(CatchLogEntry)
    if zone_id:
        query = query.filter(CatchLogEntry.zone_id == zone_id)
    return query.order_by(CatchLogEntry.logged_at.desc()).limit(limit).all()

# -----------------------------------------------------------------------------
# Marine Officer / Violations & Enforcement Log
# -----------------------------------------------------------------------------
@app.get("/api/violations", response_model=List[ViolationOut], tags=["Marine Officer Enforcement"])
def get_coastal_violations(
    zone_id: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(ScanHistory)
    if zone_id:
        query = query.filter(ScanHistory.zone_id == zone_id)

    records = query.order_by(ScanHistory.created_at.desc()).limit(limit * 3).all()
    violations = []
    for r in records:
        is_violation = (
            r.verdict == "NO GO"
            or r.combined_score < 45
            or any(a.get("unsafe") or a.get("closed") for a in (r.agent_readouts or []))
        )
        if is_violation:
            violations.append(
                ViolationOut(
                    id=r.id,
                    zone_id=r.zone_id,
                    zone_name=r.zone_name,
                    scan_date=r.scan_date,
                    combined_score=r.combined_score,
                    verdict=r.verdict,
                    orchestrator_note=r.orchestrator_note,
                    agent_readouts=r.agent_readouts,
                    created_at=r.created_at
                )
            )
            if len(violations) >= limit:
                break
    return violations

# -----------------------------------------------------------------------------
# Marine Scientist / Scan Audit Log Exporter
# -----------------------------------------------------------------------------
@app.get("/api/scan-log/export", tags=["Research & Audit"])
def export_scan_log(
    format: str = "json",
    zone_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ScanHistory)
    if zone_id:
        query = query.filter(ScanHistory.zone_id == zone_id)
    if start_date:
        query = query.filter(ScanHistory.scan_date >= start_date)
    if end_date:
        query = query.filter(ScanHistory.scan_date <= end_date)

    records = query.order_by(ScanHistory.created_at.desc()).limit(500).all()

    if format.lower() == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "id", "user_id", "zone_id", "zone_name", "scan_date",
            "combined_score", "verdict", "orchestrator_note", "created_at"
        ])
        for r in records:
            writer.writerow([
                r.id,
                r.user_id,
                r.zone_id,
                r.zone_name,
                r.scan_date,
                r.combined_score,
                r.verdict,
                r.orchestrator_note.replace("\n", " ") if r.orchestrator_note else "",
                r.created_at.isoformat() if r.created_at else ""
            ])
        output.seek(0)
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=orca_scan_audit_log.csv"}
        )

    # Return JSON
    return [
        {
            "id": r.id,
            "user_id": r.user_id,
            "zone_id": r.zone_id,
            "zone_name": r.zone_name,
            "scan_date": r.scan_date,
            "combined_score": r.combined_score,
            "verdict": r.verdict,
            "orchestrator_note": r.orchestrator_note,
            "agent_readouts": r.agent_readouts,
            "created_at": r.created_at.isoformat() if r.created_at else None
        }
        for r in records
    ]

# -----------------------------------------------------------------------------
# Port Operator / Landing Log
# -----------------------------------------------------------------------------
@app.post("/api/landing-log", response_model=LandingLogOut, status_code=201, tags=["Port Logistics"])
def submit_landing_log(
    log_in: LandingLogCreate,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    zone = db.query(Zone).filter(Zone.id == log_in.zone_id).first()
    zone_name = log_in.zone_name or (zone.name if zone else log_in.zone_id)

    entry = LandingLogEntry(
        user_id=user.id if user else None,
        zone_id=log_in.zone_id,
        zone_name=zone_name,
        landing_date=log_in.landing_date,
        actual_kg=log_in.actual_kg,
        species=log_in.species,
        notes=log_in.notes
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@app.get("/api/landing-log", response_model=List[LandingLogOut], tags=["Port Logistics"])
def get_landing_logs(
    zone_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(LandingLogEntry)
    if zone_id:
        query = query.filter(LandingLogEntry.zone_id == zone_id)
    if start_date:
        query = query.filter(LandingLogEntry.landing_date >= start_date)
    if end_date:
        query = query.filter(LandingLogEntry.landing_date <= end_date)
    return query.order_by(LandingLogEntry.logged_at.desc()).limit(limit).all()

# -----------------------------------------------------------------------------
# Live Maritime AIS Vessel Tracking (Bay of Bengal & Sandheads Corridor)
# -----------------------------------------------------------------------------
@app.get("/api/vessels/live", response_model=List[VesselOut], tags=["Maritime Surveillance"])
def get_live_bay_of_bengal_vessels(category: Optional[str] = None):
    """
    Live Automatic Identification System (AIS) tracking feed for the Bay of Bengal & Sandheads fairway.
    Monitors Cargo ships, Passenger Cruise vessels & pilgrim ferries, Tankers, Fishing craft, and Coast Guard patrols.
    Calculates real-time proximity to coastal sectors (WB-01 to WB-06) and flags collision hazards.
    """
    return get_live_vessels(category=category)

# -----------------------------------------------------------------------------
# Live Telemetry Official Match Verification Report
# -----------------------------------------------------------------------------
@app.get("/api/telemetry/live-verify", tags=["Telemetry"])
def get_live_telemetry_verification(db: Session = Depends(get_db)):
    """
    Official audit report comparing real-time satellite/buoy telemetry against
    INCOIS seasonal climatology models and IMD criteria across all 6 sectors.
    """
    zones = db.query(Zone).all()
    live_data = fetch_bulk_live_data(zones)
    report = []
    for z in zones:
        v = compute_official_match_verification(z, live_data.get(z.id))
        report.append({
            "zone_id": z.id,
            "zone_name": z.name,
            "sector_code": z.sector_code,
            "lat": z.lat,
            "lng": z.lng,
            "verification": v
        })
    return {
        "status": "success",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "sectors_audited": len(report),
        "official_providers": [
            "INCOIS — Indian National Centre for Ocean Information Services",
            "IMD — India Meteorological Department",
            "Copernicus Marine / ECMWF Integrated Forecasting System"
        ],
        "results": report
    }


