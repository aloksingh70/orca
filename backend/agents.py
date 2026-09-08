import hashlib
from datetime import datetime
from typing import Dict, Any, List

def clamp(val: float, min_val: float = 0.0, max_val: float = 100.0) -> float:
    return max(min_val, min(max_val, val))

def seeded_random(zone_id: str, date_str: str, salt: str) -> float:
    """Generate a deterministic float [0, 1) from zone, date, and salt."""
    key = f"{zone_id}|{date_str}|{salt}".encode("utf-8")
    hash_int = int(hashlib.sha256(key).hexdigest()[:8], 16)
    return (hash_int % 1000000) / 1000000.0

def run_ocean_agent(zone, date_str: str) -> Dict[str, Any]:
    r1 = seeded_random(zone.id, date_str, "sst")
    r2 = seeded_random(zone.id, date_str, "chl")

    sst = round(zone.base_sst + (r1 - 0.5) * 3, 1)
    chlorophyll = round(zone.base_chlorophyll + (r2 - 0.5) * 1.2, 2)

    sst_score = 100 - abs(sst - 28.5) * 14
    chl_score = clamp(chlorophyll * 45)
    score = clamp(sst_score * 0.55 + chl_score * 0.45)

    if score >= 70:
        summary = (f"Sea surface temperature of {sst}°C sits in the productive range, "
                   f"and chlorophyll at {chlorophyll} mg/m³ points to active plankton bloom — strong feeding conditions likely.")
    elif score >= 45:
        summary = (f"SST of {sst}°C and chlorophyll of {chlorophyll} mg/m³ suggest moderate feeding activity — "
                   f"not peak conditions, but fishable.")
    else:
        summary = (f"SST of {sst}°C is outside the productive band and chlorophyll is low at {chlorophyll} mg/m³ — "
                   f"feeding activity likely subdued here.")

    return {
        "agent": "ocean",
        "label": "Ocean Agent",
        "score": int(round(score)),
        "readouts": [
            {"label": "Sea Surface Temp", "value": f"{sst}°C"},
            {"label": "Chlorophyll-a", "value": f"{chlorophyll} mg/m³"}
        ],
        "summary": summary
    }

def run_weather_agent(zone, date_str: str) -> Dict[str, Any]:
    r1 = seeded_random(zone.id, date_str, "wind")
    r2 = seeded_random(zone.id, date_str, "wave")

    wind_speed = round(zone.base_wind + (r1 - 0.5) * 14, 1)
    wave_height = round(zone.base_wave + (r2 - 0.5) * 1.2, 1)

    wind_score = clamp(100 - (wind_speed - 12) * 3.2)
    wave_score = clamp(100 - (wave_height - 0.6) * 45)
    score = clamp(min(wind_score, wave_score) * 0.7 + (wind_score * 0.5 + wave_score * 0.5) * 0.3)

    unsafe = wind_speed > 32 or wave_height > 2.2

    if unsafe:
        summary = (f"Wind at {wind_speed} km/h and wave height of {wave_height} m exceed safe limits for small craft — "
                   f"going out today is not advisable.")
    elif score >= 70:
        summary = (f"Wind at {wind_speed} km/h and wave height of {wave_height} m are within comfortable limits for a day trip.")
    elif score >= 45:
        summary = (f"Wind at {wind_speed} km/h and wave height of {wave_height} m are workable but call for caution, "
                   f"especially for smaller boats.")
    else:
        summary = (f"Wind at {wind_speed} km/h and wave height of {wave_height} m are rough — "
                   f"only experienced crews on larger boats should consider this zone.")

    return {
        "agent": "weather",
        "label": "Weather Agent",
        "score": int(round(score)),
        "unsafe": unsafe,
        "readouts": [
            {"label": "Wind Speed", "value": f"{wind_speed} km/h"},
            {"label": "Wave Height", "value": f"{wave_height} m"}
        ],
        "summary": summary
    }

def run_history_agent(zone, date_str: str) -> Dict[str, Any]:
    dt = datetime.strptime(date_str[:10], "%Y-%m-%d")
    month_idx = dt.month - 1
    r = seeded_random(zone.id, date_str, "catch")

    seasonal_index = zone.seasonal_catch_index[month_idx]
    catch_estimate = int(round(seasonal_index * (0.85 + r * 0.3)))
    score = clamp((catch_estimate / zone.peak_catch) * 100)
    month_name = dt.strftime("%B")

    if score >= 70:
        summary = (f"{month_name} has historically been a strong month here, with past trips averaging around "
                   f"{catch_estimate} kg — near this zone's seasonal peak.")
    elif score >= 45:
        summary = (f"Historical trips in {month_name} average around {catch_estimate} kg for this zone — "
                   f"a middling but reliable month.")
    else:
        summary = (f"{month_name} tends to be a quieter month here historically, with past trips averaging closer to "
                   f"{catch_estimate} kg.")

    return {
        "agent": "history",
        "label": "History Agent",
        "score": int(round(score)),
        "readouts": [
            {"label": "Avg. Catch (this month)", "value": f"{catch_estimate} kg/trip"},
            {"label": "Zone Seasonal Peak", "value": f"{zone.peak_catch} kg/trip"}
        ],
        "summary": summary
    }

