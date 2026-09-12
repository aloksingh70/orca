import { useState, useEffect } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  Polyline,
  useMap
} from 'react-leaflet'
import L from 'leaflet'
import {
  Ship,
  Navigation,
  Compass,
  Radio,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Layers,
  Search,
  Eye,
  Anchor,
  Activity,
  Maximize2,
  Map as MapIcon
} from 'lucide-react'
import { fetchLiveVessels } from '../lib/api.js'

// Sector reference coordinates on the radar grid and geographic coordinates
const RADAR_SECTORS = [
  { id: 'digha', code: 'WB-01', name: 'Digha', lat: 21.6167, lng: 87.5167, x: 130, y: 150 },
  { id: 'shankarpur', code: 'WB-02', name: 'Shankarpur', lat: 21.6333, lng: 87.5833, x: 180, y: 160 },
  { id: 'junput', code: 'WB-03', name: 'Junput', lat: 21.7167, lng: 87.8167, x: 250, y: 130 },
  { id: 'sagar-island', code: 'WB-04', name: 'Sagar Island', lat: 21.6500, lng: 88.0333, x: 380, y: 180 },
  { id: 'frazerganj', code: 'WB-05', name: 'Frazerganj', lat: 21.5667, lng: 88.2500, x: 460, y: 220 },
  { id: 'kakdwip', code: 'WB-06', name: 'Kakdwip', lat: 21.8667, lng: 88.1833, x: 420, y: 90 }
]

// IMBL border line coordinates (UNCLOS Tribunal boundary line)
const IMBL_COORDS = [
  [21.85, 89.02],
  [21.60, 89.12],
  [21.35, 89.20],
  [21.05, 89.28]
]

// Helper for programmatic Leaflet map panning
function VesselMapFlyTo({ target }) {
  const map = useMap()
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 10, { duration: 1 })
    }
  }, [target, map])
  return null
}

