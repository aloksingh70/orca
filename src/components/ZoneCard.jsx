import { Star, Clock, Fuel, AlertCircle, Ship } from 'lucide-react'
import { calculateTripBudget, detectAnomalies, simulateFleetDensity } from '../lib/derived.js'
import { zones } from '../lib/zones.js'

export default function ZoneCard({
  result,
  rank,
  selected,
  onSelect,
  role = 'skipper',
  isFavorite = false,
  onToggleFavorite = null,
  scanDate = new Date().toISOString().slice(0, 10),
  boatSpeed = 9
}) {
  const isBanVeto = result.verdict === 'Seasonal Closure'
  const isWeatherVeto = result.verdict === 'Unsafe Today'
  const isVetoed = isBanVeto || isWeatherVeto
  const isRecommended = result.verdict === 'Recommended'
  
  const ocean = result.agents?.find((a) => a.agent === 'ocean')
  const weather = result.agents?.find((a) => a.agent === 'weather')
  const history = result.agents?.find((a) => a.agent === 'history')
  const sustain = result.agents?.find((a) => a.agent === 'sustain')

  const isNearSanctuary = sustain?.readouts?.some((r) => r.value?.toLowerCase().includes('sanctuary'))

  // Zone metadata lookup for derived computations
  const zoneObj = zones.find((z) => z.id === result.zoneId) || zones[0]

  // Derived: Trip budget for skipper
  const tripBudget = calculateTripBudget(result.distanceOffshore, boatSpeed, 14)

  // Derived: Anomaly detection for researcher
  const currentSstVal = parseFloat(ocean?.readouts?.[0]?.value) || zoneObj.baseSST
  const currentChlVal = parseFloat(ocean?.readouts?.[1]?.value) || zoneObj.baseChlorophyll
  const anomalyInfo = detectAnomalies(zoneObj, scanDate, currentSstVal, currentChlVal)

  // Derived: Fleet density for officer
  const fleetInfo = simulateFleetDensity(result.zoneId, scanDate)


  // 1. Role-based verdict labels and styles
  let verdictText = result.verdict
  let statusClass = 'border-slate-300 bg-slate-100 text-slate-800'
  let accentBorder = 'border-l-slate-400'

  if (role === 'officer') {
    if (isBanVeto) {
      verdictText = 'Zone in Seasonal Violation'
      statusClass = 'border-red-300 bg-red-50 text-red-800 font-bold'
      accentBorder = 'border-l-red-600'
    } else if (isWeatherVeto) {
      verdictText = 'Marine Hazard Warning'
      statusClass = 'border-orange-300 bg-orange-50 text-orange-900 font-bold'
      accentBorder = 'border-l-orange-600'
    } else if (isNearSanctuary) {
      verdictText = 'Buffer Zone Monitored'
      statusClass = 'border-amber-300 bg-amber-50 text-amber-900 font-bold'
      accentBorder = 'border-l-amber-600'
    } else if (isRecommended) {
      verdictText = 'Zone Open — Compliant'
      statusClass = 'border-emerald-300 bg-emerald-50 text-emerald-800 font-bold'
      accentBorder = 'border-l-emerald-600'
    } else {
      verdictText = 'Zone Open — Caution'
      statusClass = 'border-teal-300 bg-teal-50 text-teal-900 font-bold'
      accentBorder = 'border-l-teal-600'
    }
  } else if (role === 'skipper') {
    if (isBanVeto) {
      verdictText = 'Seasonal Ban (Closed)'
      statusClass = 'border-red-300 bg-red-50 text-red-800 font-bold'
      accentBorder = 'border-l-red-600'
    } else if (isWeatherVeto) {
      verdictText = 'Unsafe — Stay in Harbor'
      statusClass = 'border-red-300 bg-red-50 text-red-800 font-bold'
      accentBorder = 'border-l-red-600'
    } else if (isRecommended) {
      verdictText = 'Safe to Sail — Go'
      statusClass = 'border-emerald-300 bg-emerald-50 text-emerald-800 font-bold'
      accentBorder = 'border-l-emerald-600'
    } else {
      verdictText = 'Workable (Caution)'
      statusClass = 'border-amber-300 bg-amber-50 text-amber-900 font-bold'
      accentBorder = 'border-l-amber-600'
    }
  } else if (role === 'port_crew') {
    if (isBanVeto) {
      verdictText = 'Closed (0 kg Inflow)'
      statusClass = 'border-red-300 bg-red-50 text-red-800 font-bold'
      accentBorder = 'border-l-red-600'
    } else if (isWeatherVeto) {
      verdictText = 'Squall Delay'
      statusClass = 'border-orange-300 bg-orange-50 text-orange-900 font-bold'
      accentBorder = 'border-l-orange-600'
    } else if (isRecommended) {
      verdictText = 'High Landing Potential'
      statusClass = 'border-emerald-300 bg-emerald-50 text-emerald-800 font-bold'
      accentBorder = 'border-l-emerald-600'
    } else {
      verdictText = 'Moderate Inflow'
      statusClass = 'border-amber-300 bg-amber-50 text-amber-900 font-bold'
      accentBorder = 'border-l-amber-600'
    }
  } else if (role === 'public') {
    if (isBanVeto) {
      verdictText = 'Breeding Ban (Closed)'
      statusClass = 'border-rose-300 bg-rose-50 text-rose-800 font-bold'
      accentBorder = 'border-l-rose-600'
    } else if (isWeatherVeto) {
      verdictText = 'Rough Seas Warning'
      statusClass = 'border-rose-300 bg-rose-50 text-rose-800 font-bold'
      accentBorder = 'border-l-rose-600'
    } else if (isRecommended) {
      verdictText = 'Best Spot Today'
      statusClass = 'border-emerald-300 bg-emerald-50 text-emerald-800 font-bold'
      accentBorder = 'border-l-emerald-600'
    } else {
      verdictText = 'Workable (Caution)'
      statusClass = 'border-amber-300 bg-amber-50 text-amber-900 font-bold'
      accentBorder = 'border-l-amber-600'
    }
  } else {
    // researcher
    if (isVetoed) {
      statusClass = 'border-red-300 bg-red-50 text-red-800 font-bold'
      accentBorder = 'border-l-red-600'
    } else if (isRecommended) {
      statusClass = 'border-emerald-300 bg-emerald-50 text-emerald-800 font-bold'
      accentBorder = 'border-l-emerald-600'
    } else {
      statusClass = 'border-amber-300 bg-amber-50 text-amber-900 font-bold'
      accentBorder = 'border-l-amber-600'
    }
  }

  // Precision formatting for researcher
  const formatScore = (val) => {
    if (role === 'researcher') {
      return typeof val === 'number' ? val.toFixed(1) : val
    }
    return Math.round(val)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (onSelect) onSelect()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={`w-full text-left transition-all p-3.5 flex flex-col gap-2 rounded-r ${accentBorder} border-l-[4px] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#007A78] focus-visible:outline-none select-none ${
        selected
          ? 'bg-white border-y border-r border-teal-700 ring-2 ring-teal-700/20 shadow-md'
          : 'bg-white border-y border-r border-slate-300 hover:border-slate-400 shadow-xs'
      } ${isVetoed ? 'opacity-95' : ''}`}
    >
      {/* Top Header: Code, Sector Name, Distance, Verdict Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 tabular-nums">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavorite(result.zoneId)
                }}
                className="text-slate-400 hover:text-amber-500 transition-colors p-0.5 -ml-1 cursor-pointer"
                title={isFavorite ? "Remove from my usual zones shortlist" : "Pin to my usual zones shortlist"}
              >
                <Star size={14} className={isFavorite ? "fill-amber-400 text-amber-500" : ""} />
              </button>
            )}
            <span className="font-bold text-teal-800">
              {result.sectorCode || `WB-0${rank}`}
            </span>
            <span>•</span>
            <span>{result.distanceOffshore} offshore</span>
            {result.soundingDepth && (
              <>
                <span>•</span>
                <span className="text-slate-900 font-bold">{result.soundingDepth}m depth</span>
              </>
            )}
            {role === 'officer' && (
              <>
                <span>•</span>
                <span className="text-slate-500 font-mono">{result.coastalDistrict}</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-0.5">
            <h3 className="font-serif text-lg font-bold text-slate-900">
              {result.zoneName}
            </h3>
            {isFavorite && (
              <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-mono font-bold">
                SHORTLIST
              </span>
            )}
          </div>

          {/* Role-specific subtitle badges */}
          {role === 'skipper' && !isVetoed && (
            <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-900 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-200 w-fit">
              <span className="flex items-center gap-1">
                <Clock size={11} className="text-emerald-700" />
                <span>{tripBudget.roundTripHours}h return</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Fuel size={11} className="text-emerald-700" />
                <span>{tripBudget.fuelLiters}L fuel (~₹{tripBudget.fuelCostINR.toLocaleString()})</span>
              </span>
            </div>
          )}

          {role === 'officer' && (
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 w-fit font-mono">
              <Ship size={11} className="text-[#007A78]" />
              <span>Fleet: <strong>{fleetInfo.totalVessels} craft</strong> ({fleetInfo.mechanizedTrawlers} trawlers{fleetInfo.unauthorizedCraft > 0 ? `, ${fleetInfo.unauthorizedCraft} unverified` : ''})</span>
            </div>
          )}

          {role === 'researcher' && anomalyInfo.hasAnomaly && (
            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 w-fit font-mono font-bold">
              <AlertCircle size={11} className="text-rose-600" />
              <span>Anomaly: {anomalyInfo.sstAnomaly ? `SST Δ ${(anomalyInfo.sstDeviation ?? Math.abs(anomalyInfo.sstDiff || 0)).toFixed(1)}°C` : ''} {anomalyInfo.chlAnomaly ? `Chl-a Δ ${(anomalyInfo.chlDeviation ?? Math.abs(anomalyInfo.chlDiff || 0)).toFixed(2)}` : ''}</span>
            </div>
          )}

          {role === 'public' && (
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-sky-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 w-fit">
              <span className="font-semibold">
                {isBanVeto
                  ? 'Seasonal breeding protection active'
                  : isWeatherVeto
                  ? 'Weather safety ceiling tripped'
                  : isRecommended
                  ? 'High fish gathering + calm sea state'
                  : 'Workable sea state'}
              </span>
            </div>
          )}
        </div>

        {/* Verdict Badge */}
        <span className={`shrink-0 text-xs px-2.5 py-1 border rounded leading-tight text-center ${statusClass}`}>
          {verdictText}
        </span>
      </div>


      {/* Bottom Readout Strip: Telemetry Ordered & Focused by Role */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-600 tabular-nums">
        
        {/* Role 1: Skipper — Weather leads */}
        {role === 'skipper' && (
          <div className="flex items-center gap-3">
            {weather && weather.readouts?.[0] && (
              <span>Wind <strong className="text-slate-900 font-bold">{weather.readouts[0].value}</strong></span>
            )}
            {weather && weather.readouts?.[1] && (
              <span>Wave <strong className="text-slate-900 font-bold">{weather.readouts[1].value}</strong></span>
            )}
            {ocean && ocean.readouts?.[0] && (
              <span className="hidden sm:inline">SST <strong className="text-slate-900 font-bold">{ocean.readouts[0].value}</strong></span>
            )}
          </div>
        )}

        {/* Role 2: Officer — Sustainability & Compliance leads */}
        {role === 'officer' && (
          <div className="flex items-center gap-3">
            {sustain && (
              <span>Mandate <strong className={sustain.closed ? 'text-red-700 font-bold' : 'text-emerald-700 font-bold'}>
                {sustain.closed ? 'BAN ENFORCED' : 'OPEN'}
              </strong></span>
            )}
            {isNearSanctuary && (
              <span className="text-amber-800 font-semibold hidden sm:inline">Near Sanctuary</span>
            )}
            {weather && weather.readouts?.[0] && (
              <span className="hidden sm:inline">Wind <strong className="text-slate-900 font-bold">{weather.readouts[0].value}</strong></span>
            )}
          </div>
        )}

        {/* Role 3: Researcher — High precision readings */}
        {role === 'researcher' && (
          <div className="flex items-center gap-3 font-mono text-[11px]">
            {ocean && ocean.readouts?.[0] && (
              <span>SST: <strong className="text-slate-900 font-bold">{ocean.readouts[0].value}</strong></span>
            )}
            {ocean && ocean.readouts?.[1] && (
              <span>Chl-a: <strong className="text-slate-900 font-bold">{ocean.readouts[1].value}</strong></span>
            )}
            {weather && weather.readouts?.[0] && (
              <span className="hidden sm:inline">Wind: <strong className="text-slate-900 font-bold">{weather.readouts[0].value}</strong></span>
            )}
          </div>
        )}

        {/* Role 4: Port Operator — History & Catch Volume leads */}
        {role === 'port_crew' && (
          <div className="flex items-center gap-3">
            {history && history.readouts?.[0] && (
              <span>Trip Est <strong className="text-slate-900 font-bold">{isVetoed ? '0 kg' : history.readouts[0].value.replace('/trip', '')}</strong></span>
            )}
            {history && history.readouts?.[1] && (
              <span className="hidden sm:inline">Peak <strong className="text-slate-700 font-medium">{history.readouts[1].value.replace('/trip', '')}</strong></span>
            )}
            <span className="hidden md:inline text-slate-500 font-medium">{result.harborName}</span>
          </div>
        )}

        {/* Role 5: Curious Visitor / Public — Jargon-free translations alongside numbers */}
        {role === 'public' && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {isBanVeto ? (
              <span className="text-rose-800 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                <span>Annual Spawning Sanctuary (Ban Active)</span>
              </span>
            ) : isWeatherVeto ? (
              <span className="text-rose-800 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                <span>Rough sea warning ({weather?.readouts?.[0]?.value || ''})</span>
              </span>
            ) : (
              <>
                <span className="text-emerald-800 font-medium">
                  {weather?.score >= 70 ? 'Sea is calm today' : 'Workable chop'} ({weather?.readouts?.[0]?.value || ''})
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-teal-800 font-medium hidden sm:inline">
                  {ocean?.score >= 65 ? 'Fish gathering likely' : 'Moderate feeding'} ({ocean?.readouts?.[0]?.value || ''})
                </span>
              </>
            )}
          </div>
        )}

        {/* Score Stamp */}
        <div className="flex items-baseline gap-1 shrink-0">
          {isVetoed ? (
            <span className="text-red-700 font-serif font-bold text-xs uppercase">
              {role === 'officer' ? 'VETOED' : role === 'port_crew' ? 'NO INFLOW' : 'VETOED'}
            </span>
          ) : (
            <>
              <span className="font-serif text-xl font-bold text-slate-900">
                {formatScore(result.combinedScore)}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">/100</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}


