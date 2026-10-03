import { useState, useEffect, useRef, useMemo } from 'react'
import {
  Calendar,
  AlertOctagon,
  ShieldCheck,
  CloudLightning,
  Sun,
  Sparkles,
  Loader2
} from 'lucide-react'

// Convert 'YYYY-MM-DD' to day of year (1-365)
function dateToDayOfYear(dateStr) {
  try {
    const d = new Date(dateStr)
    const start = new Date(d.getFullYear(), 0, 0)
    const diff = d - start
    const oneDay = 1000 * 60 * 60 * 24
    return Math.max(1, Math.min(365, Math.floor(diff / oneDay)))
  } catch {
    return 83
  }
}

// Convert day of year (1-365) to 'YYYY-MM-DD'
function dayOfYearToDate(day, year = 2026) {
  const safeDay = Math.max(1, Math.min(365, day))
  const d = new Date(year, 0)
  d.setDate(safeDay)
  return d.toISOString().slice(0, 10)
}

export default function ScenarioSlider({
  date = '2026-09-13',
  regionId = 'bay-of-bengal',
  onChange,
  isScanning = false
}) {
  const currentYear = useMemo(() => {
    try {
      return new Date(date).getFullYear() || 2026
    } catch {
      return 2026
    }
  }, [date])

  // Internal drag state for 60fps fluid thumb movement
  const [localDay, setLocalDay] = useState(() => dateToDayOfYear(date))
  const isDraggingRef = useRef(false)
  const debounceTimerRef = useRef(null)

  // Keep localDay in sync when date prop changes externally (e.g. from preset or page reset),
  // but NEVER override while the user is actively dragging.
  useEffect(() => {
    if (!isDraggingRef.current && date) {
      const incomingDay = dateToDayOfYear(date)
      setLocalDay(incomingDay)
    }
  }, [date])

  // Determine whether region is West Coast or East Coast
  const isWestCoast = useMemo(() => {
    return regionId === 'arabian-sea' || regionId === 'lakshadweep'
  }, [regionId])

  // Statutory Fishing Ban day bounds:
  // - West Coast (Arabian Sea / Lakshadweep): June 1 to July 31 (~days 152 to 212)
  // - East Coast & Andaman (Bay of Bengal / Andaman / Mannar): April 15 to June 14 (~days 105 to 165)
  const banStartDay = isWestCoast ? 152 : 105
  const banEndDay = isWestCoast ? 212 : 165
  const banLabel = isWestCoast ? 'West Coast Ban (Jun 1 – Jul 31)' : 'East Coast Ban (Apr 15 – Jun 14)'

  const banStartPct = ((banStartDay / 365) * 100).toFixed(1)
  const banEndPct = ((banEndDay / 365) * 100).toFixed(1)
  const banWidthPct = (banEndPct - banStartPct).toFixed(1)

  // Derive instant values from current localDay
  const activeDateStr = useMemo(() => dayOfYearToDate(localDay, currentYear), [localDay, currentYear])

  const isBanActive = localDay >= banStartDay && localDay <= banEndDay
  const isMonsoon = !isBanActive && localDay >= 170 && localDay <= 273 // July to September

  const formattedDate = useMemo(() => {
    try {
      const d = new Date(activeDateStr)
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return activeDateStr
    }
  }, [activeDateStr])

  // Dispatches date change to parent. Debounced while sliding, immediate on release.
  const handleDayChange = (newDay, immediate = false) => {
    const clamped = Math.max(1, Math.min(365, newDay))
    setLocalDay(clamped)

    const newDateStr = dayOfYearToDate(clamped, currentYear)

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (immediate) {
      if (onChange) onChange(newDateStr)
    } else {
      debounceTimerRef.current = setTimeout(() => {
        if (onChange) onChange(newDateStr)
      }, 120)
    }
  }

  // Preset Buttons adapted to current coast
  const PRESETS = useMemo(() => {
    const banPresetDate = isWestCoast ? `${currentYear}-06-25` : `${currentYear}-05-18`
    const banPresetSub = isWestCoast ? 'June 25 (Ban Active)' : 'May 18 (Ban Active)'

    return [
      {
        label: 'Normal Season',
        sub: 'March 24',
        date: `${currentYear}-03-24`,
        day: 83,
        icon: Sun,
        color: 'hover:border-emerald-500 text-emerald-800 bg-emerald-50/80'
      },
      {
        label: 'Fishing Ban Window',
        sub: banPresetSub,
        date: banPresetDate,
        day: isWestCoast ? 176 : 138,
        icon: AlertOctagon,
        color: 'hover:border-rose-500 text-rose-800 bg-rose-50/80 font-bold'
      },
      {
        label: 'Monsoon Squall Season',
        sub: 'July 10',
        date: `${currentYear}-07-10`,
        day: 191,
        icon: CloudLightning,
        color: 'hover:border-amber-500 text-amber-900 bg-amber-50/80'
      },
      {
        label: 'Post-Monsoon Peak',
        sub: 'October 20',
        date: `${currentYear}-10-20`,
        day: 293,
        icon: Sparkles,
        color: 'hover:border-sky-500 text-sky-900 bg-sky-50/80'
      }
    ]
  }, [currentYear, isWestCoast])

  return (
    <div className="bg-white border-2 border-sky-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      
      {/* Header & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-sky-100 text-sky-700">
              <Calendar size={15} />
            </span>
            <h3 className="font-serif font-bold text-sm sm:text-base text-[#0A1B27]">
              Interactive Year Simulation Slider
            </h3>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              Fluid Slider
            </span>
            {isScanning && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#007A78] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 animate-pulse">
                <Loader2 size={10} className="animate-spin" />
                <span>Simulating...</span>
              </span>
            )}
          </div>
          <p className="text-xs text-[#5C7788] mt-0.5">
            Drag the slider across the calendar year to see how weather seasons and the mandatory breeding ban transform ORCA's recommendations in real time.
          </p>
        </div>

        {/* Current Date Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              isBanActive
                ? 'bg-rose-100 text-rose-900 border-rose-300 ring-2 ring-rose-400/40'
                : isMonsoon
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-emerald-50 text-emerald-900 border-emerald-300'
            }`}
          >
            {isBanActive ? (
              <AlertOctagon size={14} className="text-rose-600 animate-pulse" />
            ) : isMonsoon ? (
              <CloudLightning size={14} className="text-amber-600" />
            ) : (
              <ShieldCheck size={14} className="text-emerald-600" />
            )}
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Visual Season & Ban Alert Banner */}
      <div
        className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 transition-all ${
          isBanActive
            ? 'bg-rose-50 border-rose-300 text-rose-950 font-medium'
            : isMonsoon
            ? 'bg-amber-50 border-amber-300 text-amber-950'
            : 'bg-sky-50 border-sky-200 text-[#2D4454]'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              isBanActive ? 'bg-rose-600 animate-ping' : isMonsoon ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
          />
          <div>
            {isBanActive ? (
              <span>
                <strong className="text-rose-800 font-bold uppercase tracking-wider block sm:inline mr-1">
                  🚨 Mandatory Statutory Breeding Ban Active:
                </strong>
                All monitored sectors automatically flip to <span className="font-bold underline">Seasonal Closure</span>. The Sustainability Agent's veto overrides all catch and ocean scores to safeguard fish breeding!
              </span>
            ) : isMonsoon ? (
              <span>
                <strong className="text-amber-800 font-bold block sm:inline mr-1">
                  ⚡ Southwest Monsoon Active:
                </strong>
                Higher squall probability. The Weather Agent tests localized wind and wave ceilings to protect mariners.
              </span>
            ) : (
              <span>
                <strong className="text-emerald-800 font-bold block sm:inline mr-1">
                  🌊 Open Commercial Season:
                </strong>
                The 4 agents rank sectors based on ocean temperatures, plankton concentrations, safe sea chop, and historical yield.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* INTEGRATED 365-DAY FLUID SLIDER WITH COLORED SEASON TRACK     */}
      {/* ------------------------------------------------------------- */}
      <div className="pt-2 pb-1">
        {/* Track Container */}
        <div className="relative w-full h-10 flex items-center select-none">
          
          {/* Visual Colored Track Background */}
          <div className="h-3.5 w-full rounded-full bg-slate-200 overflow-hidden relative flex shadow-inner">
            {/* Open Season Segment 1 */}
            <div
              style={{ width: `${banStartPct}%` }}
              className="h-full bg-emerald-400"
              title="Open Commercial Season"
            />
            {/* Statutory Ban Window Segment */}
            <div
              style={{ width: `${banWidthPct}%` }}
              className="h-full bg-rose-500 relative flex items-center justify-center"
              title={banLabel}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
            {/* Monsoon & Post-Monsoon Segment */}
            <div
              className="h-full flex-1 bg-sky-400"
              title="Monsoon & Winter Open Harvest"
            />
          </div>

          {/* Ban Window Marker Label */}
          <div
            className="absolute -top-1 text-[10px] font-bold text-rose-700 uppercase tracking-tight flex items-center gap-0.5 pointer-events-none"
            style={{ left: `${Math.max(4, Math.min(68, Number(banStartPct)))}%` }}
          >
            <span>▲</span>
            <span>{banLabel}</span>
          </div>

          {/* Native HTML5 Range Input overlayed directly over the track */}
          <input
            type="range"
            min="1"
            max="365"
            value={localDay}
            onPointerDown={() => {
              isDraggingRef.current = true
            }}
            onTouchStart={() => {
              isDraggingRef.current = true
            }}
            onPointerUp={(e) => {
              isDraggingRef.current = false
              handleDayChange(parseInt(e.target.value, 10), true)
            }}
            onTouchEnd={(e) => {
              isDraggingRef.current = false
              handleDayChange(parseInt(e.target.value, 10), true)
            }}
            onInput={(e) => {
              handleDayChange(parseInt(e.target.value, 10), false)
            }}
            onChange={(e) => {
              handleDayChange(parseInt(e.target.value, 10), false)
            }}
            aria-label="Interactive Year Simulation Slider"
            className="absolute inset-0 w-full h-full opacity-100 cursor-grab active:cursor-grabbing appearance-none bg-transparent focus:outline-none z-10
              [&::-webkit-slider-runnable-track]:bg-transparent
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-6
              [&::-webkit-slider-thumb]:h-6
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-[#007A78]
              [&::-webkit-slider-thumb]:border-[3px]
              [&::-webkit-slider-thumb]:border-white
              [&::-webkit-slider-thumb]:shadow-md
              [&::-webkit-slider-thumb]:cursor-grab
              [&::-webkit-slider-thumb]:active:cursor-grabbing
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-webkit-slider-thumb]:active:scale-125
              [&::-webkit-slider-thumb]:transition-transform
              [&::-moz-range-track]:bg-transparent
              [&::-moz-range-thumb]:w-6
              [&::-moz-range-thumb]:h-6
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-[#007A78]
              [&::-moz-range-thumb]:border-[3px]
              [&::-moz-range-thumb]:border-white
              [&::-moz-range-thumb]:shadow-md
              [&::-moz-range-thumb]:cursor-grab
              [&::-moz-range-thumb]:active:cursor-grabbing"
          />
        </div>

        {/* Month Markers */}
        <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1 px-1">
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
          <span className={!isWestCoast ? 'text-rose-600 font-bold' : ''}>Apr</span>
          <span className={!isWestCoast ? 'text-rose-600 font-bold' : ''}>May</span>
          <span className={isWestCoast ? 'text-rose-600 font-bold' : ''}>Jun</span>
          <span className={isWestCoast ? 'text-rose-600 font-bold' : ''}>Jul</span>
          <span>Aug</span>
          <span>Sep</span>
          <span>Oct</span>
          <span>Nov</span>
          <span>Dec</span>
        </div>
      </div>

      {/* Preset Buttons for Instant Navigation */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-700 mr-1">
          Quick Jump Scenarios:
        </span>
        {PRESETS.map((p) => {
          const Icon = p.icon
          const isSelected = activeDateStr === p.date || Math.abs(localDay - p.day) <= 2
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => handleDayChange(p.day, true)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${p.color} ${
                isSelected ? 'ring-2 ring-sky-400 font-bold bg-white shadow-xs' : 'border-slate-200'
              }`}
            >
              <Icon size={13} className="shrink-0" />
              <span>{p.label}</span>
              <span className="text-[10px] opacity-75 font-mono hidden sm:inline">({p.sub})</span>
            </button>
          )
        })}
      </div>

    </div>
  )
}
