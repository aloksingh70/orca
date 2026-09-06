import { useState, useEffect } from 'react'
import { zones } from '../lib/zones.js'

export default function BathymetricSounder({
  activeZoneId = null,
  onSelectZone = null,
  interactive = true,
  compact = false
}) {
  const [selectedId, setSelectedId] = useState(activeZoneId || 'digha')

  useEffect(() => {
    if (activeZoneId) setSelectedId(activeZoneId)
  }, [activeZoneId])

  const activeZone = zones.find((z) => z.id === selectedId) || zones[0]

  const handleSelect = (zone) => {
    setSelectedId(zone.id)
    if (onSelectZone) onSelectZone(zone.id)
  }

  // Bathymetric SVG coordinate calculations (Width: 640, Height: 280)
  // X: 45px (0km) to 595px (25km) -> scale: (km / 25) * 550 + 45
  // Y: 40px (0m surface) to 230px (35m depth) -> scale: (depth / 35) * 190 + 40
  const getX = (distStr) => {
    const km = parseFloat(distStr) || 10
    return 45 + (km / 25) * 550
  }

  const getY = (depth) => {
    return 40 + (depth / 35) * 190
  }

  return (
    <div className={`relative bg-[#F3F9FB] border border-[#CCE4EC] overflow-hidden ${compact ? 'p-2.5' : 'p-3.5 sm:p-4'}`}>
      {/* Hydrographic Header / Chart Margin */}
      <div className="flex items-center justify-between border-b border-[#D4E8F0] pb-2 mb-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#007A78] animate-pulse" />
          <span className="font-serif text-[#0A1B27] font-bold tracking-wide uppercase text-[11px]">
            Continental Shelf Bathymetric Sounding
          </span>
          <span className="hidden sm:inline text-[#5C7788] text-[10px]">
            Datum: LAT (Lowest Astronomical Tide)
          </span>
        </div>
        <div className="flex items-center gap-3 text-[#5C7788] text-[11px] tabular-nums">
          <span className="hidden md:inline">Grid: 5m Isobaths</span>
          <span className="text-[#007A78] font-bold">Hooghly Deltaic Shelf</span>
        </div>
      </div>

      {/* SVG Sounder Canvas */}
      <div className="relative w-full aspect-[2.2/1] sm:aspect-[2.4/1] select-none bg-[#EBF5F8] border border-[#D4E8F0]">
        <svg
          viewBox="0 0 640 280"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          aria-label="Bathymetric depth profile of West Bengal fishing grounds"
        >
          <defs>
            {/* Water gradient */}
            <linearGradient id="waterColumnGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EBF5F8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#CDE6EF" stopOpacity="0.9" />
            </linearGradient>

            {/* Seabed sediment pattern */}
            <linearGradient id="seabedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D9CBB7" />
              <stop offset="35%" stopColor="#C4B49D" />
              <stop offset="100%" stopColor="#A8977F" />
            </linearGradient>

            <pattern id="soundingHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(10, 27, 39, 0.08)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Water Column Wash */}
          <rect x="45" y="40" width="570" height="215" fill="url(#waterColumnGrad)" />

          {/* Depth Axis Graticules (0m, 10m, 20m, 30m) */}
          {[0, 10, 20, 30].map((d) => {
            const y = getY(d)
            return (
              <g key={d}>
                <line x1="45" y1={y} x2="615" y2={y} stroke="#BCDCE6" strokeDasharray="3 4" strokeWidth="0.8" />
                <text x="35" y={y + 3} textAnchor="end" fill="#5C7788" fontSize="9.5" className="tabular-nums font-sans font-semibold">
                  {d}m
                </text>
              </g>
            )
          })}

          {/* Distance Axis Markers (5km, 10km, 15km, 20km, 25km) */}
          {[5, 10, 15, 20, 25].map((km) => {
            const x = 45 + (km / 25) * 550
            return (
              <g key={km}>
                <line x1={x} y1="35" x2={x} y2="250" stroke="#BCDCE6" strokeWidth="0.7" />
                <text x={x} y="266" textAnchor="middle" fill="#5C7788" fontSize="9.5" className="tabular-nums font-sans font-medium">
                  {km}km
                </text>
              </g>
            )
          })}

          {/* Sea Surface Line in Nautical Teal */}
          <line x1="45" y1="40" x2="615" y2="40" stroke="#007A78" strokeWidth="1.8" />
          <text x="615" y="34" textAnchor="end" fill="#007A78" fontSize="8.5" className="font-sans font-bold">
            Sea Surface (0.0m LAT)
          </text>

          {/* Seabed Bathymetric Polygon: Realistic continental shelf slope */}
          <path
            d="M 45 40 
               L 45 68 
               Q 120 78, 221 105 
               Q 320 130, 397 154 
               Q 480 175, 529 197 
               Q 580 220, 615 240 
               L 615 255 
               L 45 255 Z"
            fill="url(#seabedGrad)"
          />
          <path
            d="M 45 40 
               L 45 68 
               Q 120 78, 221 105 
               Q 320 130, 397 154 
               Q 480 175, 529 197 
               Q 580 220, 615 240 
               L 615 255 
               L 45 255 Z"
            fill="url(#soundingHatch)"
          />

          {/* Bathymetric Contour Line (Seabed Horizon) */}
          <path
            d="M 45 68 
               Q 120 78, 221 105 
               Q 320 130, 397 154 
               Q 480 175, 529 197 
               Q 580 220, 615 240"
            fill="none"
            stroke="#8F785C"
            strokeWidth="1.8"
          />

          {/* Acoustic Echo Sounding Ping Line (moving across profile) */}
          <g className="animate-sounderSweep">
            <line x1="45" y1="40" x2="45" y2="250" stroke="#007A78" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="2 3" />
          </g>

          {/* Active Zone Vertical Sounding Beam in Saffron */}
          {activeZone && (
            <g>
              <line
                x1={getX(activeZone.distanceOffshore)}
                y1="40"
                x2={getX(activeZone.distanceOffshore)}
                y2={getY(activeZone.soundingDepth)}
                stroke="#E86014"
                strokeWidth="1.8"
                strokeDasharray="3 3"
              />
              <circle
                cx={getX(activeZone.distanceOffshore)}
                cy={getY(activeZone.soundingDepth)}
                r="5"
                fill="#E86014"
              />
              <circle
                cx={getX(activeZone.distanceOffshore)}
                cy={getY(activeZone.soundingDepth)}
                r="10"
                fill="none"
                stroke="#E86014"
                strokeOpacity="0.5"
                className="animate-pingPulse"
              />
            </g>
          )}

          {/* Sector Sounding Nodes */}
          {zones.map((z) => {
            const x = getX(z.distanceOffshore)
            const y = getY(z.soundingDepth)
            const isSelected = z.id === selectedId

            return (
              <g
                key={z.id}
                onClick={() => interactive && handleSelect(z)}
                className={interactive ? 'cursor-pointer group' : ''}
              >
                {/* Surface marker buoy */}
                <line x1={x} y1="36" x2={x} y2="44" stroke={isSelected ? '#0A1B27' : '#5C7788'} strokeWidth="1" />
                <circle
                  cx={x}
                  cy="40"
                  r={isSelected ? 4.5 : 2.5}
                  fill={isSelected ? '#007A78' : '#FFFFFF'}
                  stroke={isSelected ? '#0A1B27' : '#007A78'}
                  strokeWidth="1.2"
                />

                {/* Seabed Sounding Hit Target */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 5.5 : 3.5}
                  fill={isSelected ? '#E86014' : '#007A78'}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />

                {/* Vertical Depth Sounding Line */}
                <line
                  x1={x}
                  y1="40"
                  x2={x}
                  y2={y}
                  stroke={isSelected ? '#E86014' : 'rgba(0, 122, 120, 0.3)'}
                  strokeWidth={isSelected ? 1.5 : 0.8}
                />

                {/* Sector Label */}
                <text
                  x={x}
                  y={y > 170 ? y - 10 : y + 16}
                  textAnchor="middle"
                  fill={isSelected ? '#0A1B27' : '#2D4454'}
                  fontSize={isSelected ? '10' : '8.5'}
                  fontWeight={isSelected ? '700' : '500'}
                  className="font-sans select-none tracking-tight"
                >
                  {z.name}
                </text>
                <text
                  x={x}
                  y={y > 170 ? y - 20 : y + 26}
                  textAnchor="middle"
                  fill={isSelected ? '#E86014' : '#5C7788'}
                  fontSize="7.5"
                  className="tabular-nums font-sans select-none font-bold"
                >
                  {z.soundingDepth}m
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Active Sector Telemetry Strip */}
      <div className="mt-2.5 pt-2.5 border-t border-[#D4E8F0] grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="bg-white p-2 border border-[#CCE4EC]">
          <span className="block text-[9.5px] text-[#5C7788] uppercase tracking-wider font-semibold">Sector Focus</span>
          <span className="font-serif font-bold text-[#0A1B27] text-xs sm:text-sm">
            {activeZone.sectorCode} • {activeZone.name}
          </span>
        </div>
        <div className="bg-white p-2 border border-[#CCE4EC]">
          <span className="block text-[9.5px] text-[#5C7788] uppercase tracking-wider font-semibold">Depth &amp; Distance</span>
          <span className="font-sans font-bold text-[#007A78] tabular-nums text-xs sm:text-sm">
            {activeZone.soundingDepth}m • {activeZone.distanceOffshore}
          </span>
        </div>
        <div className="bg-white p-2 border border-[#CCE4EC]">
          <span className="block text-[9.5px] text-[#5C7788] uppercase tracking-wider font-semibold">Seabed Sediment</span>
          <span className="font-sans text-[#2D4454] truncate block text-xs font-medium">
            {activeZone.seabed}
          </span>
        </div>
        <div className="bg-white p-2 border border-[#CCE4EC]">
          <span className="block text-[9.5px] text-[#5C7788] uppercase tracking-wider font-semibold">Harbor Base</span>
          <span className="font-sans text-[#E86014] font-bold truncate block text-xs">
            {activeZone.harborName}
          </span>
        </div>
      </div>
    </div>
  )
}