export default function LiveVesselTracker({ onClose, onSelectSector }) {
  const [vessels, setVessels] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedVessel, setSelectedVessel] = useState(null)
  const [viewMode, setViewMode] = useState('radar') // 'radar' | 'internet_ais' | 'list'
  const [searchQuery, setSearchQuery] = useState('')
  const [lastRefreshed, setLastRefreshed] = useState(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)

  const loadVessels = async () => {
    setLoading(true)
    try {
      const data = await fetchLiveVessels(selectedCategory)
      setVessels(data)
      if (data.length > 0 && !selectedVessel) {
        setSelectedVessel(data[0])
      }
      setLastRefreshed(new Date())
    } catch (err) {
      console.warn('Error loading live vessels:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVessels()
  }, [selectedCategory])

  // Periodic live refresh every 15 seconds
  useEffect(() => {
    if (!autoRefresh) return
    const timer = setInterval(() => {
      loadVessels()
    }, 15000)
    return () => clearInterval(timer)
  }, [autoRefresh, selectedCategory])

  // Zomato/Swiggy-style live sailing simulation: smoothly sails vessels along course
  useEffect(() => {
    if (vessels.length === 0) return

    const timer = setInterval(() => {
      setVessels((prev) =>
        prev.map((v) => {
          const spd = v.speed_knots || 4.5
          const rad = ((v.course_deg || 90) * Math.PI) / 180
          const step = 0.000035 * (spd / 5)
          let nextLat = v.lat + Math.cos(rad) * step
          let nextLng = v.lng + Math.sin(rad) * step
          let nextCourse = v.course_deg

          if (nextLat < 21.05 || nextLat > 22.0) nextCourse = (nextCourse + 180) % 360
          if (nextLng < 87.35 || nextLng > 88.55) nextCourse = (nextCourse + 180) % 360

          return { ...v, lat: nextLat, lng: nextLng, course_deg: nextCourse }
        })
      )
    }, 2000)

    return () => clearInterval(timer)
  }, [vessels.length])

  // Filter vessels by search query
  const filteredVessels = vessels.filter((v) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      v.name.toLowerCase().includes(q) ||
      v.mmsi.toLowerCase().includes(q) ||
      v.destination.toLowerCase().includes(q) ||
      v.category_label.toLowerCase().includes(q)
    )
  })

  // Count by category
  const getCategoryCount = (cat) => {
    if (cat === 'all') return vessels.length
    return vessels.filter((v) => v.vessel_type === cat).length
  }

  // Hazard vessels (commercial vessels close to fishing craft)
  const hazardVessels = vessels.filter((v) => v.proximity_hazard)

  const getCategoryColor = (type) => {
    switch (type) {
      case 'cargo':
        return { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500', dot: '#3B82F6' }
      case 'cruise':
        return { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500', dot: '#A855F7' }
      case 'tanker':
        return { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500', dot: '#F59E0B' }
      case 'fishing':
        return { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500', dot: '#10B981' }
      case 'patrol':
        return { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500', dot: '#EF4444' }
      default:
        return { bg: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-500', dot: '#06B6D4' }
    }
  }

  // Coordinate projection from real Lat/Lng to SVG Radar space
  // Lat: ~21.0 to ~22.0, Lng: ~87.3 to ~88.6
  const projectToRadar = (lat, lng) => {
    const minLat = 20.95
    const maxLat = 22.05
    const minLng = 87.35
    const maxLng = 88.55

    const normX = (lng - minLng) / (maxLng - minLng)
    const normY = 1.0 - (lat - minLat) / (maxLat - minLat) // Inverted Y

    const svgWidth = 600
    const svgHeight = 420

    const x = Math.max(30, Math.min(svgWidth - 30, normX * svgWidth))
    const y = Math.max(30, Math.min(svgHeight - 30, normY * svgHeight))
    return { x, y }
  }

  return (
    <div className="bg-[#0A1826] text-slate-100 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden mb-6 transition-all">
      {/* 1. Header Bar */}
      <div className="p-4 sm:p-5 bg-[#06121E] border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-cyan-400 mb-1">
            <Radio size={16} className="animate-pulse text-emerald-400" />
            <span>BAY OF BENGAL LIVE MARITIME AIS TRACKER</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded text-[10px]">
              LIVE AIS STREAM ACTIVE
            </span>
          </div>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span>Sandheads Fairway, Hooghly Approach & Coastal Vessels</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time automated AIS telemetry covering Cargo bulkers, Luxury River-Sea Cruises, Tankers, Mechanized Fishing Trawlers, and Coast Guard Patrol craft.
          </p>
        </div>

        {/* View Mode Switcher & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-1">
            <button
              type="button"
              onClick={() => setViewMode('radar')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'radar'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Radar Map
            </button>
            <button
              type="button"
              onClick={() => setViewMode('internet_ais')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'internet_ais'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapIcon size={12} />
              <span>OpenStreetMap Live AIS</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ledger ({filteredVessels.length})
            </button>
          </div>

          <button
            type="button"
            onClick={loadVessels}
            disabled={loading}
            title="Refresh AIS Feed"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all cursor-pointer"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-cyan-400' : ''} />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* 2. Proximity Hazard Alert Banner (if commercial vessel is close to fishing zones) */}
      {hazardVessels.length > 0 && (
        <div className="bg-amber-950/80 border-b border-amber-800/80 px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-400 shrink-0 animate-bounce" />
            <span className="font-bold">COLLISION PROXIMITY ALERT:</span>
            <span>
              {hazardVessels.length} commercial cargo/tanker ship(s) transiting within 6 NM of small-craft fishing grounds (Sandheads fairway intersection).
            </span>
          </div>
          <span className="hidden sm:inline-block font-mono text-[11px] text-amber-300 bg-amber-900/50 px-2 py-0.5 rounded border border-amber-700">
            VHF CH 16 WATCH ACTIVE
          </span>
        </div>
      )}

      {/* 3. Category Filter Tabs */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: 'All Fleets', icon: Ship },
            { id: 'cargo', label: 'Cargo & Containers', icon: Ship },
            { id: 'cruise', label: 'Passenger Cruises & Ferries', icon: Compass },
            { id: 'tanker', label: 'Oil & Gas Tankers', icon: Anchor },
            { id: 'fishing', label: 'Mechanized Fishing Fleets', icon: Activity },
            { id: 'patrol', label: 'Coast Guard Patrols', icon: ShieldCheck }
          ].map((cat) => {
            const Icon = cat.icon
            const active = selectedCategory === cat.id
            const count = getCategoryCount(cat.id)
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 border text-xs ${
                  active
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700/80 hover:text-white'
                }`}
              >
                <Icon size={13} />
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  active ? 'bg-slate-900/30 text-slate-950' : 'bg-slate-900 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Quick Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search ship, MMSI, port..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 sm:w-60 bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
          />
          <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
        </div>
      </div>

      {/* 4. Main Display Area */}
      <div className="p-4 sm:p-5">
        {/* VIEW 1: INTERACTIVE RADAR SWEEP MAP */}
        {viewMode === 'radar' && (
          <div className="grid lg:grid-cols-12 gap-5 items-start">
            {/* Radar Canvas (SVG) - 8 cols */}
            <div className="lg:col-span-8 bg-[#040C14] border border-slate-800 rounded-xl p-3 relative overflow-hidden shadow-inner">
              {/* Radar Grid Backdrop */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-2 px-1">
                <span className="flex items-center gap-1">
                  <Navigation size={12} className="text-cyan-400" />
                  <span>GRID: 21°N – 22°N | 87°20'E – 88°35'E (SANDHEADS FAIRWAY)</span>
                </span>
                <span className="text-emerald-400">
                  REFRESHED: {lastRefreshed.toLocaleTimeString()}
                </span>
              </div>

              <div className="relative w-full aspect-16/10 sm:aspect-16/9 bg-radial from-[#082032] via-[#04101A] to-[#02070D] rounded-lg overflow-hidden border border-slate-800/80">
                {/* SVG Tactical Radar */}
                <svg viewBox="0 0 600 420" className="w-full h-full select-none">
                  <defs>
                    {/* Grid pattern */}
                    <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0F283C" strokeWidth="0.75" />
                    </pattern>
                    {/* Radar Range Rings */}
                    <radialGradient id="sweepGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Grid background */}
                  <rect width="600" height="420" fill="url(#radarGrid)" />

                  {/* Range Circles centered at Sandheads Pilot Station (300, 240) */}
                  <circle cx="300" cy="240" r="80" fill="none" stroke="#163852" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="300" cy="240" r="150" fill="none" stroke="#163852" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="300" cy="240" r="220" fill="none" stroke="#163852" strokeWidth="1" />
                  <line x1="300" y1="20" x2="300" y2="400" stroke="#163852" strokeWidth="0.75" />
                  <line x1="80" y1="240" x2="520" y2="240" stroke="#163852" strokeWidth="0.75" />

                  {/* Range Labels */}
                  <text x="305" y="165" fill="#4B6B82" fontSize="9" fontFamily="monospace">10 NM</text>
                  <text x="305" y="95" fill="#4B6B82" fontSize="9" fontFamily="monospace">20 NM</text>
                  <text x="305" y="25" fill="#4B6B82" fontSize="9" fontFamily="monospace">30 NM</text>

                  {/* IMBL (International Maritime Boundary Line with Bangladesh) */}
                  <line x1="530" y1="40" x2="490" y2="400" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="6 3" />
                  <text x="500" y="380" fill="#EF4444" fontSize="9" fontFamily="monospace" transform="rotate(83 500,380)">
                    IMBL MARITIME BORDER
                  </text>

                  {/* Sandheads Deep-Water Channel Corridor */}
                  <path d="M 280 400 L 320 200 L 300 40" fill="none" stroke="#0284C7" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
                  <text x="240" y="320" fill="#38BDF8" fontSize="9" fontFamily="monospace">
                    SANDHEADS FAIRWAY
                  </text>

                  {/* 6 Coastal Sectors (WB-01 to WB-06) */}
                  {RADAR_SECTORS.map((sec) => (
                    <g
                      key={sec.id}
                      className="cursor-pointer group"
                      onClick={() => onSelectSector && onSelectSector(sec.id)}
                    >
                      <circle cx={sec.x} cy={sec.y} r="14" fill="#0284C7" fillOpacity="0.15" stroke="#38BDF8" strokeWidth="1" />
                      <circle cx={sec.x} cy={sec.y} r="3" fill="#38BDF8" />
                      <rect x={sec.x - 24} y={sec.y + 7} width="48" height="15" rx="3" fill="#0A1826" stroke="#1E3A52" strokeWidth="0.8" />
                      <text x={sec.x} y={sec.y + 18} textAnchor="middle" fill="#E2E8F0" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                        {sec.code}
                      </text>
                    </g>
                  ))}

                  {/* Render Live Vessels */}
                  {filteredVessels.map((v) => {
                    const pos = projectToRadar(v.lat, v.lng)
                    const isSel = selectedVessel?.mmsi === v.mmsi
                    const catColor = getCategoryColor(v.vessel_type)

                    // Direction vector
                    const rad = ((v.course_deg - 90) * Math.PI) / 180
                    const lineLen = 14 + v.speed_knots * 0.8
                    const vx = pos.x + Math.cos(rad) * lineLen
                    const vy = pos.y + Math.sin(rad) * lineLen

                    return (
                      <g
                        key={v.mmsi}
                        className="cursor-pointer transition-all"
                        onClick={() => setSelectedVessel(v)}
                      >
                        {/* Selected pulse ring */}
                        {isSel && (
                          <circle cx={pos.x} cy={pos.y} r="18" fill="none" stroke="#00E5FF" strokeWidth="1.5" className="animate-ping" opacity="0.75" />
                        )}

                        {/* Heading Vector */}
                        <line x1={pos.x} y1={pos.y} x2={vx} y2={vy} stroke={catColor.dot} strokeWidth="1.5" />

                        {/* Vessel Marker */}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={isSel ? 7 : 5}
                          fill={catColor.dot}
                          stroke="#FFFFFF"
                          strokeWidth={isSel ? 2 : 1}
                        />

                        {/* Vessel Name Tag */}
                        <text
                          x={pos.x + 8}
                          y={pos.y - 4}
                          fill={isSel ? '#FFFFFF' : '#94A3B8'}
                          fontSize={isSel ? '9.5' : '8'}
                          fontFamily="sans-serif"
                          fontWeight={isSel ? 'bold' : 'normal'}
                        >
                          {v.name.length > 14 ? v.name.slice(0, 12) + '…' : v.name}
                        </text>
                      </g>
                    )
                  })}
                </svg>

                {/* Radar Legend in corner */}
                <div className="absolute bottom-2 left-2 bg-[#06121ECC]/90 backdrop-blur-xs border border-slate-800 rounded px-2 py-1.5 text-[10px] font-mono flex flex-wrap gap-2.5">
                  <span className="flex items-center gap-1 text-blue-400">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Cargo
                  </span>
                  <span className="flex items-center gap-1 text-purple-400">
                    <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> Cruise
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Tanker
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Fishing
                  </span>
                  <span className="flex items-center gap-1 text-red-400">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Patrol
                  </span>
                </div>
              </div>
            </div>

            {/* Vessel Telemetry Inspector Drawer - 4 cols */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              {selectedVessel ? (
                <div className="bg-[#06121E] border border-slate-700/80 rounded-xl p-4 shadow-md flex flex-col gap-3 text-xs">
                  {/* Top Header */}
                  <div className="border-b border-slate-800 pb-2.5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                        getCategoryColor(selectedVessel.vessel_type).border
                      } ${getCategoryColor(selectedVessel.vessel_type).text}`}>
                        {selectedVessel.category_label}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        MMSI: {selectedVessel.mmsi}
                      </span>
                    </div>
                    <h3 className="font-serif text-base font-bold text-white">
                      {selectedVessel.name}
                    </h3>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>Flag: {selectedVessel.flag}</span>
                      {selectedVessel.imo && <span>• IMO: {selectedVessel.imo}</span>}
                    </div>
                  </div>

                  {/* Proximity Hazard Alert if active */}
                  {selectedVessel.proximity_hazard && (
                    <div className="bg-amber-950/90 border border-amber-800 rounded p-2.5 text-amber-200 text-[11px] leading-relaxed">
                      <div className="font-bold flex items-center gap-1 text-amber-400 mb-0.5">
                        <AlertTriangle size={13} />
                        <span>CLOSE QUARTERS TO FISHING ZONE</span>
                      </div>
                      {selectedVessel.hazard_note}
                    </div>
                  )}

                  {/* Telemetry Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">SPEED (SOG)</span>
                      <strong className="text-cyan-400 text-sm">{selectedVessel.speed_knots} kts</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">COURSE (COG)</span>
                      <strong className="text-slate-200 text-sm">{selectedVessel.course_deg}° True</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">DRAUGHT / DIMENSIONS</span>
                      <span className="text-slate-300">{selectedVessel.draught_m}m ({selectedVessel.length_m}×{selectedVessel.width_m}m)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">NAV STATUS</span>
                      <span className="text-slate-300 truncate block" title={selectedVessel.nav_status}>
                        {selectedVessel.nav_status}
                      </span>
                    </div>
                  </div>

                  {/* Voyage Details */}
                  <div className="space-y-1.5 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80 text-[11px]">
                    <div>
                      <span className="text-slate-500 text-[10px] block">DESTINATION & ETA</span>
                      <strong className="text-white block">{selectedVessel.destination}</strong>
                      <span className="text-slate-400 text-[10px]">ETA: {selectedVessel.eta || 'En Route'}</span>
                    </div>
                    <div className="pt-1 border-t border-slate-800">
                      <span className="text-slate-500 text-[10px] block">OPERATOR & FREIGHT</span>
                      <span className="text-slate-300 block">{selectedVessel.operator}</span>
                      <span className="text-slate-400 text-[10px]">{selectedVessel.cargo_type}</span>
                    </div>
                    <div className="pt-1 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400 text-[10px]">PROXIMITY TO FISHING GROUND:</span>
                      <span className="font-mono font-bold text-cyan-400">
                        {selectedVessel.distance_to_closest_sector_nm} NM ({selectedVessel.closest_sector_name})
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Provider: Sandheads VTS (DGLL)</span>
                    <button
                      type="button"
                      onClick={() => setViewMode('internet_ais')}
                      className="text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <span>View in Global AIS</span>
                      <ExternalLink size={10} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#06121E] border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
                  <Ship size={24} className="mx-auto text-slate-600 mb-2" />
                  <span>Click on any vessel icon on the radar to inspect its AIS manifest.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: LIVE OPENSTREETMAP AIS TRACKER */}
        {viewMode === 'internet_ais' && (
          <div className="bg-[#06121E] border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <MapIcon size={15} className="text-cyan-400" />
                <strong className="text-white">OpenStreetMap Live AIS Radar — Bay of Bengal (21.4°N, 88.0°E)</strong>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">
                Showing {filteredVessels.length} live vessels on OpenStreetMap tiles
              </span>
            </div>

            {/* React Leaflet Map Container */}
            <div className="relative w-full h-[500px] bg-slate-950 rounded-lg overflow-hidden border border-slate-700">
              <MapContainer
                center={[21.45, 88.05]}
                zoom={9}
                scrollWheelZoom={true}
                className="w-full h-full"
                style={{ height: '100%', width: '100%' }}
              >
                {selectedVessel && <VesselMapFlyTo target={selectedVessel} />}

                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  maxZoom={18}
                />

                {/* IMBL Boundary */}
                <Polyline
                  positions={IMBL_COORDS}
                  pathOptions={{ color: '#DC2626', weight: 2.5, dashArray: '6, 6' }}
                >
                  <Tooltip sticky>
                    <div className="font-mono text-xs font-bold text-red-600">
                      INDIA — BANGLADESH IMBL (Maritime Border)
                    </div>
                  </Tooltip>
                </Polyline>

                {/* Coastal Sectors */}
                {RADAR_SECTORS.map((sec) => (
                  <Marker
                    key={`ais-sec-${sec.id}`}
                    position={[sec.lat, sec.lng]}
                    icon={L.divIcon({
                      className: 'custom-sector-marker',
                      html: `
                        <div style="background-color: #0F172A; border: 2px solid #00E5FF; border-radius: 9999px; padding: 2px 7px; color: #FFFFFF; font-family: monospace; font-size: 10px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.5); cursor: pointer;">
                          ${sec.code} · ${sec.name}
                        </div>
                      `,
                      iconSize: [60, 24],
                      iconAnchor: [30, 12]
                    })}
                    eventHandlers={{
                      click: () => onSelectSector && onSelectSector(sec.id)
                    }}
                  >
                    <Popup>
                      <div className="p-2 text-xs font-sans text-slate-900">
                        <strong>{sec.name} ({sec.code})</strong>
                        <div className="text-slate-600 text-[11px] mt-1">Coastal Fishing Sector</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Live AIS Vessels Markers */}
                {filteredVessels.map((v) => {
                  const isSel = selectedVessel?.mmsi === v.mmsi
                  const dotColor =
                    v.vessel_type === 'cargo'
                      ? '#3B82F6'
                      : v.vessel_type === 'cruise'
                      ? '#A855F7'
                      : v.vessel_type === 'tanker'
                      ? '#F59E0B'
                      : v.vessel_type === 'patrol'
                      ? '#EF4444'
                      : '#10B981'

                  const hullColor =
                    v.vessel_type === 'cargo'
                      ? '#1E3A8A'
                      : v.vessel_type === 'cruise'
                      ? '#4C1D95'
                      : v.vessel_type === 'tanker'
                      ? '#78350F'
                      : v.vessel_type === 'patrol'
                      ? '#7F1D1D'
                      : '#064E3B'

                  const isHeadingEast = v.course_deg >= 0 && v.course_deg < 180

                  const vesselIcon = L.divIcon({
                    className: 'custom-vessel-marker',
                    html: `
                      <div style="position: relative; cursor: pointer; display: flex; flex-direction: column; align-items: center; user-select: none;">
                        
                        <!-- Zomato/Swiggy-Style Floating Live Status Pill -->
                        <div style="margin-bottom: 2px; background: rgba(8, 20, 32, 0.96); border: 1.5px solid ${isSel ? '#00E5FF' : dotColor}; box-shadow: 0 4px 14px rgba(0,0,0,0.6); border-radius: 9999px; padding: 2px 7px; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; backdrop-filter: blur(4px);">
                          <span style="width: 6.5px; height: 6.5px; border-radius: 50%; background: #10B981; box-shadow: 0 0 6px #10B981; display: inline-block;"></span>
                          <span style="color: #FFFFFF; font-weight: 800; font-size: 9.5px; font-family: system-ui, -apple-system, sans-serif;">${v.name}</span>
                          <span style="background: rgba(255,255,255,0.15); color: #38BDF8; font-family: monospace; font-weight: 700; font-size: 8.5px; padding: 0.5px 4px; border-radius: 3px;">${v.speed_knots} kts</span>
                        </div>

                        <!-- Water Wake & Ripple Layer -->
                        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
                          <span class="water-wake-effect" style="position: absolute; bottom: 1px; width: 50px; height: 22px; border-radius: 50%; background: radial-gradient(ellipse at center, rgba(56, 189, 248, 0.55) 0%, rgba(14, 165, 233, 0) 75%); pointer-events: none;"></span>

                          <!-- Sailing Ship Vector (Direct replica of the user's reference image) -->
                          <div class="sailing-ship-bob" style="transform: ${isHeadingEast ? 'scaleX(-1)' : 'scaleX(1)'}; transform-origin: center center;">
                            <svg viewBox="0 0 100 80" width="50" height="38" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.55));">
                              <!-- Dual Masts on Top Deck with Slanted Pennants -->
                              <path d="M 52 8 L 52 20 M 52 11 L 68 15 L 52 16" fill="${hullColor}" stroke="${hullColor}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                              <path d="M 74 18 L 74 26 M 74 20 L 84 22 L 74 23" fill="${hullColor}" stroke="${hullColor}" stroke-width="1.8" stroke-linecap="round"/>

                              <!-- Tier 4 Top Bridge Deck -->
                              <path d="M 38 21 L 68 21 Q 70 24 66 26 L 35 26 Q 33 23 38 21 Z" fill="#FFFFFF" stroke="${hullColor}" stroke-width="2"/>

                              <!-- Tier 3 Upper Deck -->
                              <path d="M 30 27 L 76 27 Q 79 31 74 33 L 26 33 Q 24 29 30 27 Z" fill="#FFFFFF" stroke="${hullColor}" stroke-width="2"/>
                              <!-- Windows on Tier 3 -->
                              <circle cx="36" cy="30" r="1.3" fill="${hullColor}"/>
                              <circle cx="42" cy="30" r="1.3" fill="${hullColor}"/>
                              <circle cx="48" cy="30" r="1.3" fill="${hullColor}"/>
                              <circle cx="54" cy="30" r="1.3" fill="${hullColor}"/>
                              <circle cx="60" cy="30" r="1.3" fill="${hullColor}"/>
                              <circle cx="66" cy="30" r="1.3" fill="${hullColor}"/>

                              <!-- Tier 2 Promenade Deck with Window Slats -->
                              <path d="M 23 34 L 88 34 Q 90 39 84 41 L 18 41 Q 17 36 23 34 Z" fill="#FFFFFF" stroke="${hullColor}" stroke-width="2"/>
                              <!-- Vertical Window Slats -->
                              <line x1="28" y1="36" x2="28" y2="39" stroke="${hullColor}" stroke-width="1.5"/>
                              <line x1="32" y1="36" x2="32" y2="39" stroke="${hullColor}" stroke-width="1.5"/>
                              <line x1="36" y1="36" x2="36" y2="39" stroke="${hullColor}" stroke-width="1.5"/>
                              <line x1="40" y1="36" x2="40" y2="39" stroke="${hullColor}" stroke-width="1.5"/>
                              <line x1="44" y1="36" x2="44" y2="39" stroke="${hullColor}" stroke-width="1.5"/>
                              <line x1="48" y1="36" x2="48" y2="39" stroke="${hullColor}" stroke-width="1.5"/>
                              <line x1="52" y1="36" x2="52" y2="39" stroke="${hullColor}" stroke-width="1.5"/>
                              <line x1="56" y1="36" x2="56" y2="39" stroke="${hullColor}" stroke-width="1.5"/>
                              <line x1="60" y1="36" x2="60" y2="39" stroke="${hullColor}" stroke-width="1.5"/>
                              <line x1="64" y1="36" x2="64" y2="39" stroke="${hullColor}" stroke-width="1.5"/>
                              <line x1="68" y1="36" x2="68" y2="39" stroke="${hullColor}" stroke-width="1.5"/>
                              <line x1="72" y1="36" x2="72" y2="39" stroke="${hullColor}" stroke-width="1.5"/>
                              <line x1="76" y1="36" x2="76" y2="39" stroke="${hullColor}" stroke-width="1.5"/>

                              <!-- Tier 1 Lower Promenade -->
                              <path d="M 68 42 L 94 42 Q 96 45 91 47 L 66 47 Z" fill="#FFFFFF" stroke="${hullColor}" stroke-width="1.6"/>
                              <line x1="72" y1="44" x2="89" y2="44" stroke="${hullColor}" stroke-width="1.5" stroke-dasharray="2,2"/>

                              <!-- Main Raked Hull (Faithfully matching user's image) -->
                              <path d="M 10 42 Q 20 42 28 46 Q 52 48 93 52 Q 95 54 89 57 Q 54 63 30 67 Q 23 68 18 60 Q 12 49 10 42 Z" fill="${hullColor}" stroke="#FFFFFF" stroke-width="1.5"/>

                              <!-- Hull Circular Portholes -->
                              <circle cx="33" cy="55" r="1.6" fill="#FFFFFF"/>
                              <circle cx="39" cy="56" r="1.6" fill="#FFFFFF"/>
                              <circle cx="45" cy="57" r="1.6" fill="#FFFFFF"/>
                              <circle cx="51" cy="58" r="1.6" fill="#FFFFFF"/>
                              <circle cx="58" cy="59" r="1.6" fill="#FFFFFF"/>

                              <!-- Dynamic White Wave Swooshes Cutting Ocean Surface -->
                              <path d="M 11 48 Q 25 60 95 56 Q 52 61 22 53 Z" fill="#FFFFFF" opacity="0.95"/>
                              <path d="M 30 66 Q 60 67 92 59 Q 60 70 30 66 Z" fill="#38BDF8" opacity="0.85"/>
                              <path d="M 38 70 Q 66 72 90 63 Q 63 74 38 70 Z" fill="#0284C7" opacity="0.6"/>
                            </svg>
                          </div>
                        </div>

                        <!-- Bottom Status Pill -->
                        <div style="margin-top: 2px; font-size: 8px; font-family: system-ui, sans-serif; background: rgba(6, 18, 30, 0.88); color: #94A3B8; padding: 1px 6px; border-radius: 9999px; border: 0.5px solid rgba(255,255,255,0.12); white-space: nowrap;">
                          ${v.nav_status === 'Engaged in fishing' ? '⚓ Fishing' : '🌊 Sailing'} → ${v.destination?.split(' ')[0] || 'En route'}
                        </div>

                      </div>
                    `,
                    iconSize: [110, 72],
                    iconAnchor: [55, 42],
                    popupAnchor: [0, -36]
                  })

                  return (
                    <Marker
                      key={v.mmsi}
                      position={[v.lat, v.lng]}
                      icon={vesselIcon}
                      eventHandlers={{
                        click: () => setSelectedVessel(v)
                      }}
                    >
                      <Popup>
                        <div className="p-3 bg-slate-950 text-slate-100 rounded-md min-w-[210px] text-xs font-sans">
                          <div className="flex items-center justify-between border-b border-slate-700 pb-1 mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <Ship size={14} className="text-cyan-400" />
                              <strong className="text-cyan-400 text-sm">{v.name}</strong>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">{v.flag}</span>
                          </div>
                          <div className="text-slate-300 text-[11px] mb-2">{v.category_label}</div>
                          <div className="grid grid-cols-2 gap-1 bg-slate-900 p-2 rounded text-[10px] font-mono mb-2 border border-slate-800">
                            <div>
                              <span className="text-slate-500">SPEED:</span>{' '}
                              <span className="text-cyan-400">{v.speed_knots} kts</span>
                            </div>
                            <div>
                              <span className="text-slate-500">COURSE:</span>{' '}
                              <span className="text-slate-200">{v.course_deg}°</span>
                            </div>
                            <div>
                              <span className="text-slate-500">DRAUGHT:</span>{' '}
                              <span className="text-slate-300">{v.draught_m}m</span>
                            </div>
                            <div>
                              <span className="text-slate-500">STATUS:</span>{' '}
                              <span className="text-slate-300 truncate block">{v.nav_status}</span>
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-300 mb-1">
                            <strong>Destination:</strong> {v.destination}
                          </div>
                          <div className="text-[10px] text-cyan-300">
                            Closest Sector: {v.distance_to_closest_sector_nm} NM ({v.closest_sector_name})
                          </div>
                          {v.proximity_hazard && (
                            <div className="mt-2 p-1.5 bg-red-950 border border-red-700 text-red-200 text-[10px] rounded font-bold">
                              ⚠️ {v.hazard_note}
                            </div>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  )
                })}
              </MapContainer>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-400 px-1">
              <span>
                Real-time OpenStreetMap telemetry powered by React Leaflet. Click any vessel marker to inspect its AIS manifest.
              </span>
              <a
                href="https://www.marinetraffic.com/en/ais/home/centerx:88.0/centery:21.4/zoom:8"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 font-bold shrink-0"
              >
                <span>External MarineTraffic Mirror</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}

        {/* VIEW 3: STRUCTURED VESSEL LEDGER */}
        {viewMode === 'list' && (
          <div className="bg-[#06121E] border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                  <tr>
                    <th className="p-3">Vessel & MMSI</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Speed & Course</th>
                    <th className="p-3">Destination</th>
                    <th className="p-3">Closest Fishing Zone</th>
                    <th className="p-3">Safety Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {filteredVessels.map((v) => {
                    const catColor = getCategoryColor(v.vessel_type)
                    return (
                      <tr key={v.mmsi} className="hover:bg-slate-900/60 transition-colors">
                        <td className="p-3 font-sans">
                          <strong className="text-white block font-bold">{v.name}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">MMSI: {v.mmsi} • {v.flag}</span>
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${catColor.border} ${catColor.text}`}>
                            {v.category_label}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">
                          <strong className="text-cyan-400">{v.speed_knots} kts</strong>
                          <span className="text-slate-400 block text-[10px]">{v.course_deg}°</span>
                        </td>
                        <td className="p-3 text-slate-300 font-sans">
                          <span>{v.destination}</span>
                          <span className="text-slate-500 block text-[10px] font-mono">{v.eta}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-cyan-300 font-bold">{v.distance_to_closest_sector_nm} NM</span>
                          <span className="text-slate-400 block text-[10px]">{v.closest_sector_name}</span>
                        </td>
                        <td className="p-3">
                          {v.proximity_hazard ? (
                            <span className="text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800 text-[10px] font-bold inline-flex items-center gap-1">
                              <AlertTriangle size={11} />
                              <span>Hazard (&lt;6 NM)</span>
                            </span>
                          ) : (
                            <span className="text-emerald-400 text-[10px]">
                              Safe Clear
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedVessel(v)
                              setViewMode('radar')
                            }}
                            className="px-2.5 py-1 rounded bg-cyan-900/60 hover:bg-cyan-800 text-cyan-300 font-bold text-[10px] cursor-pointer"
                          >
                            Plot Radar
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
