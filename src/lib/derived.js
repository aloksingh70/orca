/**
 * derived.js
 * ---------------------------------------------------------------------------
 * Deterministic derived and simulated metrics for ORCA Maritime Personas.
 *
 * NOTE: As per hackathon specifications, all data in this file that does not
 * come directly from the four agents or zones dataset is simulated
 * DETERMINISTICALLY using the exact mulberry32 seeded-random approach.
 * Swapping these functions for live AIS / CMFRI / INCOIS feeds requires zero
 * changes to the downstream presentation layer.
 * ---------------------------------------------------------------------------
 */

import { runAgents } from './agents.js'

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

export function seededRandom(zoneId, dateStr, salt) {
  const seed = seedFromString(`${zoneId}|${dateStr}|${salt}`)
  return mulberry32(seed)()
}

/**
 * 1. Fleet Density Simulation (For Government / Marine Officer)
 * Simulates number of active motorized skiffs & trawlers currently in the sector.
 */
export function simulateFleetDensity(zoneId, dateStr) {
  const r = seededRandom(zoneId, dateStr, 'fleet_density')
  // Simulated vessel count between 2 and 36 boats
  const vesselCount = Math.floor(2 + r * 34)
  
  let riskLevel = 'low'
  if (vesselCount > 28) riskLevel = 'critical'
  else if (vesselCount > 18) riskLevel = 'high'
  else if (vesselCount > 10) riskLevel = 'moderate'

  return {
    vesselCount,
    riskLevel,
    aisCoverage: 'Coastal VHF / NavIC Transponder',
    patrolVesselNearby: r > 0.45 ? 'ICGS Varad (Fast Patrol)' : 'No patrol unit on station'
  }
}

/**
 * 2. Species Mix Breakdown (For Port Operator & Trade)
 * Deterministically splits harvest volume across key Bay of Bengal commercial species.
 */
export function simulateSpeciesMix(zoneId, dateStr, totalCatchKg = 500) {
  const r1 = seededRandom(zoneId, dateStr, 'sp_hilsa')
  const r2 = seededRandom(zoneId, dateStr, 'sp_pomfret')
  const r3 = seededRandom(zoneId, dateStr, 'sp_mackerel')
  const r4 = seededRandom(zoneId, dateStr, 'sp_shrimp')
  const r5 = seededRandom(zoneId, dateStr, 'sp_ribbon')

  // Raw weights
  const wHilsa = 25 + r1 * 25 // 25-50%
  const wPomfret = 15 + r2 * 20 // 15-35%
  const wMackerel = 10 + r3 * 15 // 10-25%
  const wShrimp = 8 + r4 * 14 // 8-22%
  const wRibbon = 5 + r5 * 10 // 5-15%

  const sum = wHilsa + wPomfret + wMackerel + wShrimp + wRibbon

  const pctHilsa = Math.round((wHilsa / sum) * 100)
  const pctPomfret = Math.round((wPomfret / sum) * 100)
  const pctMackerel = Math.round((wMackerel / sum) * 100)
  const pctShrimp = Math.round((wShrimp / sum) * 100)
  const pctRibbon = 100 - (pctHilsa + pctPomfret + pctMackerel + pctShrimp)

  return [
    {
      name: 'Tenualosa ilisha (Hilsa / Ilish)',
      shortName: 'Hilsa',
      species: 'Hilsa (Tenualosa ilisha)',
      percentage: pctHilsa,
      kg: Math.round((pctHilsa / 100) * totalCatchKg),
      estimatedKg: Math.round((pctHilsa / 100) * totalCatchKg),
      grade: 'Premium Grade A (₹950/kg)',
      color: 'bg-emerald-500'
    },
    {
      name: 'Pampus argenteus (Silver Pomfret)',
      shortName: 'Silver Pomfret',
      species: 'Silver Pomfret (Pampus argenteus)',
      percentage: pctPomfret,
      kg: Math.round((pctPomfret / 100) * totalCatchKg),
      estimatedKg: Math.round((pctPomfret / 100) * totalCatchKg),
      grade: 'Export Grade (₹680/kg)',
      color: 'bg-teal-500'
    },
    {
      name: 'Rastrelliger kanagurta (Indian Mackerel)',
      shortName: 'Mackerel',
      species: 'Indian Mackerel (Rastrelliger kanagurta)',
      percentage: pctMackerel,
      kg: Math.round((pctMackerel / 100) * totalCatchKg),
      estimatedKg: Math.round((pctMackerel / 100) * totalCatchKg),
      grade: 'Domestic Market (₹220/kg)',
      color: 'bg-blue-500'
    },
    {
      name: 'Penaeus monodon (Tiger Prawn / Shrimp)',
      shortName: 'Tiger Prawn',
      species: 'Tiger Prawn (Penaeus monodon)',
      percentage: pctShrimp,
      kg: Math.round((pctShrimp / 100) * totalCatchKg),
      estimatedKg: Math.round((pctShrimp / 100) * totalCatchKg),
      grade: 'Cold-Chain Export (₹850/kg)',
      color: 'bg-amber-500'
    },
    {
      name: 'Trichiurus lepturus (Largehead Ribbonfish)',
      shortName: 'Ribbonfish',
      species: 'Largehead Ribbonfish (Trichiurus lepturus)',
      percentage: pctRibbon,
      kg: Math.round((pctRibbon / 100) * totalCatchKg),
      estimatedKg: Math.round((pctRibbon / 100) * totalCatchKg),
      grade: 'Processing Wholesale (₹140/kg)',
      color: 'bg-indigo-400'
    }
  ]
}

