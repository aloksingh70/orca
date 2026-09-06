/**
 * agents.js
 * ---------------------------------------------------------------------------
 * THIS IS THE HACKATHON DELIVERABLE'S CORE LOGIC.
 *
 * For the SIH26176 demo, all four "agents" run client-side against a
 * deterministic, seeded simulation of ocean/weather/catch/closure data.
 * There is no backend and no live API call in this file.
 *
 * In the production architecture (see README.md), each function below would
 * be replaced by a real data fetch + a real scoring model, but the SHAPE of
 * the pipeline — four independent agent scores combined by an orchestrator
 * with a safety veto — does not change. That's the point of separating this
 * file from the UI: swapping simulated data for INCOIS/IMD/CMFRI feeds means
 * rewriting the bodies of the four `run*Agent` functions only.
 * ---------------------------------------------------------------------------
 */

// -- Deterministic seeded PRNG (mulberry32) ----------------------------------
// A "scan" for a given zone+date always produces the same numbers until the
// zone list, date, or seed changes. This is what lets the demo show a stable
// "Scan Coastline" result instead of re-randomizing on every render.
function mulberry32(seed) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedFromString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}

function seededRandom(zoneId, dateStr, salt) {
  const seed = seedFromString(`${zoneId}|${dateStr}|${salt}`)
  return mulberry32(seed)()
}

// Clamp helper
const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n))

// -----------------------------------------------------------------------------
// 1. Ocean Agent — SST + chlorophyll -> feeding-activity likelihood
// -----------------------------------------------------------------------------
function runOceanAgent(zone, dateStr) {
  const r1 = seededRandom(zone.id, dateStr, 'sst')
  const r2 = seededRandom(zone.id, dateStr, 'chl')

  // SST realistic band for the Bay of Bengal coastal waters (°C)
  const sst = +(zone.baseSST + (r1 - 0.5) * 3).toFixed(1)
  // Chlorophyll-a concentration (mg/m^3) — higher often means more plankton/fish activity
  const chlorophyll = +(zone.baseChlorophyll + (r2 - 0.5) * 1.2).toFixed(2)

  // Fish feeding activity tends to peak in a mid-range SST band (27-30°C)
  // and rises with chlorophyll concentration up to a point.
  const sstScore = 100 - Math.abs(sst - 28.5) * 14
  const chlScore = clamp(chlorophyll * 45)
  const score = clamp(sstScore * 0.55 + chlScore * 0.45)

  let summary
  if (score >= 70) {
    summary = `Sea surface temperature of ${sst}°C sits in the productive range, and chlorophyll at ${chlorophyll} mg/m³ points to active plankton bloom — strong feeding conditions likely.`
  } else if (score >= 45) {
    summary = `SST of ${sst}°C and chlorophyll of ${chlorophyll} mg/m³ suggest moderate feeding activity — not peak conditions, but fishable.`
  } else {
    summary = `SST of ${sst}°C is outside the productive band and chlorophyll is low at ${chlorophyll} mg/m³ — feeding activity likely subdued here.`
  }

  return {
    agent: 'ocean',
    label: 'Ocean Agent',
    score: Math.round(score),
    readouts: [
      { label: 'Sea Surface Temp', value: `${sst}°C` },
      { label: 'Chlorophyll-a', value: `${chlorophyll} mg/m³` }
    ],
    summary
  }
}

