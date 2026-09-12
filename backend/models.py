import json
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
try:
    from .database import Base
except ImportError:
    from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="skipper", nullable=False) # skipper, officer, researcher, admin
    officer_type = Column(String(100), nullable=True) # incois_scientist, coast_guard, fisheries_officer, port_master
    govt_id_number = Column(String(100), nullable=True) # Official Badge / Service ID
    department = Column(String(200), nullable=True) # Ministry / Agency name
    vessel_name = Column(String(255), nullable=True)
    registration_number = Column(String(100), nullable=True)
    harbor_base = Column(String(100), nullable=True)
    is_verified = Column(Boolean, default=True)
    auth_provider = Column(String(50), default="credentials") # credentials, google, digilocker, navic
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    saved_zones = relationship("UserSavedZone", back_populates="user", cascade="all, delete-orphan")
    scans = relationship("ScanHistory", back_populates="user", cascade="all, delete-orphan")

class Zone(Base):
    __tablename__ = "zones"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    sector_code = Column(String(20), default="WB")
    distance_offshore = Column(String(50), nullable=False)
    sounding_depth = Column(Integer, default=15)
    seabed = Column(String(100), default="Silt & mud substrate")
    coordinates = Column(String(100), default="21°30'N, 88°00'E")
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    coastal_district = Column(String(100), default="Purba Medinipur")
    harbor_name = Column(String(100), default="Digha Mohana Fishery Harbor")
    fleet_type = Column(String(100), default="Mechanized gillnetter / motorized craft")
    base_sst = Column(Float, default=28.5)
    base_chlorophyll = Column(Float, default=1.8)
    base_wind = Column(Float, default=16.0)
    base_wave = Column(Float, default=1.1)
    seasonal_catch_index = Column(JSON, nullable=False) # 12 elements
    peak_catch = Column(Integer, default=320)
    near_protected_area = Column(Boolean, default=False)
    description = Column(Text, nullable=True)

    scans = relationship("ScanHistory", back_populates="zone")
    saved_by = relationship("UserSavedZone", back_populates="zone")

class ScanHistory(Base):
    __tablename__ = "scan_histories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    zone_id = Column(String(50), ForeignKey("zones.id"), nullable=False)
    scan_date = Column(String(20), nullable=False)
    combined_score = Column(Integer, nullable=False)
    verdict = Column(String(50), nullable=False)
    orchestrator_note = Column(Text, nullable=False)
    agent_readouts = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="scans")
    zone = relationship("Zone", back_populates="scans")

    @property
    def zone_name(self) -> str:
        return self.zone.name if self.zone else self.zone_id

    @property
    def scenario_date(self) -> str:
        return self.scan_date

    @property
    def requested_at(self) -> datetime:
        return self.created_at

ScanLog = ScanHistory

class CatchLogEntry(Base):
    __tablename__ = "catch_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    zone_id = Column(String(50), ForeignKey("zones.id"), nullable=False)
    zone_name = Column(String(100), nullable=False)
    trip_date = Column(String(20), nullable=False)
    estimated_kg = Column(Float, nullable=False)
    species = Column(String(100), nullable=False)
    notes = Column(Text, nullable=True)
    logged_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    zone = relationship("Zone")

class LandingLogEntry(Base):
    __tablename__ = "landing_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    zone_id = Column(String(50), ForeignKey("zones.id"), nullable=False)
    zone_name = Column(String(100), nullable=False)
    landing_date = Column(String(20), nullable=False)
    actual_kg = Column(Float, nullable=False)
    species = Column(String(100), nullable=False)
    notes = Column(Text, nullable=True)
    logged_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    zone = relationship("Zone")

class UserSavedZone(Base):
    __tablename__ = "user_saved_zones"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    zone_id = Column(String(50), ForeignKey("zones.id"), nullable=False)
    notes = Column(Text, nullable=True)
    saved_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="saved_zones")
    zone = relationship("Zone", back_populates="saved_by")