/**
 * 3. Fuel & Travel Time Budget (For Vessel Skipper / Fisherman)
 * Computes round-trip sailing time and fuel burn based on offshore distance and boat speed.
 */
export function calculateTripBudget(distanceStr, speedKnots = 8, fuelBurnLPerHr = 3.2) {
  const match = (distanceStr || '').match(/(\d+)/)
  const km = match ? parseInt(match[1], 10) : 12
  const distanceNM = km * 0.539957 // km to Nautical Miles

  // Round trip values
  const roundTripKm = km * 2
  const roundTripNM = distanceNM * 2
  const oneWayHours = distanceNM / (speedKnots || 8)
  const roundTripHours = oneWayHours * 2

  // Diesel fuel burn (typical 9-12hp diesel long-tail or 40hp inboard skiff consumes 2.8 - 3.8 L/hr)
  const fuelBurnLiters = Math.round(roundTripHours * (fuelBurnLPerHr || 3.2))
  const fuelCostINR = Math.round(fuelBurnLiters * 92) // approx ₹92/liter subsidized diesel

  return {
    distanceKm: km,
    roundTripKm,
    distanceNM: +distanceNM.toFixed(1),
    roundTripNM: +roundTripNM.toFixed(1),
    speedKnots,
    roundTripHours: +roundTripHours.toFixed(1),
    oneWayHours: +oneWayHours.toFixed(1),
    fuelBurnLiters,
    fuelCostINR
  }
}

/**
 * 4. 3-Day Outlook Trend (For Vessel Skipper)
 * Runs the deterministic simulation for T, T+1, T+2 to provide a direction trend.
 */
export function simulateOutlook(zone, startDateStr, days = 3) {
  const baseDate = new Date(startDateStr)
  if (isNaN(baseDate.getTime())) return []

  const outlook = []
  let prevScore = null

  for (let i = 0; i < days; i++) {
    const d = new Date(baseDate)
    d.setDate(baseDate.getDate() + i)
    const dateIso = d.toISOString().slice(0, 10)
    
    // Evaluate zone
    const res = runAgents(zone, dateIso)
    
    // Format compact day label
    const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-GB', { weekday: 'short' })
    
    const weatherAgent = res.agents?.find((a) => a.agent === 'weather')
    const oceanAgent = res.agents?.find((a) => a.agent === 'ocean')

    const windRaw = weatherAgent?.readouts?.find((r) => r.label.includes('Wind'))?.value
    const waveRaw = weatherAgent?.readouts?.find((r) => r.label.includes('Wave'))?.value
    const sstRaw = oceanAgent?.readouts?.find((r) => r.label.includes('Temp'))?.value

    const windSpeed = windRaw ? parseFloat(windRaw) : (zone.baseWind ?? zone.base_wind ?? 18.0)
    const waveHeight = waveRaw ? parseFloat(waveRaw) : (zone.baseWave ?? zone.base_wave ?? 1.1)
    const sst = sstRaw ? parseFloat(sstRaw) : (zone.baseSST ?? zone.base_sst ?? 28.5)

    let trend = 'Steady'
    if (prevScore !== null) {
      if (res.combinedScore >= prevScore + 3) trend = 'Improving'
      else if (res.combinedScore <= prevScore - 3) trend = 'Deteriorating'
    }
    prevScore = res.combinedScore

    outlook.push({
      date: dateIso,
      dayLabel,
      combinedScore: res.combinedScore,
      score: res.combinedScore,
      verdict: res.verdict,
      windSpeed,
      waveHeight,
      sst,
      wind: `${windSpeed} km/h`,
      wave: `${waveHeight} m`,
      trend,
      isVetoed: res.verdict === 'Unsafe Today' || res.verdict === 'Seasonal Closure'
    })
  }

  return outlook
}