// -----------------------------------------------------------------------------
// 2. Weather Agent — wind speed + wave height -> safety-to-sail score
// -----------------------------------------------------------------------------
function runWeatherAgent(zone, dateStr) {
  const r1 = seededRandom(zone.id, dateStr, 'wind')
  const r2 = seededRandom(zone.id, dateStr, 'wave')

  const windSpeed = +(zone.baseWind + (r1 - 0.5) * 14).toFixed(1) // km/h
  const waveHeight = +(zone.baseWave + (r2 - 0.5) * 1.2).toFixed(1) // meters

  // Small mechanized/traditional fishing boats: risk rises sharply past
  // ~25 km/h wind and ~1.5m wave height.
  const windScore = clamp(100 - (windSpeed - 12) * 3.2)
  const waveScore = clamp(100 - (waveHeight - 0.6) * 45)
  const score = clamp(Math.min(windScore, waveScore) * 0.7 + (windScore * 0.5 + waveScore * 0.5) * 0.3)

  const unsafe = windSpeed > 32 || waveHeight > 2.2

  let summary
  if (unsafe) {
    summary = `Wind at ${windSpeed} km/h and wave height of ${waveHeight} m exceed safe limits for small craft — going out today is not advisable.`
  } else if (score >= 70) {
    summary = `Wind at ${windSpeed} km/h and wave height of ${waveHeight} m are within comfortable limits for a day trip.`
  } else if (score >= 45) {
    summary = `Wind at ${windSpeed} km/h and wave height of ${waveHeight} m are workable but call for caution, especially for smaller boats.`
  } else {
    summary = `Wind at ${windSpeed} km/h and wave height of ${waveHeight} m are rough — only experienced crews on larger boats should consider this zone.`
  }

  return {
    agent: 'weather',
    label: 'Weather Agent',
    score: Math.round(score),
    unsafe,
    readouts: [
      { label: 'Wind Speed', value: `${windSpeed} km/h` },
      { label: 'Wave Height', value: `${waveHeight} m` }
    ],
    summary
  }
}

// -----------------------------------------------------------------------------
// 3. History Agent — seasonal/historical catch record for this zone + month
// -----------------------------------------------------------------------------
function runHistoryAgent(zone, dateStr) {
  const date = new Date(dateStr)
  const month = date.getMonth() // 0-11
  const r = seededRandom(zone.id, dateStr, 'catch')

  // Each zone carries a 12-slot seasonal catch index (kg/trip, illustrative)
  const seasonalIndex = zone.seasonalCatchIndex[month]
  const catchEstimate = Math.round(seasonalIndex * (0.85 + r * 0.3))
  const score = clamp((catchEstimate / zone.peakCatch) * 100)

  const monthName = date.toLocaleString('en-US', { month: 'long' })

  let summary
  if (score >= 70) {
    summary = `${monthName} has historically been a strong month here, with past trips averaging around ${catchEstimate} kg — near this zone's seasonal peak.`
  } else if (score >= 45) {
    summary = `Historical trips in ${monthName} average around ${catchEstimate} kg for this zone — a middling but reliable month.`
  } else {
    summary = `${monthName} tends to be a quieter month here historically, with past trips averaging closer to ${catchEstimate} kg.`
  }

  return {
    agent: 'history',
    label: 'History Agent',
    score: Math.round(score),
    readouts: [
      { label: 'Avg. Catch (this month)', value: `${catchEstimate} kg/trip` },
      { label: 'Zone Seasonal Peak', value: `${zone.peakCatch} kg/trip` }
    ],
    summary
  }
}

// -----------------------------------------------------------------------------
// 4. Sustainability Agent — fishing-ban calendar + protected-area proximity
// -----------------------------------------------------------------------------
// India's east-coast trawling ban runs ~15 April - 14 June each year
// (exact dates vary slightly by state notification; illustrative here).
function isInBanWindow(date) {
  const year = date.getFullYear()
  const banStart = new Date(`${year}-04-15`)
  const banEnd = new Date(`${year}-06-14`)
  return date >= banStart && date <= banEnd
}

function runSustainabilityAgent(zone, dateStr) {
  const date = new Date(dateStr)
  const inBan = isInBanWindow(date)
  const nearProtected = zone.nearProtectedArea

  let score
  let summary

  if (inBan) {
    score = 0
    summary = `${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} falls inside the East-coast seasonal fishing ban (15 Apr – 14 Jun) — this zone is closed regardless of other conditions.`
  } else if (nearProtected) {
    score = 40
    summary = `Outside the ban window, but this zone sits near a protected breeding/sanctuary area — proceed with care and stay clear of marked boundaries.`
  } else {
    score = 100
    summary = `Outside the seasonal ban window and clear of protected breeding areas — no sustainability restrictions apply today.`
  }

  return {
    agent: 'sustain',
    label: 'Sustainability Agent',
    score,
    closed: inBan,
    readouts: [
      { label: 'Ban Window Status', value: inBan ? 'Closed (seasonal ban)' : 'Open' },
      { label: 'Protected Area Proximity', value: nearProtected ? 'Near sanctuary' : 'Clear' }
    ],
    summary
  }
}

