try:
    from .database import engine, Base, SessionLocal, init_db
    from .models import Zone, User
    from .security import hash_password
except ImportError:
    from database import engine, Base, SessionLocal, init_db
    from models import Zone, User
    from security import hash_password

SECTORS_DATA = [
    {
        "id": "digha",
        "name": "Digha",
        "sector_code": "WB-01",
        "distance_offshore": "8 km",
        "sounding_depth": 12,
        "seabed": "Fine estuarine silt & clay",
        "coordinates": "21°37'N, 87°31'E",
        "lat": 21.6167,
        "lng": 87.5167,
        "coastal_district": "Purba Medinipur",
        "harbor_name": "Digha Mohana Jetty",
        "fleet_type": "Mechanized gillnetters & small trawlers",
        "base_sst": 28.6,
        "base_chlorophyll": 1.5,
        "base_wind": 18.0,
        "base_wave": 1.1,
        "near_protected_area": False,
        "peak_catch": 620,
        "seasonal_catch_index": [340, 360, 410, 480, 520, 560, 600, 620, 580, 500, 420, 370],
        "description": "Shallow coastal mudflat zone with strong tidal river outflow. Popular with day-trip mechanized gillnetters."
    },
    {
        "id": "shankarpur",
        "name": "Shankarpur",
        "sector_code": "WB-02",
        "distance_offshore": "11 km",
        "sounding_depth": 16,
        "seabed": "Compacted sandy mud",
        "coordinates": "21°38'N, 87°35'E",
        "lat": 21.6333,
        "lng": 87.5833,
        "coastal_district": "Purba Medinipur",
        "harbor_name": "Shankarpur Principal Fishing Harbour",
        "fleet_type": "Commercial trawler fleet (10-15m)",
        "base_sst": 28.3,
        "base_chlorophyll": 1.7,
        "base_wind": 20.0,
        "base_wave": 1.2,
        "near_protected_area": False,
        "peak_catch": 580,
        "seasonal_catch_index": [320, 350, 390, 460, 500, 540, 580, 560, 520, 460, 400, 350],
        "description": "Principal marine export harbor sector with all-weather breakwater navigation and high cold-chain access."
    },
    {
        "id": "junput",
        "name": "Junput",
        "sector_code": "WB-03",
        "distance_offshore": "14 km",
        "sounding_depth": 18,
        "seabed": "Soft estuarine mudflat margin",
        "coordinates": "21°43'N, 87°49'E",
        "lat": 21.7167,
        "lng": 87.8167,
        "coastal_district": "Purba Medinipur",
        "harbor_name": "Junput Fish Landing Centre",
        "fleet_type": "Motorized country crafts & bag-netters",
        "base_sst": 28.9,
        "base_chlorophyll": 1.3,
        "base_wind": 22.0,
        "base_wave": 1.3,
        "near_protected_area": False,
        "peak_catch": 540,
        "seasonal_catch_index": [300, 320, 360, 420, 460, 500, 540, 520, 470, 410, 360, 320],
        "description": "Artisanal shoreline landing basin known for seasonal pomfret and ribbonfish shoals."
    },
    {
        "id": "sagar-island",
        "name": "Sagar Island",
        "sector_code": "WB-04",
        "distance_offshore": "19 km",
        "sounding_depth": 24,
        "seabed": "Hooghly delta mouth silt ridge",
        "coordinates": "21°39'N, 88°02'E",
        "lat": 21.6500,
        "lng": 88.0333,
        "coastal_district": "South 24 Parganas",
        "harbor_name": "Sagar Roads Anchorage",
        "fleet_type": "Hilsa gillnetters & deep trawlers",
        "base_sst": 28.1,
        "base_chlorophyll": 2.1,
        "base_wind": 24.0,
        "base_wave": 1.5,
        "near_protected_area": True,
        "peak_catch": 700,
        "seasonal_catch_index": [400, 430, 480, 540, 590, 630, 680, 700, 650, 560, 470, 410],
        "description": "Confluence point where the Ganga-Hooghly delta meets the Bay of Bengal. Rich thermal upwelling but near sanctuary perimeter."
    },
    {
        "id": "frazerganj",
        "name": "Frazerganj",
        "sector_code": "WB-05",
        "distance_offshore": "16 km",
        "sounding_depth": 21,
        "seabed": "Outer sandbar & silty shoal",
        "coordinates": "21°34'N, 88°15'E",
        "lat": 21.5667,
        "lng": 88.2500,
        "coastal_district": "South 24 Parganas",
        "harbor_name": "Frazerganj Fishing Harbour",
        "fleet_type": "Mechanized trawlers & longliners",
        "base_sst": 28.4,
        "base_chlorophyll": 1.9,
        "base_wind": 21.0,
        "base_wave": 1.3,
        "near_protected_area": True,
        "peak_catch": 610,
        "seasonal_catch_index": [350, 380, 420, 480, 520, 560, 600, 610, 570, 490, 420, 370],
        "description": "High-yield marine trawling gateway at the southern tip of Bakkhali beach, bordering the Sundarbans Biosphere."
    },
    {
        "id": "kakdwip",
        "name": "Kakdwip",
        "sector_code": "WB-06",
        "distance_offshore": "22 km",
        "sounding_depth": 29,
        "seabed": "Continental shelf sand-mud slope",
        "coordinates": "21°52'N, 88°11'E",
        "lat": 21.8667,
        "lng": 88.1833,
        "coastal_district": "South 24 Parganas",
        "harbor_name": "Kakdwip Steamerghat Port",
        "fleet_type": "Deep-sea multi-day voyage trawlers",
        "base_sst": 27.9,
        "base_chlorophyll": 2.3,
        "base_wind": 26.0,
        "base_wave": 1.6,
        "near_protected_area": False,
        "peak_catch": 660,
        "seasonal_catch_index": [380, 400, 450, 510, 550, 600, 640, 660, 610, 530, 450, 390],
        "description": "Deep-water continental shelf channel suited for long-range multi-day gillnetters and pelagic trawlers."
    }
]

