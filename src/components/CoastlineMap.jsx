import { useState, useEffect, useMemo } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  Polyline,
  Polygon,
  Circle,
  useMap
} from 'react-leaflet'
import L from 'leaflet'
import {
  ShieldAlert,
  ShieldCheck,
  Compass,
  Radio,
  AlertOctagon,
  Anchor,
  Maximize2,
  Waves,
  Crosshair,
  Layers,
  MapPin,
  Ship,
  Map as MapIcon,
  Navigation,
  ExternalLink,
  Info
} from 'lucide-react'
import { simulateFleetDensity } from '../lib/derived.js'
import { fetchLiveVessels } from '../lib/api.js'

// Authentic coastal coordinates for WB-01 to WB-06 with real WGS-84 Lat/Lng & SVG mapping
const MAP_SECTORS = [
  {
    id: 'digha',
    code: 'WB-01',
    name: 'Digha',
    lat: 21.6167,
    lng: 87.5167,
    x: 120,
    y: 260,
    depth: 12,
    district: 'Purba Medinipur',
    imblDistanceNM: 68.4,
    harbor: 'Digha Mohana Jetty'
  },
  {
    id: 'shankarpur',
    code: 'WB-02',
    name: 'Shankarpur',
    lat: 21.6333,
    lng: 87.5833,
    x: 190,
    y: 250,
    depth: 16,
    district: 'Purba Medinipur',
    imblDistanceNM: 62.1,
    harbor: 'Shankarpur Principal Fishing Harbour'
  },
  {
    id: 'junput',
    code: 'WB-03',
    name: 'Junput',
    lat: 21.7167,
    lng: 87.8167,
    x: 270,
    y: 220,
    depth: 18,
    district: 'Purba Medinipur',
    imblDistanceNM: 52.8,
    harbor: 'Junput Fish Landing Centre'
  },
  {
    id: 'sagar-island',
    code: 'WB-04',
    name: 'Sagar Island',
    lat: 21.6500,
    lng: 88.0333,
    x: 420,
    y: 270,
    depth: 24,
    district: 'South 24 Parganas',
    protected: true,
    imblDistanceNM: 36.2,
    harbor: 'Sagar Roads Anchorage'
  },
  {
    id: 'frazerganj',
    code: 'WB-05',
    name: 'Frazerganj',
    lat: 21.5667,
    lng: 88.2500,
    x: 550,
    y: 310,
    depth: 21,
    district: 'South 24 Parganas',
    protected: true,
    imblDistanceNM: 16.8,
    harbor: 'Frazerganj Fishing Harbour'
  },
  {
    id: 'kakdwip',
    code: 'WB-06',
    name: 'Kakdwip',
    lat: 21.8667,
    lng: 88.1833,
    x: 500,
    y: 170,
    depth: 29,
    district: 'South 24 Parganas',
    imblDistanceNM: 24.5,
    harbor: 'Kakdwip Jetty'
  }
]

// 2014 UNCLOS Bay of Bengal Maritime Boundary line coordinates (India - Bangladesh)
const IMBL_COORDINATES = [
  [21.85, 89.02],
  [21.60, 89.12],
  [21.35, 89.20],
  [21.05, 89.28]
]

// 5 Nautical Mile Warning Buffer zone polygon coordinates
const GEOFENCE_BUFFER_COORDS = [
  [21.88, 88.90],
  [21.85, 89.02],
  [21.05, 89.28],
  [21.05, 89.16]
]

// Sundarbans & Lothian Island Wildlife Buffer Area
const SANCTUARY_COORDS = [
  [21.88, 88.35],
  [21.95, 88.65],
  [21.82, 88.98],
  [21.55, 88.92],
  [21.50, 88.45],
  [21.72, 88.28]
]

// Helper component for programmatic Leaflet map panning
function MapController({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || map.getZoom(), { duration: 1 })
    }
  }, [center, zoom, map])
  return null
}