// -----------------------------------------------------------------------------
// Orchestrator — combines the four agent scores into one ranked verdict
// -----------------------------------------------------------------------------
const WEIGHTS = { ocean: 0.3, weather: 0.3, history: 0.25, sustain: 0.15 }

function orchestrate(zone, ocean, weather, history, sustain) {
  const combinedScore = Math.round(
    ocean.score * WEIGHTS.ocean +
      weather.score * WEIGHTS.weather +
      history.score * WEIGHTS.history +
      sustain.score * WEIGHTS.sustain
  )

  // Safety veto: unsafe weather or a seasonal closure overrides everything.
  let verdict
  let orchestratorNote

  if (sustain.closed) {
    verdict = 'Seasonal Closure'
    orchestratorNote = `${zone.name} scores ${combinedScore}/100 on paper, but the Sustainability Agent's veto applies — this zone is inside the seasonal ban window, so it is marked not recommended regardless of ocean or weather conditions.`
  } else if (weather.unsafe) {
    verdict = 'Unsafe Today'
    orchestratorNote = `${zone.name} scores ${combinedScore}/100 on paper, but the Weather Agent's veto applies — sea conditions are unsafe for a trip today, so it is marked not recommended regardless of fish-activity or catch potential.`
  } else if (combinedScore >= 65) {
    verdict = 'Recommended'
    orchestratorNote = `${zone.name} combines strong ocean conditions, safe weather, and a solid historical catch record for this time of year — a good pick for today.`
  } else if (combinedScore >= 45) {
    verdict = 'Marginal'
    orchestratorNote = `${zone.name} is workable but not outstanding on at least one dimension — check the individual agent readings before committing a full day trip here.`
  } else {
    verdict = 'Marginal'
    orchestratorNote = `${zone.name} scores low across most agents today — better zones are likely available on the ranked list.`
  }

  return { combinedScore, verdict, orchestratorNote }
}

/**
 * runAgents(zone, date)
 * The single entry point the UI calls. Returns everything the advisory tool
 * needs to render a zone card + its reasoning trace panel.
 *
 * @param {object} zone - one entry from zones.js
 * @param {Date|string} date - the scenario date (defaults to today)
 */
export function runAgents(zone, date = new Date()) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const dateStr = dateObj.toISOString().slice(0, 10)

  const ocean = runOceanAgent(zone, dateStr)
  const weather = runWeatherAgent(zone, dateStr)
  const history = runHistoryAgent(zone, dateStr)
  const sustain = runSustainabilityAgent(zone, dateStr)

  const { combinedScore, verdict, orchestratorNote } = orchestrate(zone, ocean, weather, history, sustain)

  return {
    zoneId: zone.id,
    zoneName: zone.name,
    sectorCode: zone.sectorCode ?? 'WB',
    distanceOffshore: zone.distanceOffshore,
    soundingDepth: zone.soundingDepth ?? 15,
    seabed: zone.seabed ?? 'Silt & mud substrate',
    coordinates: zone.coordinates ?? "21°30'N, 88°00'E",
    coastalDistrict: zone.coastalDistrict ?? 'West Bengal Coast',
    harborName: zone.harborName ?? 'Coastal Jetty',
    fleetType: zone.fleetType ?? 'Small mechanized craft',
    date: dateStr,
    combinedScore,
    verdict,
    orchestratorNote,
    agents: [ocean, weather, history, sustain]
  }
}

/**
 * scanCoastline(zones, date)
 * Runs runAgents() across every zone and returns results ranked by
 * combined score (veto'd zones sink to the bottom regardless of score).
 */
export function scanCoastline(zones, date = new Date()) {
  const results = zones.map((zone) => runAgents(zone, date))
  return results.sort((a, b) => {
    const aVetoed = a.verdict === 'Unsafe Today' || a.verdict === 'Seasonal Closure'
    const bVetoed = b.verdict === 'Unsafe Today' || b.verdict === 'Seasonal Closure'
    if (aVetoed !== bVetoed) return aVetoed ? 1 : -1
    return b.combinedScore - a.combinedScore
  })
}