def seed_database(db: Session = None):
    init_db()
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        # 1. Seed Zones if empty
        if db.query(Zone).count() == 0:
            for s in SECTORS_DATA:
                zone = Zone(
                    id=s["id"],
                    name=s["name"],
                    sector_code=s["sector_code"],
                    distance_offshore=s["distance_offshore"],
                    sounding_depth=s["sounding_depth"],
                    seabed=s["seabed"],
                    coordinates=s["coordinates"],
                    lat=s.get("lat"),
                    lng=s.get("lng"),
                    coastal_district=s["coastal_district"],
                    harbor_name=s["harbor_name"],
                    fleet_type=s["fleet_type"],
                    base_sst=s["base_sst"],
                    base_chlorophyll=s["base_chlorophyll"],
                    base_wind=s["base_wind"],
                    base_wave=s["base_wave"],
                    seasonal_catch_index=s["seasonal_catch_index"],
                    peak_catch=s["peak_catch"],
                    near_protected_area=s["near_protected_area"],
                    description=s.get("description")
                )
                db.add(zone)
            db.commit()
            print(f"[Seed] Successfully seeded {len(SECTORS_DATA)} coastal zones.")

        # 2. Seed default users for quick evaluation
        demo_users = [
            {
                "email": "officer.incois@orca.gov.in",
                "full_name": "Dr. Ananya Sen",
                "role": "officer",
                "officer_type": "incois_scientist",
                "govt_id_number": "GOI-INCOIS-PFZ-02",
                "department": "INCOIS — Indian National Centre for Ocean Information Services",
                "harbor_base": "Sagar Roads Station",
                "vessel_name": "INCOIS Oceanographic Research Vessel",
                "registration_number": "GOI-INCOIS-PFZ-02"
            },
            {
                "email": "officer.coastguard@orca.gov.in",
                "full_name": "Cmdr. Vikram Rathore",
                "role": "officer",
                "officer_type": "coast_guard",
                "govt_id_number": "ICG-OFF-8821",
                "department": "Indian Coast Guard — Maritime Surveillance & Search/Rescue",
                "harbor_base": "Haldia Coast Guard Station",
                "vessel_name": "ICGS Varad (Fast Patrol Vessel)",
                "registration_number": "ICG-OFF-8821"
            },
            {
                "email": "officer.fisheries@orca.gov.in",
                "full_name": "Sunil Roy",
                "role": "officer",
                "officer_type": "fisheries_officer",
                "govt_id_number": "WB-FISH-7734",
                "department": "Directorate of Marine Fisheries, Govt of West Bengal",
                "harbor_base": "Shankarpur Principal Fishing Harbour",
                "vessel_name": "Fisheries Vigilance Patrol-04",
                "registration_number": "WB-FISH-7734"
            },
            {
                "email": "officer.portmaster@orca.gov.in",
                "full_name": "Capt. B. K. Halder",
                "role": "officer",
                "officer_type": "port_master",
                "govt_id_number": "PORT-SAGAR-01",
                "department": "Kolkata Port Trust & Sagar Anchorage Maritime Board",
                "harbor_base": "Sagar Roads Anchorage",
                "vessel_name": "Pilot Vessel Sagar Sandhya",
                "registration_number": "PORT-SAGAR-01"
            },
            {
                "email": "skipper@orca.gov.in",
                "full_name": "Capt. Rajesh Mondal",
                "role": "skipper",
                "officer_type": None,
                "govt_id_number": None,
                "department": "Bengal Coastal Fishermen Cooperative",
                "harbor_base": "Shankarpur Principal Fishing Harbour",
                "vessel_name": "FB Maa Ganga (WB-24-M-104)",
                "registration_number": "IND-WB-24-00918"
            },
            {
                "email": "researcher@incois.res.in",
                "full_name": "Dr. Priya Sharma",
                "role": "researcher",
                "officer_type": None,
                "govt_id_number": "NIO-RES-409",
                "department": "National Institute of Oceanography (CSIR-NIO)",
                "harbor_base": "Digha Marine Station",
                "vessel_name": "RV Sindhu Sadhana Observer",
                "registration_number": "NIO-RES-409"
            },
            {
                "email": "portmaster@sagar.port.gov.in",
                "full_name": "Capt. B. K. Halder",
                "role": "port_crew",
                "officer_type": None,
                "govt_id_number": "PORT-SAGAR-01",
                "department": "Kolkata Port Trust & Sagar Anchorage Maritime Board",
                "harbor_base": "Sagar Roads Anchorage",
                "vessel_name": "Pilot Vessel Sagar Sandhya",
                "registration_number": "PORT-SAGAR-01"
            }
        ]

        for u in demo_users:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                db_user = User(
                    email=u["email"],
                    hashed_password=hash_password("orca123"),
                    full_name=u["full_name"],
                    role=u["role"],
                    officer_type=u.get("officer_type"),
                    govt_id_number=u.get("govt_id_number"),
                    department=u.get("department"),
                    vessel_name=u.get("vessel_name"),
                    registration_number=u.get("registration_number"),
                    harbor_base=u["harbor_base"],
                    is_verified=True,
                    is_active=True
                )
                db.add(db_user)
            else:
                existing.officer_type = u.get("officer_type")
                existing.govt_id_number = u.get("govt_id_number")
                existing.department = u.get("department")
                existing.is_verified = True
        db.commit()
        print(f"[Seed] Successfully synchronized {len(demo_users)} demo users across roles.")
    finally:
        if close_db:
            db.close()

if __name__ == "__main__":
    seed_database()
