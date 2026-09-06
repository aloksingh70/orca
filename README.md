# ORCA — Marine EcoSystem Reasoning with Collaborative Agents

**Smart India Hackathon 2026 — Problem Statement SIH26176 (ISRO) — Software / Miscellaneous**
**Team: Tech Titans**

ORCA recommends safe, productive fishing zones to fishermen along the Indian coast. Instead of
manually cross-referencing satellite ocean data, weather forecasts, historical catch records, and
fishing-ban calendars, ORCA runs four specialized AI agents over these data sources, and an
orchestrator combines their outputs into one ranked, **explainable** recommendation — not a
black-box score.

## Running the project

```bash
npm install
npm run dev
```

Then open the printed local URL. The landing page is at `/`, the working advisory tool is at
`/advisory`.

```bash
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```

## What is simulated vs. what is real (read this first)

This is the **hackathon MVP deliverable**, and it is intentionally 100% client-side:

- There is **no backend** in this repository.
- All ocean, weather, catch, and ban-calendar data is **simulated** in the browser using a
  deterministic, seeded random function (`src/lib/agents.js`). A "scan" for a given zone and date
  always returns the same numbers until you change the zone list, the date, or re-scan — it is
  not re-randomized on every render.
- The four agents and the orchestrator are plain JavaScript functions, not calls to an LLM or an
  external AI service. This keeps the demo fast, offline-capable, and fully reproducible on any
  judge's laptop with no API keys.

The scoring logic lives entirely in **`src/lib/agents.js`**, behind a single entry point:

```js
runAgents(zone, date) // -> { combinedScore, verdict, orchestratorNote, agents: [...] }
scanCoastline(zones, date) // -> runAgents() for every zone, ranked
```

Everything the UI needs — per-agent scores, readouts, plain-language summaries, and the final
orchestrator verdict — comes out of this one function. That separation is deliberate: swapping
simulated data for real APIs means rewriting the *bodies* of the four `run*Agent` functions in
this one file. No other file in the project needs to change.

## The four agents (as implemented in `src/lib/agents.js`)

| Agent | Reads (simulated) | Scores |
|---|---|---|
| **Ocean Agent** | Sea surface temperature (SST), chlorophyll-a concentration | Likelihood of active fish feeding |
| **Weather Agent** | Wind speed, wave height | Safety of going out to that zone today |
| **History Agent** | Seasonal/historical catch record for the zone and month | Expected catch based on past trips |
| **Sustainability Agent** | East-coast fishing-ban calendar (~15 Apr – 14 Jun), protected-area proximity | Whether the zone is open, restricted, or closed |

The **orchestrator** combines all four into a single 0–100 score, then applies a **safety veto**:
if the Weather Agent flags unsafe conditions, or the Sustainability Agent flags a seasonal
closure, the zone is marked *"Unsafe Today"* or *"Seasonal Closure"* regardless of how well it
scores on ocean conditions or historical catch.

## Zones covered

Six real West Bengal coastal fishing zones, with illustrative baseline data:
Digha, Shankarpur, Junput, Sagar Island, Frazerganj, Kakdwip (`src/lib/zones.js`).

## Project structure

```
/src
  /components
    Navbar.jsx            navigation + mobile menu
    Hero.jsx              landing page hero
    ScanButton.jsx         "Scan Coastline" action with loading state
    ZoneCard.jsx           ranked zone result, expands to its reasoning trace
    AgentGauge.jsx         circular score gauge, one per agent
    ReasoningTrace.jsx     the four-agent breakdown + orchestrator verdict
    ScenarioDatePicker.jsx date picker for the what-if ban-window simulation
  /lib
    agents.js              runAgents(zone, date) — the scoring pipeline
    zones.js               the six-zone dataset
  /pages
    index.jsx               landing page
    advisory.jsx             the working advisory tool
  App.jsx                    routes
  main.jsx                   entry point
```

## Production roadmap (not built for this demo)

The MVP above is the actual hackathon deliverable. If ORCA moved beyond the demo, the intended
architecture is:

- **Backend:** FastAPI (Python), PostgreSQL + PostGIS for geospatial zone data.
- **Agent orchestration:** LangChain or LlamaIndex, with an LLM (open-source Llama 3 or a hosted
  API) acting as the orchestrator that reasons over the four agents' outputs.
- **Real data sources:** INCOIS (Indian ocean / Potential Fishing Zone advisories), IMD
  (weather), CMFRI (catch statistics), AIS vessel feeds.
- **Vector store (FAISS/Chroma):** for RAG, if the orchestrator needs to reason over unstructured
  advisories or reports rather than just structured scores.

Because `runAgents(zone, date)` is the only place simulated data is generated, none of this
backend work requires touching the React UI — the four `run*Agent` functions would be replaced
with real fetches, and everything downstream (gauges, reasoning trace, ranked list, verdicts)
keeps working unchanged.

## Tech stack (MVP)

React (function components + hooks) · Vite · React Router · Tailwind CSS · lucide-react