/**
 * 5. Scientific Anomaly Detection (For Marine Scientist / Oceanographer)
 * Flags if today's reading deviates significantly (>1.5x normal spread) from seasonal baseline.
 */
export function detectAnomalies(zone, dateStr, currentSST, currentChl) {
  const d = new Date(dateStr)
  const monthIdx = isNaN(d.getTime()) ? 0 : d.getMonth()

  const baselineSST = zone.seasonalSSTIndex?.[monthIdx] ?? zone.baseSST ?? 28.5
  const baselineChl = zone.seasonalChlorophyllIndex?.[monthIdx] ?? zone.baseChlorophyll ?? 1.8

  // Normal seasonal standard deviation spread in Bay of Bengal
  const sstStdDev = 0.45 // °C
  const chlStdDev = 0.20 // mg/m³

  const sstDiff = +(currentSST - baselineSST).toFixed(2)
  const chlDiff = +(currentChl - baselineChl).toFixed(2)

  const sstAnomaly = Math.abs(sstDiff) > 1.5 * sstStdDev
  const chlAnomaly = Math.abs(chlDiff) > 1.5 * chlStdDev

  return {
    baselineSST,
    baselineChl,
    sstDiff,
    chlDiff,
    sstDeviation: Math.abs(sstDiff),
    chlDeviation: Math.abs(chlDiff),
    sstAnomaly,
    chlAnomaly,
    hasAnomaly: sstAnomaly || chlAnomaly,
    sstLabel: sstAnomaly ? (sstDiff > 0 ? `Thermal Front Surge (+${sstDiff}°C)` : `Upwelling Cooling (${sstDiff}°C)`) : 'Normal Thermal Band',
    chlLabel: chlAnomaly ? (chlDiff > 0 ? `Plankton Bloom Surge (+${chlDiff} mg/m³)` : `Oligotrophic Dip (${chlDiff} mg/m³)`) : 'Seasonal Baseline'
  }
}

/**
 * 6. Weekly Volume Trend Simulation (For Port Operator / Trade)
 * Runs the deterministic simulation for the previous 7 days (date - 6 to date) to graph harvest volume.
 */
export function simulateWeeklyVolume(allZones, currentDateStr) {
  const baseDate = new Date(currentDateStr)
  if (isNaN(baseDate.getTime())) return []

  const weekData = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date(baseDate)
    d.setDate(baseDate.getDate() - i)
    const dateIso = d.toISOString().slice(0, 10)
    const dayLabel = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })

    let totalKg = 0
    let openSectors = 0

    allZones.forEach(z => {
      const res = runAgents(z, dateIso)
      const isClosed = res.verdict === 'Seasonal Closure' || res.verdict === 'Unsafe Today'
      const hist = res.agents?.find(a => a.agent === 'history')
      const match = hist?.readouts?.[0]?.value?.match(/(\d+)/)
      const catchEst = match ? parseInt(match[1], 10) : 0

      if (!isClosed) {
        totalKg += catchEst
        openSectors += 1
      }
    })

    weekData.push({
      date: dateIso,
      dayLabel,
      dayName: dayLabel,
      totalKg,
      totalBiomassKg: totalKg,
      totalTonnes: +(totalKg / 1000).toFixed(2),
      openSectors
    })
  }

  return weekData
}

/**
 * 7. Simulated Full-Season Data Generator (For Scientist CSV/JSON export)
 * Computes 12 months (Jan-Dec) of simulated environmental readings across all zones.
 */
export function generateFullSeasonData(allZones, year = 2026) {
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
  const records = []

  months.forEach(m => {
    const sampleDate = `${year}-${m}-15`
    allZones.forEach(z => {
      const res = runAgents(z, sampleDate)
      const ocean = res.agents?.find(a => a.agent === 'ocean')
      const weather = res.agents?.find(a => a.agent === 'weather')
      const history = res.agents?.find(a => a.agent === 'history')
      const sustain = res.agents?.find(a => a.agent === 'sustain')

      records.push({
        year,
        month: parseInt(m, 10),
        sampleDate,
        zoneId: z.id,
        zoneName: z.name,
        sectorCode: z.sectorCode,
        combinedScore: res.combinedScore,
        verdict: res.verdict,
        sst: ocean?.readouts?.find(r => r.label.includes('Temp'))?.value || '',
        chlorophyll: ocean?.readouts?.find(r => r.label.includes('Chlorophyll'))?.value || '',
        wind: weather?.readouts?.find(r => r.label.includes('Wind'))?.value || '',
        wave: weather?.readouts?.find(r => r.label.includes('Wave'))?.value || '',
        catchEstimate: history?.readouts?.[0]?.value || '',
        banStatus: sustain?.readouts?.[0]?.value || ''
      })
    })
  })

  return records
}