export default function CoastlineMap({
  role = 'skipper',
  results = [],
  selectedId = null,
  onSelect = () => {},
  isBanActive = false,
  scanDate = new Date().toISOString().slice(0, 10)
}) {
  const [viewMode, setViewMode] = useState('osm') // 'osm' (OpenStreetMap) | 'chart' (SVG Nautical Chart)
  const [tileProvider, setTileProvider] = useState('osm') // 'osm' | 'satellite'
  const isOfficer = role === 'officer'
  const [showFleetDensity, setShowFleetDensity] = useState(isOfficer)
  const [showLiveAis, setShowLiveAis] = useState(true)
  const [liveVessels, setLiveVessels] = useState([])

  useEffect(() => {
    fetchLiveVessels().then((data) => setLiveVessels(data || [])).catch(() => {})
  }, [])

  // Zomato/Swiggy-style live sailing simulation: smoothly sails vessels along course
  useEffect(() => {
    if (liveVessels.length === 0) return

    const timer = setInterval(() => {
      setLiveVessels((prev) =>
        prev.map((v) => {
          const spd = v.speed_knots || 4.5
          const rad = ((v.course_deg || 90) * Math.PI) / 180
          const step = 0.000035 * (spd / 5)
          let nextLat = v.lat + Math.cos(rad) * step
          let nextLng = v.lng + Math.sin(rad) * step
          let nextCourse = v.course_deg

          // Keep within Bay of Bengal fairway bounding limits
          if (nextLat < 21.05 || nextLat > 22.0) nextCourse = (nextCourse + 180) % 360
          if (nextLng < 87.35 || nextLng > 88.55) nextCourse = (nextCourse + 180) % 360

          return { ...v, lat: nextLat, lng: nextLng, course_deg: nextCourse }
        })
      )
    }, 2000)

    return () => clearInterval(timer)
  }, [liveVessels.length])

  const selectedSector = MAP_SECTORS.find((s) => s.id === selectedId) || MAP_SECTORS[0]

  // Map result lookup
  const getResult = (id) => results?.find((r) => r.zoneId === id)

  // Status computation per zone
  const getSectorStatus = (id) => {
    const res = getResult(id)
    if (!res) {
      return {
        status: 'unknown',
        label: 'Scanning...',
        badge: 'PENDING',
        color: 'bg-slate-400',
        fill: '#64748B',
        border: 'border-slate-300',
        text: 'text-slate-700'
      }
    }

    const isBan = res.verdict === 'Seasonal Closure' || isBanActive
    const isUnsafe = res.verdict === 'Unsafe Today'
    const isRecommended = res.verdict === 'Recommended'
    const nearProtected = res.agents?.find((a) => a.agent === 'sustain')?.readouts?.some(r => r.value?.toLowerCase().includes('sanctuary'))

    if (isBan) {
      return {
        status: 'violation',
        label: isOfficer ? 'Seasonal Ban Violation' : 'Seasonal Ban',
        badge: isOfficer ? 'MFRA VIOLATION' : 'CLOSED',
        color: 'bg-red-600',
        fill: '#DC2626',
        border: 'border-red-500',
        text: 'text-red-700'
      }
    }
    if (isUnsafe) {
      return {
        status: 'hazard',
        label: isOfficer ? 'Hazard Warning Active' : 'Unsafe Sea State',
        badge: 'SQUALL HAZARD',
        color: 'bg-orange-500',
        fill: '#EA580C',
        border: 'border-orange-500',
        text: 'text-orange-700'
      }
    }
    if (nearProtected) {
      return {
        status: 'buffer',
        label: isOfficer ? 'Sanctuary Buffer Monitored' : 'Near Wildlife Sanctuary',
        badge: 'BUFFER ZONE',
        color: 'bg-amber-500',
        fill: '#D97706',
        border: 'border-amber-400',
        text: 'text-amber-700'
      }
    }
    if (isRecommended) {
      return {
        status: 'compliant',
        label: isOfficer ? 'Zone Open & Compliant' : 'Recommended',
        badge: isOfficer ? 'COMPLIANT' : 'OPTIMAL',
        color: 'bg-emerald-600',
        fill: '#059669',
        border: 'border-emerald-500',
        text: 'text-emerald-700'
      }
    }
    return {
      status: 'marginal',
      label: isOfficer ? 'Compliant (Moderate Activity)' : 'Marginal',
      badge: 'OPEN',
      color: 'bg-teal-600',
      fill: '#0D9488',
      border: 'border-teal-500',
      text: 'text-teal-700'
    }
  }

  // Summary counts for Officer view
  const violationCount = MAP_SECTORS.filter((s) => getSectorStatus(s.id).status === 'violation').length
  const hazardCount = MAP_SECTORS.filter((s) => getSectorStatus(s.id).status === 'hazard').length
  const compliantCount = MAP_SECTORS.filter((s) => {
    const st = getSectorStatus(s.id).status
    return st === 'compliant' || st === 'marginal' || st === 'buffer'
  }).length

  // Custom Leaflet DivIcon for Sector Pins
  const createSectorIcon = (sector, status, isSelected) => {
    const isViol = status.status === 'violation'
    const fill = status.fill || '#059669'

    return L.divIcon({
      className: 'custom-sector-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; user-select: none;">
          ${
            isSelected || isViol
              ? `<span style="position: absolute; top: -4px; width: 36px; height: 36px; border-radius: 50%; background: ${fill}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`
              : ''
          }
          <div style="background-color: ${isSelected ? '#0A1B27' : '#FFFFFF'}; border: 2.5px solid ${fill}; box-shadow: 0 4px 10px rgba(0,0,0,0.35); border-radius: 9999px; padding: 2px 7px; display: flex; align-items: center; gap: 4px; transition: transform 0.2s;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background-color: ${fill}; display: inline-block;"></span>
            <span style="color: ${isSelected ? '#FFFFFF' : '#0A1B27'}; font-family: monospace; font-weight: 800; font-size: 11px;">${sector.code}</span>
          </div>
          <div style="margin-top: 2px; padding: 1px 5px; border-radius: 3px; background-color: rgba(10, 27, 39, 0.9); color: #E2E8F0; font-family: monospace; font-size: 9px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            ${sector.name} · ${sector.depth}m
          </div>
        </div>
      `,
      iconSize: [60, 48],
      iconAnchor: [30, 24],
      popupAnchor: [0, -18]
    })
  }

  // Custom Leaflet DivIcon for Live AIS Vessels
  const createVesselIcon = (vessel) => {
    const dotColor =
      vessel.vessel_type === 'cargo'
        ? '#3B82F6'
        : vessel.vessel_type === 'cruise'
        ? '#A855F7'
        : vessel.vessel_type === 'tanker'
        ? '#F59E0B'
        : vessel.vessel_type === 'patrol'
        ? '#EF4444'
        : '#10B981'

    const hullColor =
      vessel.vessel_type === 'cargo'
        ? '#1E3A8A'
        : vessel.vessel_type === 'cruise'
        ? '#4C1D95'
        : vessel.vessel_type === 'tanker'
        ? '#78350F'
        : vessel.vessel_type === 'patrol'
        ? '#7F1D1D'
        : '#064E3B'

    const isHeadingEast = vessel.course_deg >= 0 && vessel.course_deg < 180

    return L.divIcon({
      className: 'custom-vessel-marker',
      html: `
        <div style="position: relative; cursor: pointer; display: flex; flex-direction: column; align-items: center; user-select: none;">
          
          <!-- Zomato/Swiggy-Style Floating Live Status Pill -->
          <div style="margin-bottom: 2px; background: rgba(8, 20, 32, 0.96); border: 1.5px solid ${dotColor}; box-shadow: 0 4px 14px rgba(0,0,0,0.6); border-radius: 9999px; padding: 2px 7px; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; backdrop-filter: blur(4px);">
            <span style="width: 6.5px; height: 6.5px; border-radius: 50%; background: #10B981; box-shadow: 0 0 6px #10B981; display: inline-block;"></span>
            <span style="color: #FFFFFF; font-weight: 800; font-size: 9.5px; font-family: system-ui, -apple-system, sans-serif;">${vessel.name}</span>
            <span style="background: rgba(255,255,255,0.15); color: #38BDF8; font-family: monospace; font-weight: 700; font-size: 8.5px; padding: 0.5px 4px; border-radius: 3px;">${vessel.speed_knots} kts</span>
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

          <!-- Bottom Sailing Status Tag (Zomato/Swiggy-style) -->
          <div style="margin-top: 2px; font-size: 8px; font-family: system-ui, sans-serif; background: rgba(6, 18, 30, 0.88); color: #94A3B8; padding: 1px 6px; border-radius: 9999px; border: 0.5px solid rgba(255,255,255,0.12); white-space: nowrap;">
            ${vessel.nav_status === 'Engaged in fishing' ? '⚓ Fishing' : '🌊 Sailing'} → ${vessel.destination?.split(' ')[0] || 'En route'}
          </div>

        </div>
      `,
      iconSize: [110, 72],
      iconAnchor: [55, 42],
      popupAnchor: [0, -36]
    })
  }

  const defaultCenter = useMemo(() => [21.68, 87.95], [])

  return (
    <div
      className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-all ${
        isOfficer
          ? 'border-[#007A78]/40 ring-1 ring-[#007A78]/20 mb-6'
          : 'border-slate-300 mb-4'
      }`}
    >
      {/* 1. Header Bar — Dynamic Adaptations */}
      <div
        className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b ${
          isOfficer ? 'bg-[#061B24] text-white border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1">
            {isOfficer ? (
              <>
                <ShieldCheck size={15} className="text-emerald-400" />
                <span className="text-emerald-400 font-mono">ICG / INCOIS SURVEILLANCE RADAR GRID</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 font-mono">WEST BENGAL COASTAL SECTORS WB-01 TO WB-06</span>
              </>
            ) : (
              <>
                <Compass size={15} className="text-[#007A78]" />
                <span className="text-[#007A78]">Hydrographic Coastal Chart</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600">Chart IN-351 (Hooghly Delta)</span>
              </>
            )}
          </div>
          <h2 className={`font-serif text-lg sm:text-xl font-bold ${isOfficer ? 'text-white' : 'text-[#0A1B27]'}`}>
            {isOfficer
              ? 'Coastline Compliance & Patrol Jurisdiction Command'
              : 'Bay of Bengal Coastal Sounding & Sector Positions'}
          </h2>
          <p className={`text-xs mt-0.5 max-w-2xl ${isOfficer ? 'text-slate-300' : 'text-[#5C7788]'}`}>
            {isOfficer
              ? 'Real-time spatial monitoring of uniform trawling ban borders, marine protected areas, and sector compliance statuses with OpenStreetMap overview.'
              : 'Interactive coastal navigation map marking offshore distance, sounding contours, and harbor jetty anchorages with OpenStreetMap overview.'}
          </p>
        </div>

        {/* Officer Surveillance Status Pills */}
        {isOfficer ? (
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto font-mono text-xs">
            <div className="bg-red-950/80 border border-red-700/80 px-2.5 py-1 rounded text-red-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>{violationCount} Violations / Bans</span>
            </div>
            <div className="bg-orange-950/80 border border-orange-700/80 px-2.5 py-1 rounded text-orange-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span>{hazardCount} Squall Hazards</span>
            </div>
            <div className="bg-emerald-950/80 border border-emerald-700/80 px-2.5 py-1 rounded text-emerald-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{compliantCount} Open Sectors</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 font-mono text-xs text-[#5C7788]">
            <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded shadow-2xs">
              <Radio size={12} className="text-[#007A78] animate-pulse" />
              <span>6 Active Soundings</span>
            </span>
          </div>
        )}

        {/* Action Controls & Layer Toggles */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs self-start md:self-auto">
          {/* Map Mode Switcher: OpenStreetMap vs Nautical Vector Chart */}
          <div className="inline-flex rounded-md p-0.5 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('osm')}
              className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'osm'
                  ? 'bg-[#007A78] text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
              }`}
              title="Interactive OpenStreetMap Overview"
            >
              <MapIcon size={13} />
              <span>OpenStreetMap</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('chart')}
              className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'chart'
                  ? 'bg-[#007A78] text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
              }`}
              title="Vector Hydrographic Nautical Chart"
            >
              <Compass size={13} />
              <span>Vector Chart</span>
            </button>
          </div>

          {/* Tile Layer Toggle (when in OSM mode) */}
          {viewMode === 'osm' && (
            <button
              type="button"
              onClick={() => setTileProvider(tileProvider === 'osm' ? 'satellite' : 'osm')}
              className="px-2.5 py-1 rounded border bg-white text-slate-700 border-slate-300 hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              title="Toggle Tile Style (Standard OpenStreetMap vs Satellite)"
            >
              <Layers size={13} className="text-[#007A78]" />
              <span>{tileProvider === 'osm' ? 'OSM Standard' : 'Satellite'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowLiveAis(!showLiveAis)}
            className={`px-2.5 py-1 rounded border flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer ${
              showLiveAis
                ? 'bg-cyan-700 text-white border-cyan-800'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Ship size={13} />
            <span>Live AIS ({liveVessels.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setShowFleetDensity(!showFleetDensity)}
            className={`px-2.5 py-1 rounded border flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer ${
              showFleetDensity
                ? isOfficer
                  ? 'bg-emerald-800 text-white border-emerald-900'
                  : 'bg-[#007A78] text-white border-[#005B59]'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Layers size={13} />
            <span>Density Matrix</span>
          </button>

          <div
            className={`px-2.5 py-1 rounded border flex items-center gap-1.5 shadow-2xs ${
              selectedSector?.imblDistanceNM < 20
                ? 'bg-amber-100 text-amber-950 border-amber-300 font-bold'
                : isOfficer
                ? 'bg-slate-900 border-slate-700 text-slate-300'
                : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <Radio
              size={11}
              className={selectedSector?.imblDistanceNM < 20 ? 'text-amber-700 animate-pulse' : 'text-emerald-600'}
            />
            <span>
              IMBL: <strong>{selectedSector?.imblDistanceNM} NM</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAP CANVAS: React Leaflet OpenStreetMap vs SVG Nautical Chart */}
      {viewMode === 'osm' ? (
        <div className="relative w-full overflow-hidden" style={{ height: isOfficer ? '420px' : '380px' }}>
          <MapContainer
            center={defaultCenter}
            zoom={9}
            scrollWheelZoom={true}
            className="w-full h-full"
            style={{ height: '100%', width: '100%' }}
          >
            {/* Smooth flying controller on sector select */}
            {selectedSector && (
              <MapController center={[selectedSector.lat, selectedSector.lng]} zoom={9} />
            )}

            {/* OpenStreetMap standard tiles (or Esri satellite when toggled) */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
              url={
                tileProvider === 'satellite'
                  ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              }
              maxZoom={18}
            />

            {/* India - Bangladesh UNCLOS IMBL Boundary Line */}
            <Polyline
              positions={IMBL_COORDINATES}
              pathOptions={{
                color: '#DC2626',
                weight: 3,
                dashArray: '8, 6'
              }}
            >
              <Tooltip sticky>
                <div className="font-mono text-xs font-bold text-red-600">
                  INDIA — BANGLADESH IMBL (UNCLOS Maritime Border)
                </div>
              </Tooltip>
            </Polyline>

            {/* 5 Nautical Mile Warning Buffer Area */}
            <Polygon
              positions={GEOFENCE_BUFFER_COORDS}
              pathOptions={{
                color: '#F59E0B',
                fillColor: '#F59E0B',
                fillOpacity: 0.12,
                weight: 1.5,
                dashArray: '4, 4'
              }}
            >
              <Tooltip sticky>
                <div className="font-mono text-xs text-amber-700 font-bold">
                  ⚠️ 5 NM International Geofence Warning Buffer
                </div>
              </Tooltip>
            </Polygon>

            {/* Sundarbans & Lothian Sanctuary Wildlife Buffer Zone */}
            <Polygon
              positions={SANCTUARY_COORDS}
              pathOptions={{
                color: '#DC2626',
                fillColor: '#DC2626',
                fillOpacity: 0.14,
                weight: 1.5,
                dashArray: '6, 4'
              }}
            >
              <Tooltip sticky>
                <div className="font-mono text-xs text-red-700 font-bold">
                  🛡️ Sundarbans Biosphere &amp; Lothian Sanctuary Marine Buffer
                </div>
              </Tooltip>
            </Polygon>

            {/* Fleet Density Matrix Overlays */}
            {showFleetDensity &&
              MAP_SECTORS.map((sec) => {
                const fleet = simulateFleetDensity(sec.id, scanDate)
                const count = Number(fleet?.vesselCount || 15)
                const hasUnauth = fleet?.riskLevel === 'critical'
                const radius = Math.max(2000, count * 150)
                return (
                  <Circle
                    key={`density-${sec.id}`}
                    center={[sec.lat, sec.lng]}
                    radius={radius}
                    pathOptions={{
                      color: hasUnauth ? '#DC2626' : '#059669',
                      fillColor: hasUnauth ? '#EF4444' : '#10B981',
                      fillOpacity: 0.16,
                      weight: 1.2,
                      dashArray: hasUnauth ? '4, 4' : null
                    }}
                  >
                    <Tooltip sticky>
                      <div className="text-xs font-mono">
                        <strong>{sec.name} Fleet Density:</strong> {count} crafts
                        {hasUnauth && (
                          <span className="text-red-600 block font-bold">
                            ⚠️ Critical density / unauthorized craft alert
                          </span>
                        )}
                      </div>
                    </Tooltip>
                  </Circle>
                )
              })}

            {/* Live AIS Vessels Plotted as Markers on OpenStreetMap */}
            {showLiveAis &&
              liveVessels.map((vessel) => (
                <Marker
                  key={`vessel-${vessel.mmsi}`}
                  position={[vessel.lat, vessel.lng]}
                  icon={createVesselIcon(vessel)}
                >
                  <Popup>
                    <div className="p-3 bg-[#0A1B27] text-slate-100 rounded-md min-w-[220px] text-xs font-sans">
                      <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-2">
                        <div className="flex items-center gap-1.5">
                          <Ship size={14} className="text-cyan-400" />
                          <strong className="text-cyan-400 text-sm">{vessel.name}</strong>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{vessel.flag}</span>
                      </div>
                      <div className="text-[11px] text-slate-300 mb-2">
                        {vessel.category_label} · MMSI: {vessel.mmsi}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 bg-slate-900/90 p-2 rounded border border-slate-800 font-mono text-[10px] mb-2">
                        <div>
                          <span className="text-slate-500 block">SPEED</span>
                          <strong className="text-cyan-400">{vessel.speed_knots} kts</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">COURSE</span>
                          <strong className="text-slate-200">{vessel.course_deg}° True</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">STATUS</span>
                          <span className="text-slate-300 truncate block">{vessel.nav_status}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">DESTINATION</span>
                          <span className="text-slate-300 truncate block">{vessel.destination}</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800">
                        <span>Proximity:</span>
                        <strong className="text-cyan-300">
                          {vessel.distance_to_closest_sector_nm} NM ({vessel.closest_sector_name})
                        </strong>
                      </div>
                      {vessel.proximity_hazard && (
                        <div className="mt-2 p-1.5 bg-red-950/90 border border-red-700 text-red-200 text-[10px] rounded font-bold">
                          ⚠️ Proximity Hazard: {vessel.hazard_note}
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}

            {/* WB-01 to WB-06 Coastal Sector Markers on OpenStreetMap */}
            {MAP_SECTORS.map((sector) => {
              const status = getSectorStatus(sector.id)
              const isSelected = selectedId === sector.id

              return (
                <Marker
                  key={sector.id}
                  position={[sector.lat, sector.lng]}
                  icon={createSectorIcon(sector, status, isSelected)}
                  eventHandlers={{
                    click: () => onSelect(sector.id)
                  }}
                >
                  <Popup>
                    <div className="p-3 bg-white text-slate-900 rounded-md min-w-[210px] text-xs font-sans">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
                        <div>
                          <strong className="text-sm text-[#0A1B27]">{sector.name}</strong>{' '}
                          <span className="font-mono text-xs text-[#007A78]">({sector.code})</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${status.color}`}>
                          {status.badge}
                        </span>
                      </div>
                      <div className="space-y-1 text-[11px] text-slate-600 mb-3">
                        <div>
                          <strong>Status:</strong> {status.label}
                        </div>
                        <div>
                          <strong>Sounding Depth:</strong> {sector.depth} meters
                        </div>
                        <div>
                          <strong>Harbor Base:</strong> {sector.harbor}
                        </div>
                        <div>
                          <strong>District:</strong> {sector.district}
                        </div>
                        <div>
                          <strong>Distance to Border:</strong> {sector.imblDistanceNM} NM to IMBL
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelect(sector.id)}
                        className="w-full py-1.5 px-3 bg-[#007A78] hover:bg-[#006664] text-white rounded text-xs font-bold text-center transition-colors cursor-pointer shadow-xs"
                      >
                        Select Sector {sector.code}
                      </button>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>

          {/* Floating Chart Legend */}
          <div className="absolute bottom-3 right-3 z-[400] bg-white/95 backdrop-blur-sm border border-slate-300 p-2.5 rounded-lg text-[11px] shadow-md flex flex-col gap-1.5 font-sans pointer-events-auto">
            <div className="font-serif font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between gap-3">
              <span>Map Legend</span>
              <span className="font-mono text-[9px] text-[#007A78] font-bold">OpenStreetMap</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span className="text-slate-700 font-medium">Open / Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span className="text-slate-700 font-medium">Seasonal Ban</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span className="text-slate-700 font-medium">Squall Hazard</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-700 font-medium">Sanctuary Buffer</span>
              </div>
            </div>
            <div className="pt-1 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Red Dashed: IMBL Border</span>
              <span>Yellow: 5 NM Buffer</span>
            </div>
          </div>
        </div>
      ) : (
        /* 2B. Vector Nautical Chart (Original SVG mode) */
        <div className={`relative w-full overflow-hidden ${isOfficer ? 'bg-[#04121A]' : 'bg-[#EBF5FA]'}`}>
          {isOfficer && (
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_40%_50%,rgba(0,122,120,0.4),transparent_70%)]" />
          )}

          <svg
            viewBox="0 0 760 420"
            role="img"
            aria-label="Hydrographic chart of West Bengal coastal sectors and maritime boundary"
            className="w-full h-auto select-none"
            style={{ minHeight: isOfficer ? '380px' : '280px' }}
          >
            <defs>
              <pattern
                id="sanctuaryPattern"
                width="10"
                height="10"
                patternTransform="rotate(45 0 0)"
                patternUnits="userSpaceOnUse"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="10"
                  stroke={isOfficer ? '#EF4444' : '#DC2626'}
                  strokeWidth="1.5"
                  strokeOpacity="0.4"
                />
              </pattern>
              <pattern id="sandbarPattern" width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="0.8" fill="#007A78" fillOpacity="0.15" />
              </pattern>
            </defs>

            {/* Background Grid Lines (Hydrographic Lat/Long Grid) */}
            <g stroke={isOfficer ? '#0E2E3E' : '#D0E6F0'} strokeWidth="0.8" strokeDasharray="4,4">
              <line x1="0" y1="100" x2="760" y2="100" />
              <line x1="0" y1="200" x2="760" y2="200" />
              <line x1="0" y1="300" x2="760" y2="300" />
              <line x1="150" y1="0" x2="150" y2="420" />
              <line x1="320" y1="0" x2="320" y2="420" />
              <line x1="490" y1="0" x2="490" y2="420" />
              <line x1="650" y1="0" x2="650" y2="420" />
            </g>

            {/* Geographic Coordinates Annotations */}
            <g fill={isOfficer ? '#93B9CC' : '#476577'} fontSize="9" fontFamily="monospace">
              <text x="10" y="105">21°50' N</text>
              <text x="10" y="205">21°40' N</text>
              <text x="10" y="305">21°30' N</text>
              <text x="155" y="410">87°30' E</text>
              <text x="325" y="410">87°50' E</text>
              <text x="495" y="410">88°10' E</text>
              <text x="655" y="410">88°30' E</text>
            </g>

            {/* Mainland West Bengal Coastline Geometry */}
            <path
              d="M 0 160 Q 90 150 150 165 T 260 140 Q 320 130 350 70 L 390 60 Q 420 130 460 140 Q 520 120 570 90 L 610 80 Q 640 130 680 140 T 760 150 L 760 0 L 0 0 Z"
              fill={isOfficer ? '#0B222D' : '#DDEAF0'}
              stroke={isOfficer ? '#1B4759' : '#ADC8D8'}
              strokeWidth="2"
            />

            <text
              x="80"
              y="70"
              fill={isOfficer ? '#93B9CC' : '#2D4454'}
              fontSize="12"
              fontFamily="serif"
              fontWeight="bold"
              letterSpacing="2"
            >
              WEST BENGAL MAINLAND
            </text>
            <text
              x="80"
              y="86"
              fill={isOfficer ? '#93B9CC' : '#476577'}
              fontSize="9"
              fontFamily="sans-serif"
            >
              Purba Medinipur Coastal Belt
            </text>

            <text
              x="330"
              y="45"
              fill="#007A78"
              fontSize="10"
              fontFamily="sans-serif"
              fontWeight="bold"
            >
              Hooghly River Mouth
            </text>

            {/* Sagar Island Landmass */}
            <path
              d="M 390 190 Q 410 160 430 180 Q 440 230 420 260 Q 400 250 390 190 Z"
              fill={isOfficer ? '#10303E' : '#CFE3ED'}
              stroke={isOfficer ? '#205166' : '#9EBECF'}
              strokeWidth="1.5"
            />
            <text x="392" y="215" fill={isOfficer ? '#93B9CC' : '#2D4454'} fontSize="8" fontWeight="bold">
              Sagar Isl.
            </text>

            {/* Marine Protected Area: Sundarbans & Lothian Buffer */}
            <path
              d="M 460 130 Q 530 140 600 120 L 670 140 L 760 140 L 760 290 Q 660 300 580 270 Q 520 240 460 210 Z"
              fill="url(#sanctuaryPattern)"
              stroke={isOfficer ? '#DC2626' : '#EF4444'}
              strokeWidth="1.5"
              strokeDasharray="6,4"
            />

            {/* Bathymetric Contours */}
            <path
              d="M 0 210 Q 140 200 240 190 Q 340 180 430 220 Q 520 200 660 190 T 760 200"
              fill="none"
              stroke={isOfficer ? '#0F3A4E' : '#C1DEED'}
              strokeWidth="1.2"
              strokeDasharray="2,2"
            />
            <text x="25" y="206" fill={isOfficer ? '#8DB4C7' : '#476577'} fontSize="8" fontFamily="monospace">
              10m depth
            </text>

            <path
              d="M 0 290 Q 150 270 260 260 Q 370 260 480 300 Q 590 280 760 270"
              fill="none"
              stroke={isOfficer ? '#0F3A4E' : '#B0D3E5'}
              strokeWidth="1.2"
              strokeDasharray="2,2"
            />
            <text x="25" y="286" fill={isOfficer ? '#8DB4C7' : '#476577'} fontSize="8" fontFamily="monospace">
              20m depth
            </text>

            <path
              d="M 0 370 Q 200 350 400 360 Q 600 360 760 350"
              fill="none"
              stroke={isOfficer ? '#0C3042' : '#9EC6DB'}
              strokeWidth="1.2"
              strokeDasharray="2,2"
            />
            <text x="25" y="366" fill={isOfficer ? '#8DB4C7' : '#476577'} fontSize="8" fontFamily="monospace">
              30m depth
            </text>

            {/* IMBL Boundary */}
            <line
              x1="710"
              y1="20"
              x2="745"
              y2="420"
              stroke="#DC2626"
              strokeWidth="2.5"
              strokeDasharray="8,4"
            />
            <circle cx="710" cy="20" r="4" fill="#DC2626" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="745" cy="420" r="4" fill="#DC2626" stroke="#FFFFFF" strokeWidth="1.5" />

            {/* Live AIS Vessels in SVG Chart */}
            {showLiveAis &&
              liveVessels.map((v) => {
                const minLat = 21.0,
                  maxLat = 22.0
                const minLng = 87.3,
                  maxLng = 88.6
                const nx = (v.lng - minLng) / (maxLng - minLng)
                const ny = 1.0 - (v.lat - minLat) / (maxLat - minLat)
                const px = Math.max(20, Math.min(740, nx * 760))
                const py = Math.max(20, Math.min(400, ny * 420))

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

                return (
                  <g key={v.mmsi} className="cursor-pointer group">
                    <circle cx={px} cy={py} r="4.5" fill={dotColor} stroke="#FFFFFF" strokeWidth="1" />
                    <rect
                      x={px + 6}
                      y={py - 10}
                      width={Math.min(v.name.length * 5.5 + 8, 90)}
                      height="13"
                      rx="2"
                      fill="rgba(6, 18, 30, 0.85)"
                    />
                    <text x={px + 9} y={py - 1} fill="#F1F5F9" fontSize="7.5" fontFamily="sans-serif">
                      {v.name.length > 12 ? v.name.slice(0, 11) + '…' : v.name}
                    </text>
                  </g>
                )
              })}

            {/* Sector Pins on SVG */}
            {MAP_SECTORS.map((sector) => {
              const isSelected = selectedId === sector.id
              const status = getSectorStatus(sector.id)

              return (
                <g
                  key={sector.id}
                  transform={`translate(${sector.x}, ${sector.y})`}
                  onClick={() => onSelect(sector.id)}
                  className="cursor-pointer group"
                >
                  <circle r="36" fill="transparent" />
                  {(isSelected || status.status === 'violation') && (
                    <circle
                      r="24"
                      fill="none"
                      stroke={status.fill}
                      strokeWidth="1.5"
                      opacity="0.6"
                      className="animate-ping"
                    />
                  )}
                  {isSelected && (
                    <g stroke={status.fill} strokeWidth="1.2">
                      <circle r="18" fill="none" strokeDasharray="3,3" />
                      <line x1="-22" y1="0" x2="-14" y2="0" />
                      <line x1="14" y1="0" x2="22" y2="0" />
                      <line x1="0" y1="-22" x2="0" y2="-14" />
                      <line x1="0" y1="14" x2="0" y2="22" />
                    </g>
                  )}
                  <circle
                    r={isSelected ? '10' : '8'}
                    fill={status.fill}
                    stroke={isSelected ? '#FFFFFF' : isOfficer ? '#061B24' : '#FFFFFF'}
                    strokeWidth="2.5"
                    className="transition-transform group-hover:scale-125"
                  />
                  <text
                    x="0"
                    y="20"
                    textAnchor="middle"
                    fill={isOfficer ? '#7FB5C9' : '#335061'}
                    fontSize="8"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {sector.depth}m
                  </text>
                  <g transform="translate(0, -18)">
                    <rect
                      x="-42"
                      y="-12"
                      width="84"
                      height="18"
                      rx="3"
                      fill={
                        isSelected
                          ? '#0A1B27'
                          : isOfficer
                          ? 'rgba(6, 27, 36, 0.9)'
                          : 'rgba(255, 255, 255, 0.95)'
                      }
                      stroke={isSelected ? status.fill : isOfficer ? '#204E60' : '#CCE4EC'}
                      strokeWidth={isSelected ? '1.5' : '1'}
                      className="shadow-sm"
                    />
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      fill={isSelected ? '#FFFFFF' : isOfficer ? '#E2F0F5' : '#0A1B27'}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="serif"
                    >
                      {sector.name}
                    </text>
                  </g>
                </g>
              )
            })}
          </svg>

          {/* Floating Chart Legend */}
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm border border-slate-300 p-2.5 rounded-lg text-[11px] shadow-sm flex flex-col gap-1.5 font-sans">
            <div className="font-serif font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between gap-3">
              <span>Chart Legend</span>
              <span className="font-mono text-[9px] text-[#007A78] font-bold">IN-351</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span className="text-slate-700 font-medium">Open / Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span className="text-slate-700 font-medium">Seasonal Ban</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span className="text-slate-700 font-medium">Squall Hazard</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-700 font-medium">Sanctuary Buffer</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Officer Patrol Direct Action Strip */}
      {isOfficer && (
        <div className="p-3 bg-[#0A1B27] text-white border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Crosshair size={14} className="text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="font-mono text-slate-300">
              Selected Sector:{' '}
              <strong className="text-white font-bold">
                {selectedSector.name} ({selectedSector.code})
              </strong>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-mono">
              Status: {getSectorStatus(selectedSector.id).label}
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Click any sector pin on OpenStreetMap to inspect compliance telemetry &amp; gazette rules
          </div>
        </div>
      )}
    </div>
  )
}