def is_in_ban_window(date_str: str) -> bool:
    dt = datetime.strptime(date_str[:10], "%Y-%m-%d")
    year = dt.year
    ban_start = datetime(year, 4, 15)
    ban_end = datetime(year, 6, 14)
    return ban_start <= dt <= ban_end

def run_sustainability_agent(zone, date_str: str) -> Dict[str, Any]:
    in_ban = is_in_ban_window(date_str)
    near_protected = zone.near_protected_area
    dt = datetime.strptime(date_str[:10], "%Y-%m-%d")
    date_display = dt.strftime("%d %B")

    if in_ban:
        score = 0
        summary = (f"{date_display} falls inside the East-coast seasonal fishing ban (15 Apr – 14 Jun) — "
                   f"this zone is closed regardless of other conditions.")
    elif near_protected:
        score = 40
        summary = ("Outside the ban window, but this zone sits near a protected breeding/sanctuary area — "
                   "proceed with care and stay clear of marked boundaries.")
    else:
        score = 100
        summary = ("Outside the seasonal ban window and clear of protected breeding areas — "
                   "no sustainability restrictions apply today.")

    return {
        "agent": "sustain",
        "label": "Sustainability Agent",
        "score": score,
        "closed": in_ban,
        "readouts": [
            {"label": "Ban Window Status", "value": "Closed (seasonal ban)" if in_ban else "Open"},
            {"label": "Protected Area Proximity", "value": "Near sanctuary" if near_protected else "Clear"}
        ],
        "summary": summary
    }

def orchestrate(zone, ocean: dict, weather: dict, history: dict, sustain: dict) -> Dict[str, Any]:
    weights = {"ocean": 0.3, "weather": 0.3, "history": 0.25, "sustain": 0.15}
    combined = int(round(
        ocean["score"] * weights["ocean"] +
        weather["score"] * weights["weather"] +
        history["score"] * weights["history"] +
        sustain["score"] * weights["sustain"]
    ))

    if sustain.get("closed"):
        verdict = "Seasonal Closure"
        note = (f"{zone.name} scores {combined}/100 on paper, but the Sustainability Agent's veto applies — "
                f"this zone is inside the seasonal ban window, so it is marked not recommended regardless of ocean or weather conditions.")
    elif weather.get("unsafe"):
        verdict = "Unsafe Today"
        note = (f"{zone.name} scores {combined}/100 on paper, but the Weather Agent's veto applies — "
                f"sea conditions are unsafe for a trip today, so it is marked not recommended regardless of fish-activity or catch potential.")
    elif combined >= 65:
        verdict = "Recommended"
        note = (f"{zone.name} combines strong ocean conditions, safe weather, and a solid historical catch record for this time of year — "
                f"a good pick for today.")
    elif combined >= 45:
        verdict = "Marginal"
        note = (f"{zone.name} is workable but not outstanding on at least one dimension — "
                f"check the individual agent readings before committing a full day trip here.")
    else:
        verdict = "Marginal"
        note = (f"{zone.name} scores low across most agents today — better zones are likely available on the ranked list.")

    return {
        "combinedScore": combined,
        "verdict": verdict,
        "orchestratorNote": note
    }

def evaluate_zone(zone, date_str: str) -> Dict[str, Any]:
    ocean = run_ocean_agent(zone, date_str)
    weather = run_weather_agent(zone, date_str)
    history = run_history_agent(zone, date_str)
    sustain = run_sustainability_agent(zone, date_str)

    decision = orchestrate(zone, ocean, weather, history, sustain)

    return {
        "zoneId": zone.id,
        "zoneName": zone.name,
        "sectorCode": zone.sector_code or "WB",
        "distanceOffshore": zone.distance_offshore,
        "soundingDepth": zone.sounding_depth or 15,
        "seabed": zone.seabed or "Silt & mud substrate",
        "coordinates": zone.coordinates or "21°30'N, 88°00'E",
        "coastalDistrict": zone.coastal_district or "West Bengal Coast",
        "harborName": zone.harbor_name or "Coastal Jetty",
        "fleetType": zone.fleet_type or "Small mechanized craft",
        "date": date_str,
        "combinedScore": decision["combinedScore"],
        "verdict": decision["verdict"],
        "orchestratorNote": decision["orchestratorNote"],
        "agents": [ocean, weather, history, sustain]
    }

def scan_coastline(zones: list, date_str: str) -> List[Dict[str, Any]]:
    results = [evaluate_zone(z, date_str) for z in zones]
    
    def sort_key(item):
        vetoed = item["verdict"] in ["Unsafe Today", "Seasonal Closure"]
        return (vetoed, -item["combinedScore"])

    results.sort(key=sort_key)
    return results
