import { useState, useEffect, useMemo } from 'react'
import { zones } from '../lib/zones.js'
import { CORRIDORS, getCorridorByPortId, getCorridorByZoneId } from '../lib/hydrography.js'
import {
  Layers,
  Info,
  Waves,
  Anchor,
  Ship,
  Compass,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Search,
  ExternalLink,
  ShieldCheck
} from 'lucide-react'

export default function BathymetricSounder({
  activeZoneId = null,
  onSelectZone = null,
  onCorridorChange = null,
  interactive = true,
  compact = false,
  panoramic = false,
  initialPortId = 'kolkata-haldia'
}) {
  // Determine starting corridor based on activeZoneId or initialPortId
  const initialCorridor = useMemo(() => {
    if (activeZoneId) return getCorridorByZoneId(activeZoneId)
    return getCorridorByPortId(initialPortId)
  }, [activeZoneId, initialPortId])

  const [selectedCorridorId, setSelectedCorridorId] = useState(initialCorridor.id)
  const [selectedId, setSelectedId] = useState(activeZoneId || initialCorridor.defaultZoneId)
  const [viewMode, setViewMode] = useState('corridor') // 'corridor' | 'all'
  const [hoveredZoneId, setHoveredZoneId] = useState(null)
  const [matrixFilter, setMatrixFilter] = useState('all') // 'all' | 'bay-of-bengal' | 'arabian-sea' | 'islands'
  const [matrixSort, setMatrixSort] = useState('depth-asc') // 'depth-asc' | 'depth-desc' | 'distance' | 'name'
  const [matrixSearch, setMatrixSearch] = useState('')
  const [showGuide, setShowGuide] = useState(false)

  // Sync external activeZoneId
  useEffect(() => {
    if (activeZoneId) {
      setSelectedId(activeZoneId)
      const corr = getCorridorByZoneId(activeZoneId)
      if (corr && corr.id !== selectedCorridorId) {
        setSelectedCorridorId(corr.id)
      }
    }
  }, [activeZoneId])

  // Current active corridor object
  const activeCorridor = useMemo(() => {
    return CORRIDORS.find((c) => c.id === selectedCorridorId) || CORRIDORS[0]
  }, [selectedCorridorId])

  // Notify parent of corridor change
  useEffect(() => {
    if (onCorridorChange) {
      if (viewMode === 'all') {
        onCorridorChange({
          chartTitle: 'National Hydrographic Sounding Registry · All 27 Coastal Zones',
          chartMeta: 'Synoptic Isobath Benchmarks · 9 Maritime Corridors · Gujarat to Andaman',
          beaconStatus: '9 Coastal Harbors Synced',
          isMatrix: true
        })
      } else {
        onCorridorChange(activeCorridor)
      }
    }
  }, [activeCorridor, viewMode, onCorridorChange])

  // Zones for current corridor (3 to 6 zones)
  const corridorZones = useMemo(() => {
    return zones.filter((z) => activeCorridor.subZoneIds.includes(z.id))
  }, [activeCorridor])

  // Current active zone
  const activeZone = useMemo(() => {
    const found = zones.find((z) => z.id === selectedId)
    if (found && activeCorridor.subZoneIds.includes(found.id)) return found
    return corridorZones[0] || zones[0]
  }, [selectedId, corridorZones, activeCorridor])

  // Hovered zone object
  const hoveredZone = useMemo(() => {
    if (!hoveredZoneId) return null
    return zones.find((z) => z.id === hoveredZoneId) || null
  }, [hoveredZoneId])

  // Handle switching corridor
  const handleCorridorSelect = (corridorId) => {
    setSelectedCorridorId(corridorId)
    const targetCorridor = CORRIDORS.find((c) => c.id === corridorId) || CORRIDORS[0]
    const nextZoneId = targetCorridor.defaultZoneId
    setSelectedId(nextZoneId)
    if (onSelectZone) onSelectZone(nextZoneId)
  }

  // Handle selecting a zone
  const handleZoneSelect = (zone) => {
    setSelectedId(zone.id)
    const parentCorridor = getCorridorByZoneId(zone.id)
    if (parentCorridor.id !== selectedCorridorId) {
      setSelectedCorridorId(parentCorridor.id)
    }
    if (onSelectZone) onSelectZone(zone.id)
  }

  // Jump from Matrix to Corridor View
  const handleJumpToCorridor = (zone) => {
    const corr = getCorridorByZoneId(zone.id)
    setSelectedCorridorId(corr.id)
    setSelectedId(zone.id)
    setViewMode('corridor')
    if (onSelectZone) onSelectZone(zone.id)
  }

  // Dimensions & Coordinates calculation for the SVG
  const vbWidth = panoramic ? 900 : 680
  const vbHeight = panoramic ? 220 : 270
  const surfaceY = panoramic ? 32 : 38
  const xStart = panoramic ? 55 : 50
  const xEnd = panoramic ? 865 : 625
  const yBase = panoramic ? 188 : 240
  const textXOffset = xStart - 8
  const distLabelY = yBase + 16

  const maxDist = activeCorridor.maxDist || 25
  const maxDepth = activeCorridor.maxDepth || 35

  const getX = (distStr) => {
    const km = parseFloat(distStr) || 10
    const clampedKm = Math.max(0, Math.min(km, maxDist))
    return xStart + (clampedKm / maxDist) * (xEnd - xStart)
  }

  const getY = (depth) => {
    const clampedDepth = Math.max(0, Math.min(depth, maxDepth))
    return surfaceY + (clampedDepth / maxDepth) * (yBase - surfaceY - 20)
  }

  // Generate adaptive seabed contour and polygon based on corridor shelf profile
  const seabedPaths = useMemo(() => {
    const { shelfProfile } = activeCorridor
    const usableH = yBase - surfaceY - 20

    if (shelfProfile === 'trench') {
      // Steep volcanic trench (Andaman)
      const p1X = xStart + (xEnd - xStart) * 0.15
      const p1Y = surfaceY + usableH * 0.2
      const p2X = xStart + (xEnd - xStart) * 0.35
      const p2Y = surfaceY + usableH * 0.7
      const p3X = xEnd
      const p3Y = surfaceY + usableH * 0.95

      const contour = `M ${xStart} ${surfaceY + 15} Q ${p1X} ${p1Y}, ${p2X} ${p2Y} T ${p3X} ${p3Y}`
      const polygon = `M ${xStart} ${surfaceY} L ${xStart} ${surfaceY + 15} Q ${p1X} ${p1Y}, ${p2X} ${p2Y} T ${p3X} ${p3Y} L ${xEnd} ${yBase} L ${xStart} ${yBase} Z`
      return { contour, polygon }
    }

    if (shelfProfile === 'atoll') {
      // Coral atoll reef lagoon then sheer drop (Lakshadweep)
      const p1X = xStart + (xEnd - xStart) * 0.2
      const p1Y = surfaceY + usableH * 0.18
      const p2X = xStart + (xEnd - xStart) * 0.45
      const p2Y = surfaceY + usableH * 0.65
      const p3X = xEnd
      const p3Y = surfaceY + usableH * 0.92

      const contour = `M ${xStart} ${surfaceY + 12} L ${p1X} ${p1Y} Q ${p1X + 30} ${surfaceY + usableH * 0.45}, ${p2X} ${p2Y} L ${p3X} ${p3Y}`
      const polygon = `M ${xStart} ${surfaceY} L ${xStart} ${surfaceY + 12} L ${p1X} ${p1Y} Q ${p1X + 30} ${surfaceY + usableH * 0.45}, ${p2X} ${p2Y} L ${p3X} ${p3Y} L ${xEnd} ${yBase} L ${xStart} ${yBase} Z`
      return { contour, polygon }
    }

    if (shelfProfile === 'steep-slope') {
      // Visakhapatnam steep slope
      const p1X = xStart + (xEnd - xStart) * 0.35
      const p1Y = surfaceY + usableH * 0.45
      const p2X = xEnd
      const p2Y = surfaceY + usableH * 0.88

      const contour = `M ${xStart} ${surfaceY + 22} Q ${p1X} ${p1Y}, ${p2X} ${p2Y}`
      const polygon = `M ${xStart} ${surfaceY} L ${xStart} ${surfaceY + 22} Q ${p1X} ${p1Y}, ${p2X} ${p2Y} L ${xEnd} ${yBase} L ${xStart} ${yBase} Z`
      return { contour, polygon }
    }

    if (shelfProfile === 'macrotidal') {
      // Gujarat Gulf of Kutch sand waves & ridges
      const w1X = xStart + (xEnd - xStart) * 0.25
      const w1Y = surfaceY + usableH * 0.35
      const w2X = xStart + (xEnd - xStart) * 0.55
      const w2Y = surfaceY + usableH * 0.55
      const w3X = xEnd
      const w3Y = surfaceY + usableH * 0.8

      const contour = `M ${xStart} ${surfaceY + 18} Q ${w1X - 30} ${w1Y - 15}, ${w1X} ${w1Y} Q ${w2X - 20} ${w2Y + 15}, ${w2X} ${w2Y} Q ${w3X - 40} ${w3Y - 10}, ${w3X} ${w3Y}`
      const polygon = `M ${xStart} ${surfaceY} L ${xStart} ${surfaceY + 18} Q ${w1X - 30} ${w1Y - 15}, ${w1X} ${w1Y} Q ${w2X - 20} ${w2Y + 15}, ${w2X} ${w2Y} Q ${w3X - 40} ${w3Y - 10}, ${w3X} ${w3Y} L ${xEnd} ${yBase} L ${xStart} ${yBase} Z`
      return { contour, polygon }
    }

    // Default: Deltaic & Terrigenous gentle continental shelf slope
    const m1X = xStart + (xEnd - xStart) * 0.35
    const m1Y = surfaceY + usableH * 0.42
    const m2X = xStart + (xEnd - xStart) * 0.72
    const m2Y = surfaceY + usableH * 0.72
    const mEnd = surfaceY + usableH * 0.88

    const contour = `M ${xStart} ${surfaceY + 16} Q ${m1X} ${m1Y}, ${m2X} ${m2Y} T ${xEnd} ${mEnd}`
    const polygon = `M ${xStart} ${surfaceY} L ${xStart} ${surfaceY + 16} Q ${m1X} ${m1Y}, ${m2X} ${m2Y} T ${xEnd} ${mEnd} L ${xEnd} ${yBase} L ${xStart} ${yBase} Z`
    return { contour, polygon }
  }, [activeCorridor, xStart, xEnd, surfaceY, yBase])

  // Filtered & Sorted zones for the "All 27 Zones Matrix" mode
  const filteredMatrixZones = useMemo(() => {
    let result = [...zones]

    // Basin filter
    if (matrixFilter === 'bay-of-bengal') {
      result = result.filter((z) => z.regionId === 'bay-of-bengal')
    } else if (matrixFilter === 'arabian-sea') {
      result = result.filter((z) => z.regionId === 'arabian-sea')
    } else if (matrixFilter === 'islands') {
      result = result.filter((z) => z.regionId === 'andaman-nicobar' || z.regionId === 'lakshadweep')
    }

    // Search query
    if (matrixSearch.trim()) {
      const q = matrixSearch.toLowerCase()
      result = result.filter(
        (z) =>
          z.name.toLowerCase().includes(q) ||
          z.sectorCode.toLowerCase().includes(q) ||
          z.harborName.toLowerCase().includes(q) ||
          z.coastalDistrict.toLowerCase().includes(q) ||
          z.seabed.toLowerCase().includes(q)
      )
    }

    // Sorting
    result.sort((a, b) => {
      if (matrixSort === 'depth-asc') return a.soundingDepth - b.soundingDepth
      if (matrixSort === 'depth-desc') return b.soundingDepth - a.soundingDepth
      if (matrixSort === 'distance') return parseFloat(a.distanceOffshore) - parseFloat(b.distanceOffshore)
      if (matrixSort === 'name') return a.name.localeCompare(b.name)
      return 0
    })

    return result
  }, [matrixFilter, matrixSort, matrixSearch])

  // Staggered non-overlapping labels layout for corridor zones
  const sortedCorridorZones = useMemo(() => {
    return [...corridorZones].sort((a, b) => parseFloat(a.distanceOffshore) - parseFloat(b.distanceOffshore))
  }, [corridorZones])

  return (
    <div
      className={`relative w-full max-w-full min-w-0 bg-[#F3F9FB] border border-[#CCE4EC] rounded-xl shadow-xs overflow-hidden ${
        compact ? 'p-2.5' : panoramic ? 'p-3 sm:p-4' : 'p-3.5 sm:p-4'
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. TOP CONTROL BAR: View Mode Toggle & Corridor Switcher */}
      {/* ========================================================================= */}
      <div className="flex flex-col gap-2.5 pb-3 border-b border-[#D4E8F0] w-full max-w-full min-w-0">
        
        {/* Mode Selector & Quick Summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          
          {/* View Mode Toggle */}
          <div className="inline-flex rounded-lg bg-[#E0EEF3] p-0.5 border border-[#CCE4EC]">
            <button
              type="button"
              onClick={() => setViewMode('corridor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-sans text-xs font-semibold transition-all ${
                viewMode === 'corridor'
                  ? 'bg-white text-[#0A1B27] shadow-xs'
                  : 'text-[#5C7788] hover:text-[#0A1B27]'
              }`}
            >
              <Waves size={13} className={viewMode === 'corridor' ? 'text-[#007A78]' : ''} />
              <span>Corridor Transect</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-sans text-xs font-semibold transition-all ${
                viewMode === 'all'
                  ? 'bg-white text-[#0A1B27] shadow-xs'
                  : 'text-[#5C7788] hover:text-[#0A1B27]'
              }`}
            >
              <Layers size={13} className={viewMode === 'all' ? 'text-[#E86014]' : ''} />
              <span>All 27 Zones Matrix</span>
            </button>
          </div>

          {/* Current Shelf Geomorphology Pill */}
          <div className="flex items-center gap-2 text-[11px] text-[#5C7788]">
            <span className="w-2 h-2 rounded-full bg-[#007A78] animate-pulse" />
            <span className="font-semibold text-[#0A1B27]">
              {viewMode === 'corridor' ? activeCorridor.corridorName : 'National 27-Zone Sounding Registry'}
            </span>
            <span className="hidden md:inline text-[#809BAA]">•</span>
            <span className="hidden md:inline font-mono text-[#007A78] font-bold">
              {viewMode === 'corridor' ? activeCorridor.chartNumber : '9 Coastal Corridors'}
            </span>
          </div>
        </div>

        {/* 9 Coastal Corridors Navigation Ribbon (Only in Transect View) */}
        {viewMode === 'corridor' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 w-full max-w-full min-w-0 scrollbar-thin scrollbar-thumb-[#CCE4EC]">
            <span className="text-[10px] text-[#5C7788] uppercase tracking-wider font-bold shrink-0 mr-1 flex items-center gap-1">
              <Compass size={11} className="text-[#007A78]" />
              Corridor:
            </span>
            {CORRIDORS.map((c) => {
              const isActive = c.id === selectedCorridorId
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCorridorSelect(c.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-sans transition-all ${
                    isActive
                      ? 'bg-[#007A78] text-white font-bold shadow-xs'
                      : 'bg-white hover:bg-[#E5F3F7] text-[#2D4454] border border-[#CCE4EC]'
                  }`}
                  title={`${c.name} (${c.subZoneIds.length} zones) · ${c.chartNumber}`}
                >
                  <span>{c.name}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#E1F3F5] text-[#007A78] font-bold'
                    }`}
                  >
                    {c.subZoneIds.length}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Sub-Zones Quick Pills for Current Corridor (Only in Transect View) */}
        {viewMode === 'corridor' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5 w-full max-w-full min-w-0 scrollbar-thin">
            <span className="text-[10px] text-[#5C7788] uppercase tracking-wider font-semibold shrink-0 mr-1">
              Sectors:
            </span>
            {corridorZones.map((z) => {
              const isSelected = z.id === selectedId
              return (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => handleZoneSelect(z)}
                  onMouseEnter={() => setHoveredZoneId(z.id)}
                  onMouseLeave={() => setHoveredZoneId(null)}
                  className={`shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-sans transition-all ${
                    isSelected
                      ? 'bg-[#E86014] text-white font-bold shadow-xs'
                      : 'bg-white/80 hover:bg-white text-[#0A1B27] border border-[#D4E8F0]'
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-80">{z.sectorCode}</span>
                  <span>{z.name}</span>
                  <span className={`font-mono text-[10px] ${isSelected ? 'text-amber-100' : 'text-[#007A78]'}`}>
                    {z.soundingDepth}m
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN VISUALIZATION: EITHER 2D TRANSECT SVG OR ALL-ZONES MATRIX */}
      {/* ========================================================================= */}

      {viewMode === 'corridor' ? (
        /* TRANSECT SVG SOUNDER CANVAS */
        <div
          className={`relative w-full max-w-full min-w-0 select-none bg-[#EBF5F8] border border-[#D4E8F0] rounded-lg overflow-hidden mt-2.5 ${
            panoramic ? 'aspect-[900/220] max-h-[250px]' : 'aspect-[16/7] min-h-[180px] sm:min-h-[220px]'
          }`}
        >
          <svg
            viewBox={`0 0 ${vbWidth} ${vbHeight}`}
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
            aria-label={`Bathymetric depth profile for ${activeCorridor.name} (${activeCorridor.corridorName})`}
          >
            <defs>
              {/* Water Column Wash Gradient */}
              <linearGradient id="corridorWaterGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EBF5F8" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#CDE6EF" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#B3DAE8" stopOpacity="0.95" />
              </linearGradient>

              {/* Seabed Sediment Gradient */}
              <linearGradient id="corridorSeabedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D9CBB7" />
                <stop offset="35%" stopColor="#C4B49D" />
                <stop offset="100%" stopColor="#A08E75" />
              </linearGradient>

              {/* Sounding Hatch Lines */}
              <pattern
                id="soundingHatchPattern"
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(10, 27, 39, 0.07)" strokeWidth="1" />
              </pattern>

              {/* Node Drop Shadow */}
              <filter id="pillShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#0A1B27" floodOpacity="0.12" />
              </filter>
            </defs>

            {/* Water Column Wash */}
            <rect
              x={xStart}
              y={surfaceY}
              width={xEnd - xStart}
              height={yBase - surfaceY}
              fill="url(#corridorWaterGrad)"
            />

            {/* Depth Axis Graticules (Adapted to corridor maxDepth) */}
            {activeCorridor.depthGraticules.map((d) => {
              const y = getY(d)
              return (
                <g key={d}>
                  <line
                    x1={xStart}
                    y1={y}
                    x2={xEnd}
                    y2={y}
                    stroke="#BCDCE6"
                    strokeDasharray="3 4"
                    strokeWidth="0.8"
                  />
                  <text
                    x={textXOffset}
                    y={y + 3}
                    textAnchor="end"
                    fill="#5C7788"
                    fontSize={panoramic ? '9' : '9.5'}
                    className="tabular-nums font-mono font-semibold"
                  >
                    {d}m
                  </text>
                </g>
              )
            })}

            {/* Distance Axis Markers (Adapted to corridor maxDist) */}
            {activeCorridor.distMarkers.map((km) => {
              const x = getX(km)
              return (
                <g key={km}>
                  <line
                    x1={x}
                    y1={surfaceY - 4}
                    x2={x}
                    y2={yBase}
                    stroke="#BCDCE6"
                    strokeWidth="0.7"
                  />
                  <text
                    x={x}
                    y={distLabelY}
                    textAnchor="middle"
                    fill="#5C7788"
                    fontSize={panoramic ? '8.5' : '9'}
                    className="tabular-nums font-mono font-medium"
                  >
                    {km}km
                  </text>
                </g>
              )
            })}

            {/* Coastline Shoreline Marker on Left */}
            <line
              x1={xStart}
              y1={surfaceY - 14}
              x2={xStart}
              y2={yBase}
              stroke="#0A1B27"
              strokeWidth="1.4"
            />
            <text
              x={xStart}
              y={surfaceY - 8}
              textAnchor="start"
              fill="#0A1B27"
              fontSize="8"
              fontWeight="bold"
              className="font-sans uppercase tracking-wider"
            >
              Coast Baseline
            </text>

            {/* Sea Surface Line in Nautical Teal */}
            <line
              x1={xStart}
              y1={surfaceY}
              x2={xEnd}
              y2={surfaceY}
              stroke="#007A78"
              strokeWidth="1.8"
            />
            <text
              x={xEnd}
              y={surfaceY - 6}
              textAnchor="end"
              fill="#007A78"
              fontSize={panoramic ? '8' : '8.5'}
              className="font-sans font-bold"
            >
              Sea Surface (0.0m LAT)
            </text>

            {/* Seabed Bathymetric Polygon */}
            <path d={seabedPaths.polygon} fill="url(#corridorSeabedGrad)" />
            <path d={seabedPaths.polygon} fill="url(#soundingHatchPattern)" />

            {/* Seabed Horizon Contour Line */}
            <path
              d={seabedPaths.contour}
              fill="none"
              stroke="#8F785C"
              strokeWidth="2"
            />

            {/* Acoustic Echo Sounding Ping Line (moving across profile) */}
            <g className="animate-sounderSweep">
              <line
                x1={xStart}
                y1={surfaceY}
                x2={xStart}
                y2={yBase}
                stroke="#007A78"
                strokeWidth="1.2"
                strokeOpacity="0.45"
                strokeDasharray="2 3"
              />
            </g>

            {/* Active Zone Vertical Sounding Beam in Saffron */}
            {activeZone && (
              <g>
                <line
                  x1={getX(activeZone.distanceOffshore)}
                  y1={surfaceY}
                  x2={getX(activeZone.distanceOffshore)}
                  y2={getY(activeZone.soundingDepth)}
                  stroke="#E86014"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={getX(activeZone.distanceOffshore)}
                  cy={getY(activeZone.soundingDepth)}
                  r={panoramic ? '5' : '6'}
                  fill="#E86014"
                />
                <circle
                  cx={getX(activeZone.distanceOffshore)}
                  cy={getY(activeZone.soundingDepth)}
                  r={panoramic ? '10' : '12'}
                  fill="none"
                  stroke="#E86014"
                  strokeOpacity="0.6"
                  className="animate-pingPulse"
                />
              </g>
            )}

            {/* ========================================================================= */}
            {/* SECTOR SOUNDING NODES: Staggered, Non-Overlapping & Collision-Free */}
            {/* ========================================================================= */}
            {sortedCorridorZones.map((z, index) => {
              const x = getX(z.distanceOffshore)
              const y = getY(z.soundingDepth)
              const isSelected = z.id === selectedId
              const isHovered = z.id === hoveredZoneId

              // Collision-free alternating label offsets
              // Even index: placed above; Odd index: placed below
              const placeAbove = index % 2 === 0 ? y > 90 : y > 160
              const labelY = placeAbove ? y - 18 : y + 24
              const leaderYEnd = placeAbove ? labelY + 9 : labelY - 9
              const pillW = z.name.length > 10 ? 82 : 70
              const pillH = 22

              return (
                <g
                  key={z.id}
                  onClick={() => interactive && handleZoneSelect(z)}
                  onMouseEnter={() => setHoveredZoneId(z.id)}
                  onMouseLeave={() => setHoveredZoneId(null)}
                  className={interactive ? 'cursor-pointer group' : ''}
                >
                  {/* Sea Surface Marker Buoy */}
                  <line
                    x1={x}
                    y1={surfaceY - 5}
                    x2={x}
                    y2={surfaceY + 5}
                    stroke={isSelected ? '#E86014' : '#5C7788'}
                    strokeWidth="1.2"
                  />
                  <circle
                    cx={x}
                    cy={surfaceY}
                    r={isSelected ? 4 : 2.5}
                    fill={isSelected ? '#E86014' : '#FFFFFF'}
                    stroke={isSelected ? '#0A1B27' : '#007A78'}
                    strokeWidth="1.2"
                  />

                  {/* Vertical Sounder Plumb Line */}
                  <line
                    x1={x}
                    y1={surfaceY}
                    x2={x}
                    y2={y}
                    stroke={isSelected ? '#E86014' : 'rgba(0, 122, 120, 0.35)'}
                    strokeWidth={isSelected ? 1.8 : 1}
                    strokeDasharray={isSelected ? '3 2' : 'none'}
                  />

                  {/* Seabed Sounding Touchdown Target */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 5.5 : isHovered ? 4.5 : 3.5}
                    fill={isSelected ? '#E86014' : isHovered ? '#007A78' : '#007A78'}
                    stroke="#FFFFFF"
                    strokeWidth="1.6"
                  />

                  {/* Leader Line to Badge */}
                  <line
                    x1={x}
                    y1={y}
                    x2={x}
                    y2={leaderYEnd}
                    stroke={isSelected ? '#E86014' : '#A0C2CE'}
                    strokeWidth="0.9"
                    strokeDasharray="2 2"
                  />

                  {/* Clean Non-Overlapping Label Badge */}
                  <g filter="url(#pillShadow)">
                    <rect
                      x={x - pillW / 2}
                      y={labelY - pillH / 2}
                      width={pillW}
                      height={pillH}
                      rx="4"
                      fill={isSelected ? '#007A78' : isHovered ? '#E5F3F7' : '#FFFFFF'}
                      stroke={isSelected ? '#061219' : isHovered ? '#007A78' : '#CCE4EC'}
                      strokeWidth={isSelected ? 1.6 : 1}
                    />

                    {/* Zone Name */}
                    <text
                      x={x}
                      y={labelY - 1}
                      textAnchor="middle"
                      fill={isSelected ? '#FFFFFF' : '#0A1B27'}
                      fontSize="8.5"
                      fontWeight={isSelected ? 'bold' : '600'}
                      className="font-sans select-none tracking-tight"
                    >
                      {z.name}
                    </text>

                    {/* Depth & Distance Telemetry */}
                    <text
                      x={x}
                      y={labelY + 8}
                      textAnchor="middle"
                      fill={isSelected ? '#E1F3F5' : '#007A78'}
                      fontSize="7.5"
                      fontWeight="bold"
                      className="tabular-nums font-mono select-none"
                    >
                      {z.soundingDepth}m · {z.distanceOffshore}
                    </text>
                  </g>
                </g>
              )
            })}
          </svg>

          {/* Interactive HUD Hover Tooltip */}
          {hoveredZone && (
            <div className="absolute top-2 right-2 bg-[#061219]/90 text-white backdrop-blur-sm px-3 py-2 rounded-lg border border-[#CCE4EC]/20 shadow-md text-xs pointer-events-none z-20 max-w-[240px]">
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1 mb-1 font-mono text-[10px] text-[#00E5FF]">
                <span>{hoveredZone.sectorCode}</span>
                <span>{hoveredZone.distanceOffshore} offshore</span>
              </div>
              <div className="font-serif font-bold text-sm text-white mb-0.5">{hoveredZone.name}</div>
              <div className="text-[11px] text-amber-300 font-mono font-bold mb-1">
                Sounding: {hoveredZone.soundingDepth}m LAT
              </div>
              <div className="text-[10px] text-gray-300 leading-tight">
                Seabed: <span className="text-white">{hoveredZone.seabed}</span>
              </div>
              <div className="text-[10px] text-gray-300 leading-tight mt-0.5">
                Target: <span className="text-white">{hoveredZone.targetSpecies}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* ALL 27 ZONES COMPARISON MATRIX MODE */
        /* ========================================================================= */
        <div className="mt-2.5 bg-white border border-[#D4E8F0] rounded-lg p-3">
          
          {/* Matrix Filters & Search */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#E0EEF3] text-xs">
            {/* Basin Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1">
              {[
                { id: 'all', label: 'All 27 Zones' },
                { id: 'bay-of-bengal', label: 'Bay of Bengal (15)' },
                { id: 'arabian-sea', label: 'Arabian Sea (9)' },
                { id: 'islands', label: 'Islands (6)' }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setMatrixFilter(f.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-sans font-semibold transition-all ${
                    matrixFilter === f.id
                      ? 'bg-[#007A78] text-white shadow-xs'
                      : 'bg-[#F0F7FA] text-[#5C7788] hover:bg-[#E2F0F5] hover:text-[#0A1B27]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search Input & Sorter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-44">
                <Search size={12} className="absolute left-2.5 top-2.5 text-[#5C7788]" />
                <input
                  type="text"
                  placeholder="Filter zone, port..."
                  value={matrixSearch}
                  onChange={(e) => setMatrixSearch(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 text-xs bg-[#F7FBFC] border border-[#CCE4EC] rounded-md focus:outline-none focus:border-[#007A78]"
                />
              </div>
              <select
                value={matrixSort}
                onChange={(e) => setMatrixSort(e.target.value)}
                className="text-xs bg-[#F7FBFC] border border-[#CCE4EC] rounded-md px-2 py-1 text-[#2D4454] focus:outline-none focus:border-[#007A78]"
              >
                <option value="depth-asc">Depth: Shallow → Deep</option>
                <option value="depth-desc">Depth: Deep → Shallow</option>
                <option value="distance">Distance Offshore</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Matrix Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredMatrixZones.map((z) => {
              const depthPercent = Math.min(100, Math.round((z.soundingDepth / 180) * 100))
              const isSelected = z.id === selectedId
              
              // Color coding by depth tier
              const depthBadgeColor =
                z.soundingDepth <= 20
                  ? 'bg-teal-50 text-[#007A78] border-teal-200'
                  : z.soundingDepth <= 40
                  ? 'bg-sky-50 text-sky-800 border-sky-200'
                  : z.soundingDepth <= 80
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-purple-50 text-purple-800 border-purple-200'

              const depthBarColor =
                z.soundingDepth <= 20
                  ? 'bg-[#007A78]'
                  : z.soundingDepth <= 40
                  ? 'bg-sky-600'
                  : z.soundingDepth <= 80
                  ? 'bg-amber-600'
                  : 'bg-purple-600'

              return (
                <div
                  key={z.id}
                  onClick={() => handleJumpToCorridor(z)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#F0F9FB] border-[#007A78] ring-1 ring-[#007A78] shadow-xs'
                      : 'bg-[#F9FCFD] border-[#D4E8F0] hover:border-[#007A78] hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold bg-[#E2F0F5] text-[#007A78] px-1.5 py-0.5 rounded">
                          {z.sectorCode}
                        </span>
                        <h4 className="font-serif font-bold text-xs text-[#0A1B27] truncate">
                          {z.name}
                        </h4>
                      </div>
                      <div className="text-[10px] text-[#5C7788] truncate mt-0.5">
                        {z.coastalDistrict} • {z.harborName}
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${depthBadgeColor}`}>
                      {z.soundingDepth}m LAT
                    </span>
                  </div>

                  {/* Horizontal Depth Gauge Bar */}
                  <div className="my-2">
                    <div className="flex justify-between text-[9px] text-[#5C7788] font-mono mb-0.5">
                      <span>0m (Coast)</span>
                      <span>{z.distanceOffshore}</span>
                      <span>180m (Abyss)</span>
                    </div>
                    <div className="w-full bg-[#E5EEF1] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${depthBarColor}`}
                        style={{ width: `${Math.max(6, depthPercent)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-[#E8F1F4] text-[#5C7788]">
                    <span className="truncate max-w-[170px]" title={z.seabed}>
                      {z.seabed}
                    </span>
                    <span className="text-[#007A78] font-semibold hover:underline flex items-center gap-0.5 shrink-0">
                      View Transect →
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ACTIVE SECTOR TELEMETRY STRIP */}
      {/* ========================================================================= */}
      <div className="mt-2.5 pt-2.5 border-t border-[#D4E8F0] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs w-full max-w-full min-w-0">
        <div className="bg-white py-1.5 px-3 border border-[#CCE4EC] rounded-lg shadow-2xs">
          <span className="block text-[9px] text-[#5C7788] uppercase tracking-wider font-semibold">Sector &amp; Port Base</span>
          <span className="font-serif font-bold text-[#0A1B27] text-xs sm:text-sm block truncate" title={`${activeZone.sectorCode} • ${activeZone.name}`}>
            {activeZone.sectorCode} • {activeZone.name}
          </span>
          <span className="text-[10px] text-[#E86014] font-semibold block truncate" title={activeZone.harborName}>
            {activeZone.harborName}
          </span>
        </div>

        <div className="bg-white py-1.5 px-3 border border-[#CCE4EC] rounded-lg shadow-2xs">
          <span className="block text-[9px] text-[#5C7788] uppercase tracking-wider font-semibold">Sounding &amp; Keel Clearance</span>
          <span className="font-mono font-bold text-[#007A78] tabular-nums text-xs sm:text-sm block truncate">
            {activeZone.soundingDepth}m LAT
          </span>
          <span className="text-[10px] text-[#5C7788] block truncate">
            {activeZone.soundingDepth < 15 ? 'Small Gillnetter Safe' : 'Commercial Trawler Draft Safe'}
          </span>
        </div>

        <div className="bg-white py-1.5 px-3 border border-[#CCE4EC] rounded-lg shadow-2xs">
          <span className="block text-[9px] text-[#5C7788] uppercase tracking-wider font-semibold">Distance &amp; Position</span>
          <span className="font-mono font-bold text-[#2D4454] text-xs sm:text-sm block truncate">
            {activeZone.distanceOffshore} offshore
          </span>
          <span className="text-[10px] font-mono text-[#5C7788] block truncate" title={activeZone.coordinates}>
            {activeZone.coordinates}
          </span>
        </div>

        <div className="bg-white py-1.5 px-3 border border-[#CCE4EC] rounded-lg shadow-2xs">
          <span className="block text-[9px] text-[#5C7788] uppercase tracking-wider font-semibold">Seabed &amp; Target Species</span>
          <span className="font-sans text-[#2D4454] truncate block text-xs font-medium" title={activeZone.seabed}>
            {activeZone.seabed}
          </span>
          <span className="text-[10px] text-[#007A78] font-bold block truncate" title={activeZone.targetSpecies}>
            {activeZone.targetSpecies}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. EDUCATIONAL ACCORDION: How to Read Soundings & Navigation Safety */}
      {/* ========================================================================= */}
      <div className="mt-2.5 pt-2 border-t border-[#D4E8F0]">
        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="w-full flex items-center justify-between text-[11px] text-[#5C7788] hover:text-[#0A1B27] py-1 transition-colors"
        >
          <span className="flex items-center gap-1.5 font-semibold">
            <Info size={13} className="text-[#007A78]" />
            <span>Understanding Coastal Sounding Depths &amp; Navigation Draft Safety</span>
          </span>
          <span className="flex items-center gap-1 text-[10px] text-[#007A78]">
            {showGuide ? 'Hide Guide' : 'Learn How to Read'}
            {showGuide ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </span>
        </button>

        {showGuide && (
          <div className="mt-2 bg-white border border-[#CCE4EC] rounded-lg p-3 text-xs text-[#2D4454] space-y-2 animate-fadeIn">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="border-l-2 border-[#007A78] pl-2.5">
                <span className="font-bold text-[#0A1B27] block text-[11px] mb-0.5">Lowest Astronomical Tide (LAT)</span>
                <p className="text-[10px] text-[#5C7788] leading-relaxed">
                  Soundings are reduced to LAT — the lowest water level caused purely by gravitational tides. True water depth under your boat will almost always be higher than the charted LAT depth.
                </p>
              </div>

              <div className="border-l-2 border-[#E86014] pl-2.5">
                <span className="font-bold text-[#0A1B27] block text-[11px] mb-0.5">Keel Clearance &amp; Craft Safety</span>
                <p className="text-[10px] text-[#5C7788] leading-relaxed">
                  Motorized nauka &amp; fiber teppa require ~1.0m draft. Mechanized steel trawlers need 2.5m–3.5m clearance. Depths &lt;10m in rough surf risk bottom strikes on sand bars.
                </p>
              </div>

              <div className="border-l-2 border-[#0A1B27] pl-2.5">
                <span className="font-bold text-[#0A1B27] block text-[11px] mb-0.5">Seabed Sediment &amp; Fish Aggregation</span>
                <p className="text-[10px] text-[#5C7788] leading-relaxed">
                  Soft silt &amp; clay support demersal prawns and sole. Upwelling mud banks (Chakara in Kerala) attract massive sardine schools. Deep trenches harbor yellowfin tuna.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
