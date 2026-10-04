# ORCA — Marine EcoSystem Reasoning with Collaborative Agents

[![Live Vercel Deployment](https://img.shields.io/badge/Live%20Console-orca--advisory.vercel.app-007A78.svg?style=for-the-badge&logo=vercel)](https://orca-advisory.vercel.app/)
[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH-2026-blue.svg)](https://sih.gov.in/)
[![ISRO Problem Statement](https://img.shields.io/badge/Problem%20Statement-SIH26176%20(ISRO)-orange.svg)](https://sih.gov.in/)
[![FastAPI Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11-009688.svg)](https://fastapi.tiangolo.com/)
[![React Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61DAFB.svg)](https://react.dev/)
[![Telemetry Live Feeds](https://img.shields.io/badge/Telemetry-Copernicus%20%7C%20ECMWF%20%7C%20NOAA%20%7C%20INCOIS-007A78.svg)](https://open-meteo.com/)
[![Tests Status](https://img.shields.io/badge/Tests-12%2F12%20Passed-brightgreen.svg)](#automated-testing)

> 🌐 **Live Web Application**: [https://orca-advisory.vercel.app/](https://orca-advisory.vercel.app/)  
> **Autonomous Multi-Agent Marine Harvesting Advisory & Maritime Surveillance Platform for the Bay of Bengal and Indian Coastline.**  
> Developed for **Smart India Hackathon 2026 (Problem Statement SIH26176 — Indian Space Research Organisation / ISRO)** by **Team Tech Titans**.

---

## 📑 Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [The 4 Collaborative AI Agents](#the-4-collaborative-ai-agents)
4. [Live Satellite Telemetry & Official Verification](#live-satellite-telemetry--official-verification)
5. [Bay of Bengal AIS Vessel Tracking Radar](#bay-of-bengal-ais-vessel-tracking-radar)
6. [Four Role Personas & Workflows](#four-role-personas--workflows)
7. [Getting Started (Local Setup)](#getting-started-local-setup)
8. [Automated Testing](#automated-testing)
9. [REST API Reference](#rest-api-reference)
10. [Licensing & Acknowledgments](#licensing--acknowledgments)

---

## 1. Executive Summary

Traditional coastal fishing advisories in India rely on static Potential Fishing Zone (PFZ) bulletins that require artisanal skippers and port authorities to manually cross-reference sea surface temperatures, weather warnings, seasonal breeding closures, and maritime boundaries.

**ORCA** redefines marine spatial planning into an **autonomous multi-agent reasoning system**. Rather than returning a single black-box score, ORCA deploys four specialized computational agents over real-time satellite oceanography, marine meteorological forecasts, historical landing registries, and maritime regulations. An intelligent **Orchestrator** synthesizes these streams into transparent, explainable sailing advisories while enforcing strict safety and legal vetoes.

### Core Innovations in ORCA
- **Live Satellite Feeds (ECMWF, NOAA, Copernicus Marine)**: Real-time sea surface temperature (SST), significant wave height ($H_s$), wave period, wind velocity, and barometric pressure fetched via Open-Meteo APIs for exact coastal coordinates.
- **INCOIS & IMD Baseline Match Verification**: Each scan performs an automated audit comparing live observations against official INCOIS seasonal climatology models and IMD squall thresholds.
- **Live Bay of Bengal AIS Vessel Tracking**: Real-time monitoring of commercial cargo carriers, passenger cruise ships (including *MV Ganga Vilas*), oil tankers, mechanized fishing vessels, and Indian Coast Guard patrol craft with automatic collision proximity warnings (<6 NM).
- **Quad-Persona Operating Decks**: Dedicated operational interfaces for **Vessel Skippers**, **Coast Guard Enforcement Officers**, **Marine Research Scientists**, and **Port Logistics Operators**.

---

## 2. System Architecture

ORCA is engineered as a decoupled, production-ready system combining a high-performance **FastAPI (Python 3.11)** backend with an interactive **React 18 (Vite)** maritime dashboard.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   ORCA CLIENT FRONTEND                                 │
│  React 18 • Vite • TailwindCSS • Hydrographic Chart IN-351 • Multi-Role Working Decks  │
└─────────────────────────────────────────▲──────────────────────────────────────────────┘
                                          │ JSON / REST / JWT Bearer
┌─────────────────────────────────────────▼──────────────────────────────────────────────┐
│                               FASTAPI BACKEND ORCHESTRATOR                             │
│  Security Headers • CORS • JWT Auth • Multi-Agent Pipeline • In-Memory Telemetry Cache  │
└───────▲─────────────────▲───────────────────────────────▲──────────────────────▲───────┘
        │                 │                               │                      │
┌───────▼────────┐ ┌──────▼─────────────────┐ ┌───────────▼──────────┐ ┌─────────▼───────┐
│  OCEAN AGENT   │ │  WEATHER AGENT         │ │  HISTORY AGENT       │ │ SUSTAIN AGENT   │
│  Live SST &    │ │  Live Wave Height,     │ │  CMFRI Longitudinal  │ │ 61-Day Uniform  │
│  Chlorophyll-a │ │  Wind Speed & Gusts    │ │  Landing Indices     │ │ Ban & IMBL Line │
└───────▲────────┘ └──────▲─────────────────┘ └───────────▲──────────┘ └─────────▲───────┘
        │                 │                               │                      │
┌───────▼─────────────────▼─────────┐          ┌──────────▼──────────┐ ┌─────────▼───────┐
│    EXTERNAL LIVE SATELLITE APIS   │          │   SQLITE / POSTGRES │ │ BAY OF BENGAL   │
│  Copernicus Marine • ECMWF IFS    │          │   SQLAlchemy ORM    │ │ AIS FLEET VTS   │
│  NOAA GFS Models (10m Resolution) │          │   Audit & Catch Log │ │ 14 Tracked Ships│
└───────────────────────────────────┘          └─────────────────────┘ └─────────────────┘
```

### Technology Stack
- **Backend**: FastAPI, Uvicorn, SQLAlchemy ORM, SQLite (PostgreSQL/PostGIS ready), HTTPX, Pydantic v2, Passlib (PBKDF2-SHA256), Python-Jose (JWT).
- **Frontend**: React 18, Vite, Lucide Icons, Canvas/SVG Hydrographic Chart rendering, TailwindCSS.
- **Data Integrations**: Copernicus Marine Service, ECMWF, NOAA GFS, INCOIS PFZ Climatology, IMD Marine Bulletins, DGLL Sandheads Vessel Traffic Service (VTS).

---

## 3. The 4 Collaborative AI Agents

ORCA evaluates every coastal sector using four dedicated agents before the Orchestrator renders a final recommendation:

| Agent | Input Parameters | Scoring Metric | Hard Veto Trigger |
|---|---|---|---|
| **🌊 Ocean Agent** | Live satellite SST, estuarine chlorophyll-a concentration, surface pressure | Biological feeding suitability index ($0-100$) based on optimal thermal front gradients ($27.0^\circ\text{C}-29.5^\circ\text{C}$) | None (Scoring weight) |
| **💨 Weather Agent** | Live significant wave height ($H_s$), wave period, wind velocity (10m), wind gusts | Hydrodynamic navigational safety score ($0-100$) | **Squall Veto**: $H_s \ge 2.2\text{m}$ or Wind $\ge 35\text{ km/h}$ $\rightarrow$ **"Unsafe Today"** |
| **🐟 History Agent** | 12-month longitudinal CMFRI catch registers, seasonal pelagic catch index | Seasonal catch expectation score ($0-100$) calibrated to historical species abundance | None (Scoring weight) |
| **🛡️ Sustainability Agent**| Seasonal breeding calendar (15 Apr – 14 Jun), Marine Protected Areas (Sundarbans / Lothian Island) | Regulatory compliance & environmental conservation score ($0-100$) | **Moratorium Veto**: Active 61-day uniform breeding ban $\rightarrow$ **"Seasonal Closure"** |

### Multi-Agent Scoring Formula
$$\text{Composite Score} = \text{round}\Big(0.30 \cdot S_{\text{ocean}} + 0.30 \cdot S_{\text{weather}} + 0.25 \cdot S_{\text{history}} + 0.15 \cdot S_{\text{sustain}}\Big)$$

*If either the Weather Agent or Sustainability Agent executes a veto, the composite verdict is irrevocably overridden to **"Unsafe Today"** or **"Seasonal Closure"**, protecting human life and marine biodiversity.*

---

## 4. Live Satellite Telemetry & Official Verification

ORCA connects directly to official global and national marine data services:
1. **Live External Feeds**: Coordinate-specific telemetry is fetched via Open-Meteo Marine and Weather endpoints aggregating data from:
   - **Copernicus Marine Service** (Sea surface temperature)
   - **ECMWF Integrated Forecasting System (IFS)** (Wave dynamics & significant wave height)
   - **NOAA Global Forecast System (GFS)** (10m wind velocity, gusts, atmospheric pressure)
2. **High-Performance In-Memory Caching**: A 10-minute time-to-live (TTL) cache prevents external API rate limiting and provides sub-millisecond response latency for concurrent users.
3. **Official Baseline Match Verification Check**: Each query audits real-time satellite readouts against official INCOIS seasonal climatology models and IMD criteria:
   - Evaluates SST variance ($\Delta \le \pm 3.5^\circ\text{C}$ monsoonal PFZ envelope).
   - Evaluates wave height compliance ($H_s \le 3.5\text{m}$).
   - Confirms barometric pressure stability ($P \ge 995\text{ hPa}$).
   - Generates confidence scores ($98\%$) and detailed variance diagnostics directly in the UI.

---

## 5. Bay of Bengal AIS Vessel Tracking Radar

The **Live Bay of Bengal AIS Radar** provides comprehensive real-time situational awareness across the Northern Bay of Bengal, Hooghly estuary, Sandheads pilot station, and international maritime corridors:

### Monitored Fleet Categories (14 Authenticated Vessels)
1. **Cargo & Container Ships**:
   - *MV Brahma* (Handymax bulk carrier bound for Haldia Dock Complex)
   - *Sagar Jyoti* (Container feeder transiting Sandheads fairway)
   - *Maersk Chattogram* (International container feeder transiting deep fairway)
   - *Meghna Fortune* (General cargo coastal carrier)
2. **Passenger Cruise & High-Speed Ferries**:
   - *MV Ganga Vilas* (Luxury boutique river-sea cruise ship transiting Sundarbans to Kolkata)
   - *MV Sagar Kanya* (High-speed passenger catamaran carrying Gangasagar pilgrims)
   - *Sundarban Safari Royal* (Eco-tourism cruise liner operating near Lothian Island)
3. **Oil & Chemical Tankers**:
   - *MT Bengal Pride* (Product / chemical tanker delivering refined petroleum to Haldia Oil Jetty 3)
   - *MT Sagar Samrat* (Pressurized LPG carrier bound for Haldia Gas Terminal)
4. **Mechanized Fishing Fleets**:
   - *FB Maa Ganga (WB-24-M-104)* (Mechanized gillnetter active in Shankarpur WB-02)
   - *FB Tara Ma (WB-24-M-219)* (Deep-sea pelagic trawler operating in Digha WB-01)
   - *FB Sagar Ratna (WB-24-M-340)* (Multi-day wooden trawler active in Kakdwip WB-06)
5. **Indian Coast Guard & Enforcement Craft**:
   - *ICGS Varad (40)* (Offshore Patrol Vessel on 24/7 IMBL border surveillance)
   - *Fisheries Vigilance Patrol-04* (Fast Interceptor Craft enforcing mesh regulations)

### Collision Hazard Warnings
When deep-draught commercial vessels (Cargo, Container, Tanker) navigate within **6.0 Nautical Miles (NM)** of small artisanal or mechanized fishing vessels in coastal sectors (WB-01 to WB-06), ORCA triggers automated proximity alerts prompting VHF Channel 16 collision avoidance watch.

---

## 6. Four Role Personas & Workflows

ORCA includes authentic role-based workflows tailored to distinct marine stakeholders:

| Role | Demo Login Credentials | Core Dashboard Features |
|---|---|---|
| **Vessel Skipper / Fisherman** | `skipper@orca.gov.in`<br>`orca123` | - Dawn sailing go/no-go recommendation<br>- Best zone selector with NavIC coordinates<br>- Diesel trip economics calculator<br>- Digital catch log submission (species, kg, trip date)<br>- Vernacular audio advisory synthesis (English, Bengali, Hindi) |
| **Coast Guard Enforcement Officer** | `officer.coastguard@orca.gov.in`<br>`orca123` | - MFRA Section 4 uniform breeding ban enforcement<br>- UNCLOS 2014 India–Bangladesh IMBL 5 NM geofence monitoring<br>- Fleet density tracking & unauthorized craft detection<br>- Real-time violation logging & detention notices |
| **Marine Research Scientist** | `researcher@incois.res.in`<br>`orca123` | - Interactive multi-agent weight sliders ($\sum w_i = 1.0$)<br>- 12-month longitudinal time-series (SST, Chl-a, CMFRI index)<br>- Bathymetric sounding depth profile (Chart IN-351)<br>- One-click scan audit export in **JSON** and **CSV** formats |
| **Port Logistics Operator** | `portmaster@sagar.port.gov.in`<br>`orca123` | - Harbor biomass inflow forecasts<br>- Cold storage & ice supply scheduling<br>- Verified quayside fish landing log entry<br>- ETA tracking for arriving mechanized trawlers |

---

## 7. Getting Started (Local Setup)

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** and `npm`

### 1. Backend Setup (FastAPI)
```powershell
# Navigate to the repository root
cd c:\Users\alokj\OneDrive\Desktop\PROJECTS\SIH

# Activate the virtual environment
.\backend\venv\Scripts\Activate.ps1

# Install required Python dependencies (if not already installed)
pip install -r backend/requirements.txt

# Run the FastAPI server with auto-reload
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
*The FastAPI interactive Swagger documentation is available at `http://127.0.0.1:8000/docs`.*

### 2. Frontend Setup (React / Vite)
In a separate terminal:
```powershell
# Navigate to the repository root
cd c:\Users\alokj\OneDrive\Desktop\PROJECTS\SIH

# Install npm packages
npm install

# Start the Vite development server
npm run dev
```
*Open your browser and navigate to `http://localhost:5173`.*

---

## 8. Automated Testing

ORCA includes an automated verification suite covering security, database models, live telemetry APIs, and role workflows.

### Run Backend Test Suite
```powershell
.\backend\venv\Scripts\python.exe backend/test_api.py
```
**Expected Test Suite Output (12/12 Passed):**
```
==================================================
ORCA FULL SYSTEM & LIVE TELEMETRY TEST SUITE
==================================================
[PASS] 1. Health Check: healthy (ORCA Marine Multi-Agent Dispatch Server)
[PASS] 2. Zones API: Loaded 6 coastal sectors (Digha, Shankarpur, Junput, Sagar Island, Frazerganj, Kakdwip)
[PASS] 3. Login (skipper): Logged in as Capt. Rajesh Mondal (role: skipper)
[PASS] 3. Login (officer): Logged in as Cmdr. Vikram Rathore (role: officer)
[PASS] 3. Login (scientist): Logged in as Dr. Priya Sharma (role: researcher)
[PASS] 3. Login (port_operator): Logged in as Capt. B. K. Halder (role: port_crew)
[PASS] 4. Security: Invalid password rejected with 401 Unauthorized.
[PASS] 5. Live Multi-Agent Pipeline: Scan completed for 6 sectors.
[PASS] 6. Safety Veto: Verified Uniform East-Coast Breeding Ban veto applies to all sectors.
[PASS] 7. Official Telemetry Match Verification: 6 sectors audited (98% confidence).
[PASS] 8. Live AIS Vessel Tracking: 14 ships active in Bay of Bengal & Sandheads fairway.
[PASS] 9. Skipper Catch Log: Entry submitted & retrieved.
[PASS] 10. Officer Violations Report: Retrieved recorded MFRA / border alerts.
[PASS] 11. Scientist Audit Log Export: Exported historical sounding records.
[PASS] 12. Port Operator Landing Log: Entry logged.
==================================================
ALL 12 SYSTEM & LIVE TELEMETRY TESTS PASSED! (12/12)
==================================================
```

### Run Frontend Production Build Check
```powershell
npm run build
```

---

## 9. REST API Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | System health check, service uptime, and database metrics. |
| `POST` | `/api/auth/login` | Public | Authenticates user; returns JWT token and role profile. |
| `GET` | `/api/zones` | Public | Returns all 6 coastal sectors (WB-01 to WB-06) with geographic baselines. |
| `POST` | `/api/advisory/scan` | Public / Auth | Executes multi-agent scan across all zones with live satellite data. |
| `GET` | `/api/telemetry/live-verify` | Public | Audits live satellite readouts against INCOIS/IMD baseline models. |
| `GET` | `/api/vessels/live` | Public | Live AIS vessel feed (`?category=cargo,cruise,tanker,fishing,patrol`). |
| `GET` | `/api/catch-log` | Auth (Skipper) | Retrieves historical catch logs for the authenticated skipper. |
| `POST` | `/api/catch-log` | Auth (Skipper) | Submits a new catch log entry. |
| `GET` | `/api/violations` | Auth (Officer) | Returns recorded MFRA and maritime boundary violations. |
| `GET` | `/api/landing-log` | Auth (Port) | Retrieves quayside fish landing records. |
| `POST` | `/api/landing-log` | Auth (Port) | Logs an actual fish landing intake at the harbor. |
| `GET` | `/api/scan-log/export` | Auth (Scientist)| Exports longitudinal scan audits in `json` or `csv` format. |

---

## 10. Licensing & Acknowledgments

- **Hackathon Organizers**: Smart India Hackathon (SIH 2026), Ministry of Education, Govt of India.
- **Problem Statement Sponsor**: Indian Space Research Organisation (ISRO) — Problem Statement SIH26176.
- **Data Attributions**:
  - European Centre for Medium-Range Weather Forecasts (ECMWF)
  - Copernicus Marine Environment Monitoring Service (CMEMS)
  - National Oceanic and Atmospheric Administration (NOAA)
  - Indian National Centre for Ocean Information Services (INCOIS)
  - India Meteorological Department (IMD)
  - Directorate General of Lighthouses and Lightships (DGLL)

*Developed with pride by **Team Tech Titans**.*
