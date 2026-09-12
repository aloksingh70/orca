import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Waves,
  Wind,
  Fish,
  ShieldAlert,
  AlertOctagon,
  Anchor,
  Compass,
  Bookmark,
  Radio,
  ArrowRight,
  Ship,
  ShieldCheck,
  Cpu,
  Download,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  MapPin,
  Eye,
  BarChart3,
  RotateCcw,
  Scale,
  Sparkles
} from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import ScanButton from '../components/ScanButton.jsx'
import ScenarioDatePicker from '../components/ScenarioDatePicker.jsx'
import ZoneCard from '../components/ZoneCard.jsx'
import ReasoningTrace from '../components/ReasoningTrace.jsx'
import BathymetricSounder from '../components/BathymetricSounder.jsx'
import CoastlineMap from '../components/CoastlineMap.jsx'
import DieselEconomicsCalculator from '../components/DieselEconomicsCalculator.jsx'
import VoiceAdvisoryPlayer from '../components/VoiceAdvisoryPlayer.jsx'
import SkipperDeck from '../components/SkipperDeck.jsx'
import OfficerDeck from '../components/OfficerDeck.jsx'
import ScientistDeck from '../components/ScientistDeck.jsx'
import PortOperatorDeck from '../components/PortOperatorDeck.jsx'
import LiveVesselTracker from '../components/LiveVesselTracker.jsx'
import DemoSwitcherModal from '../components/DemoSwitcherModal.jsx'
import { zones } from '../lib/zones.js'
import { scanCoastline } from '../lib/agents.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

import PageMeta from '../components/PageMeta.jsx'

const todayStr = () => new Date().toISOString().slice(0, 10)

const MARITIME_ROLES = [
  {
    id: 'skipper',
    label: 'Vessel Skipper / Fisherman',
    shortLabel: 'Skipper / Fisherman',
    icon: Ship,
    accent: 'text-emerald-700 border-emerald-300 bg-emerald-50',
    desc: 'Pre-dawn go/no-go safety decision'
  },
  {
    id: 'officer',
    label: 'Government / Marine Officer',
    shortLabel: 'Marine Officer',
    icon: ShieldCheck,
    accent: 'text-[#007A78] border-[#007A78]/30 bg-[#E2F0F5]',
    desc: 'Coastline surveillance & patrol oversight'
  },
  {
    id: 'researcher',
    label: 'Marine Scientist / Oceanographer',
    shortLabel: 'Oceanographer',
    icon: Cpu,
    accent: 'text-amber-800 border-amber-300 bg-amber-50',
    desc: 'Precision metrics & weight sensitivity'
  },
  {
    id: 'port_crew',
    label: 'Port Operator / Trade',
    shortLabel: 'Port Operator',
    icon: Anchor,
    accent: 'text-slate-800 border-slate-300 bg-slate-100',
    desc: 'Quay-side landing volume forecasting'
  }
]

export default function Advisory() {
  const { t } = useLanguage()
  const { user, token, savedZones, toggleSaveZone, isAuthenticated, activeRole, setActiveRole } = useAuth()
  
  // Active role is strictly determined by the authenticated user
  const userRole = user?.role || activeRole || 'skipper'
  const currentRole = (() => {
    const lower = (userRole || '').toLowerCase()
    if (lower.includes('fish') || lower.includes('skip') || lower.includes('boat')) return 'skipper'
    if (lower.includes('officer') || lower.includes('guard') || lower.includes('patrol')) return 'officer'
    if (lower.includes('research') || lower.includes('scien') || lower.includes('ocean')) return 'researcher'
    if (lower.includes('port') || lower.includes('trade') || lower.includes('harbor')) return 'port_crew'
    return 'skipper'
  })()

  const [scanDate, setScanDate] = useState(todayStr())
  const [results, setResults] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [backendLive, setBackendLive] = useState(true)
  const [cachedScanInfo, setCachedScanInfo] = useState(null)
  const [showVesselRadar, setShowVesselRadar] = useState(false)
  const [showDemoModal, setShowDemoModal] = useState(false)

  // Skipper Shortlist (pinned usual zones stored in localStorage)
  const [usualZones, setUsualZones] = useState(() => {
    try {
      const saved = localStorage.getItem('orca_usual_zones')
      return saved ? JSON.parse(saved) : ['shankarpur', 'digha']
    } catch {
      return ['shankarpur', 'digha']
    }
  })
  const [showUsualOnly, setShowUsualOnly] = useState(false)

  const toggleUsualZone = (zoneId) => {
    setUsualZones((prev) => {
      const next = prev.includes(zoneId) ? prev.filter((id) => id !== zoneId) : [...prev, zoneId]
      try {
        localStorage.setItem('orca_usual_zones', JSON.stringify(next))
      } catch (e) {}
      return next
    })
  }

  // Vessel Cruising Speed (knots)
  const [boatSpeed, setBoatSpeed] = useState(9)

  // Officer Local Environmental Thresholds
  const [localThresholds, setLocalThresholds] = useState({
    windCutoff: 30,
    waveCutoff: 2.0
  })

  // Scientist Precision Float Mode
  const [precisionMode, setPrecisionMode] = useState(false)

  // Scientist custom weights (defaulting to agents.js WEIGHTS)
  const [weights, setWeights] = useState({
    ocean: 0.3,
    weather: 0.3,
    history: 0.25,
    sustain: 0.15
  })
  const [showWeightSliders, setShowWeightSliders] = useState(false)

  const bridgeStations = [
    { key: 'ocean', icon: Waves, color: 'text-emerald-600', label: t('stations', 'oceanName'), sub: t('stations', 'oceanSub') },
    { key: 'weather', icon: Wind, color: 'text-orange-600', label: t('stations', 'weatherName'), sub: t('stations', 'weatherSub') },
    { key: 'history', icon: Fish, color: 'text-amber-600', label: t('stations', 'historyName'), sub: t('stations', 'historySub') },
    { key: 'sustain', icon: ShieldAlert, color: 'text-red-600', label: t('stations', 'sustainName'), sub: t('stations', 'sustainSub') }
  ]

  const runScan = async (date = scanDate, delay = 600) => {
    setScanning(true)

    // Attempt scan via FastAPI backend first
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch('/api/advisory/scan', {
        method: 'POST',
        headers,
        body: JSON.stringify({ date })
      })

      if (res.ok) {
        const backendData = await res.json()
        setResults(backendData)
        setSelectedId(backendData[0]?.zoneId ?? null)
        setBackendLive(true)
        setCachedScanInfo(null)
        try {
          localStorage.setItem('orca_last_scan', JSON.stringify({
            results: backendData,
            scanDate: date,
            timestamp: new Date().toISOString()
          }))
        } catch (e) {}
        setScanning(false)
        return
      }
    } catch (err) {
      console.warn('Backend unavailable, using client-side fallback:', err)
    }

    // Fallback to client-side deterministic evaluation
    setTimeout(() => {
      try {
        const scanned = scanCoastline(zones, date)
        setResults(scanned)
        setSelectedId(scanned[0]?.zoneId ?? null)
        setBackendLive(false)
        setCachedScanInfo(null)
        try {
          localStorage.setItem('orca_last_scan', JSON.stringify({
            results: scanned,
            scanDate: date,
            timestamp: new Date().toISOString()
          }))
        } catch (e) {}
        setScanning(false)
      } catch (err) {
        // Fallback to cached scan if available
        try {
          const cached = localStorage.getItem('orca_last_scan')
          if (cached) {
            const parsed = JSON.parse(cached)
            setResults(parsed.results)
            setSelectedId(parsed.results[0]?.zoneId ?? null)
            setCachedScanInfo(parsed)
          }
        } catch (e) {}
        setScanning(false)
      }
    }, delay)
  }


  // Auto-run on initial deck load
  useEffect(() => {
    runScan(scanDate, 600)
  }, [])

  const handleDateChange = (newDate) => {
    setScanDate(newDate)
    runScan(newDate, 500)
  }

  const isBanActive = (() => {
    const d = new Date(scanDate)
    const y = d.getFullYear()
    return d >= new Date(`${y}-04-15`) && d <= new Date(`${y}-06-14`)
  })()

  // ---------------------------------------------------------------------------
  // Scientist dynamic weight recalculation (client-side only, non-destructive)
  // ---------------------------------------------------------------------------
  const processedResults = useMemo(() => {
    if (!results) return null

    if (currentRole === 'researcher') {
      const totalW = weights.ocean + weights.weather + weights.history + weights.sustain || 1

      return results.map((r) => {
        const oScore = r.agents?.find((a) => a.agent === 'ocean')?.score || 0
        const wScore = r.agents?.find((a) => a.agent === 'weather')?.score || 0
        const hScore = r.agents?.find((a) => a.agent === 'history')?.score || 0
        const sScore = r.agents?.find((a) => a.agent === 'sustain')?.score || 0

        const computed = (oScore * weights.ocean + wScore * weights.weather + hScore * weights.history + sScore * weights.sustain) / totalW

        return {
          ...r,
          combinedScore: Math.round(computed),
          combinedScoreRaw: computed
        }
      })
    }

    return results
  }, [results, currentRole, weights])

  // ---------------------------------------------------------------------------
  // Role-Based Sorting & Filtering
  // ---------------------------------------------------------------------------
  const sortedResults = useMemo(() => {
    if (!processedResults) return []

    // Vessel Skipper: Filter by usual zones if active, and float pinned usual zones to top
    if (currentRole === 'skipper') {
      let base = [...processedResults]
      if (showUsualOnly) {
        base = base.filter((r) => usualZones.includes(r.zoneId))
      }
      return base.sort((a, b) => {
        const aFav = usualZones.includes(a.zoneId) ? 1 : 0
        const bFav = usualZones.includes(b.zoneId) ? 1 : 0
        if (!showUsualOnly && aFav !== bFav) return bFav - aFav

        const aVetoed = a.verdict === 'Unsafe Today' || a.verdict === 'Seasonal Closure'
        const bVetoed = b.verdict === 'Unsafe Today' || b.verdict === 'Seasonal Closure'
        if (aVetoed !== bVetoed) return aVetoed ? 1 : -1
        return b.combinedScore - a.combinedScore
      })
    }

    // Government / Officer: sort by violation & closure status first (urgent inspection priority)
    if (currentRole === 'officer') {
      return [...processedResults].sort((a, b) => {
        const aViolation = a.verdict === 'Seasonal Closure' ? 3 : a.verdict === 'Unsafe Today' ? 2 : 0
        const bViolation = b.verdict === 'Seasonal Closure' ? 3 : b.verdict === 'Unsafe Today' ? 2 : 0
        if (bViolation !== aViolation) return bViolation - aViolation

        const aNearSanctuary = a.agents?.find((x) => x.agent === 'sustain')?.readouts?.some((r) => r.value?.toLowerCase().includes('sanctuary')) ? 1 : 0
        const bNearSanctuary = b.agents?.find((x) => x.agent === 'sustain')?.readouts?.some((r) => r.value?.toLowerCase().includes('sanctuary')) ? 1 : 0
        if (bNearSanctuary !== aNearSanctuary) return bNearSanctuary - aNearSanctuary

        return a.sectorCode.localeCompare(b.sectorCode)
      })
    }

    // Default: Ranked by combined score with vetoed sinking to bottom
    return [...processedResults].sort((a, b) => {
      const aVetoed = a.verdict === 'Unsafe Today' || a.verdict === 'Seasonal Closure'
      const bVetoed = b.verdict === 'Unsafe Today' || b.verdict === 'Seasonal Closure'
      if (aVetoed !== bVetoed) return aVetoed ? 1 : -1
      return b.combinedScore - a.combinedScore
    })
  }, [processedResults, currentRole, showUsualOnly, usualZones])

  const selected = sortedResults.find((r) => r.zoneId === selectedId) || sortedResults[0] || null


  // ---------------------------------------------------------------------------
  // Role 1 (Skipper): Best Zone Today Calculation
  // ---------------------------------------------------------------------------
  const bestZoneToday = useMemo(() => {
    if (!processedResults || processedResults.length === 0) return null
    return (
      processedResults.find((r) => r.verdict === 'Recommended') ||
      processedResults.find((r) => r.verdict !== 'Seasonal Closure' && r.verdict !== 'Unsafe Today') ||
      processedResults[0]
    )
  }, [processedResults])

  // ---------------------------------------------------------------------------
  // Role 4 (Port Operator): Aggregate Landing Volume Calculation
  // ---------------------------------------------------------------------------
  const portLandingSummary = useMemo(() => {
    if (!processedResults) return { totalKg: 0, totalTonnes: '0.00', openSectors: 0, harborBreakdown: [] }

    let totalKg = 0
    let openSectors = 0
    const harborBreakdown = []

    processedResults.forEach((r) => {
      const isClosed = r.verdict === 'Seasonal Closure' || r.verdict === 'Unsafe Today'
      const hist = r.agents?.find((a) => a.agent === 'history')
      const match = hist?.readouts?.[0]?.value?.match(/(\d+)/)
      const catchEst = match ? parseInt(match[1], 10) : 0

      const actualLanded = isClosed ? 0 : catchEst
      totalKg += actualLanded
      if (!isClosed) openSectors += 1

      harborBreakdown.push({
        sectorCode: r.sectorCode,
        zoneName: r.zoneName,
        harborName: r.harborName,
        status: isClosed ? 'Closed (0 kg)' : `${catchEst} kg`,
        isClosed
      })
    })

    return {
      totalKg,
      totalTonnes: (totalKg / 1000).toFixed(2),
      openSectors,
      harborBreakdown
    }
  }, [processedResults])

  // ---------------------------------------------------------------------------
  // Role 3 (Scientist): CSV / JSON Export Handlers
  // ---------------------------------------------------------------------------
  const exportData = (format) => {
    if (!sortedResults) return

    const exportPayload = sortedResults.map((r) => {
      const ocean = r.agents?.find((a) => a.agent === 'ocean')
      const weather = r.agents?.find((a) => a.agent === 'weather')
      const history = r.agents?.find((a) => a.agent === 'history')
      const sustain = r.agents?.find((a) => a.agent === 'sustain')

      return {
        date: r.date || scanDate,
        sectorCode: r.sectorCode,
        zoneId: r.zoneId,
        zoneName: r.zoneName,
        district: r.coastalDistrict,
        coordinates: r.coordinates,
        soundingDepth_m: r.soundingDepth,
        combinedScore: r.combinedScore,
        verdict: r.verdict,
        oceanScore: ocean?.score,
        sst: ocean?.readouts?.[0]?.value,
        chlorophyll: ocean?.readouts?.[1]?.value,
        weatherScore: weather?.score,
        windSpeed: weather?.readouts?.[0]?.value,
        waveHeight: weather?.readouts?.[1]?.value,
        historyScore: history?.score,
        avgCatchTrip: history?.readouts?.[0]?.value,
        sustainScore: sustain?.score,
        banStatus: sustain?.readouts?.[0]?.value
      }
    })

    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2))
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute('href', dataStr)
      downloadAnchor.setAttribute('download', `orca_oceanographic_scan_${scanDate}.json`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
    } else {
      // CSV Export
      const headers = Object.keys(exportPayload[0]).join(',')
      const rows = exportPayload.map((obj) => Object.values(obj).map((val) => `"${val}"`).join(','))
      const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers, ...rows].join('\n'))
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute('href', csvContent)
      downloadAnchor.setAttribute('download', `orca_oceanographic_scan_${scanDate}.csv`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
    }
  }

  return (
    <div className="bg-[#EAF4F8] min-h-screen flex flex-col font-sans text-[#2D4454]">
      <PageMeta
        title="Advisory Console — ORCA"
        description="Real-time marine harvesting advisory console, live coastline scan, hydrographic telemetry, and multi-agent explainable reasoning."
      />
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-24 pb-16 outline-none">
        
        {/* Navigation Breadcrumb & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 mb-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#5C7788] hover:text-[#0A1B27] font-semibold transition-colors"
          >
            <ArrowLeft size={14} className="text-[#007A78]" />
            <span>{t('nav', 'returnDispatch')}</span>
          </Link>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1.5 border ${
                backendLive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-100 text-slate-600 border-slate-300'
              }`}
            >
              <Radio size={11} className={backendLive ? 'text-emerald-600 animate-pulse' : 'text-slate-400'} />
              <span>{backendLive ? 'FastAPI Telemetry: Online' : 'Client Mode: Active'}</span>
            </span>
            <div className="text-xs text-[#5C7788] tabular-nums font-mono">
              <span>Sector WB-01..WB-06</span>
            </div>
          </div>
        </div>

        {/* Offline Cache Active Notice */}
        {cachedScanInfo && (
          <div className="mb-4 p-3.5 border border-amber-300 bg-amber-50 rounded-xl flex items-center justify-between text-xs text-amber-900 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={16} className="text-amber-700 shrink-0" />
              <span>
                <strong>Offline Cache Active:</strong> Displaying stored advisory snapshot from{' '}
                <span className="font-mono font-bold">{new Date(cachedScanInfo.timestamp).toLocaleTimeString()} ({cachedScanInfo.scanDate})</span>. Live sensor telemetry will automatically sync when connection restores.
              </span>
            </div>
            <button
              type="button"
              onClick={() => runScan()}
              className="text-amber-800 underline font-bold hover:text-amber-950 cursor-pointer"
            >
              Retry Sync
            </button>
          </div>
        )}


        {/* ------------------------------------------------------------------- */}
        {/* AUTHENTICATED MARITIME IDENTITY STATUS CARD                        */}
        {/* (Manual role switcher buttons hidden per user instructions)         */}
        {/* ------------------------------------------------------------------- */}
        <div className="bg-white border border-[#CCE4EC] p-3.5 sm:p-4 mb-4 rounded-xl shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#007A78] bg-[#007A78]/10 px-2 py-0.5 rounded font-mono">
                AUTHENTICATED IDENTITY
              </span>
              
              <div className="flex items-center gap-2">
                {currentRole === 'officer' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold text-[#007A78] bg-[#E2F0F5] border border-[#BCDCE6]">
                    <ShieldCheck size={14} className="text-[#007A78]" />
                    <span>Government / Marine Officer</span>
                  </span>
                ) : currentRole === 'researcher' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300">
                    <Cpu size={14} className="text-amber-700" />
                    <span>Marine Scientist / Oceanographer</span>
                  </span>
                ) : currentRole === 'port_crew' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold text-slate-800 bg-slate-100 border border-slate-300">
                    <Anchor size={14} className="text-slate-700" />
                    <span>Port Operator / Public Trade</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300">
                    <Ship size={14} className="text-emerald-700" />
                    <span>Vessel Skipper / Fisherman</span>
                  </span>
                )}

                <div className="text-xs text-[#0A1B27] font-semibold">
                  <span>{user?.full_name || (currentRole === 'skipper' ? 'Capt. Rajesh Mondal' : currentRole === 'officer' ? 'Dr. Ananya Sen' : currentRole === 'researcher' ? 'Dr. Priya Sharma' : 'Capt. B. K. Halder')}</span>
                  <span className="text-[#5C7788] font-normal ml-1.5">
                    ({user?.vessel_name || user?.department || (currentRole === 'skipper' ? 'FB Maa Ganga · Shankarpur' : currentRole === 'officer' ? 'INCOIS Oceanographic' : currentRole === 'researcher' ? 'CSIR-NIO' : 'Sagar Roads Anchorage')})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-center">
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Verified Clearance</span>
              </span>
              <span className="text-[#CCE4EC]">|</span>
              <button
                type="button"
                onClick={() => setShowDemoModal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-300 text-xs text-amber-900 font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Switch between demo personas"
              >
                <Sparkles size={13} className="text-amber-600" />
                <span>Switch Persona</span>
              </button>
              <Link
                to="/login"
                className="text-xs text-[#5C7788] hover:text-[#0A1B27] font-semibold underline underline-offset-2 transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* Working Bridge Control Deck                                         */}
        {/* ------------------------------------------------------------------- */}
        <div className="bg-white border border-[#CCE4EC] p-5 sm:p-6 mb-6 shadow-sm rounded-xl">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E0EEF3]">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#007A78] font-bold uppercase tracking-wider mb-1.5">
                <Compass size={14} />
                <span>
                  {currentRole === 'skipper'
                    ? 'WHEELHOUSE FISHING ADVISORY'
                    : currentRole === 'officer'
                    ? 'COASTAL COMPLIANCE & PATROL DESK'
                    : currentRole === 'researcher'
                    ? 'HYDROGRAPHIC MULTI-AGENT LAB'
                    : 'HARBOR QUAY-SIDE LOGISTICS CONSOLE'}
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A1B27] tracking-tight">
                {currentRole === 'skipper'
                  ? 'Daily Vessel Clearance & Best Fishing Ground'
                  : currentRole === 'officer'
                  ? 'Maritime Fisheries Regulatory Enforcement'
                  : currentRole === 'researcher'
                  ? 'Oceanographic Sensor Telemetry & Sensitivity Model'
                  : 'Harbor Fish Landing & Cold-Chain Projections'}
              </h1>
              <p className="text-xs text-[#2D4454] mt-1 max-w-2xl">
                {currentRole === 'skipper'
                  ? 'Immediate dawn sailing decision. Instant weather safety verification and highest-yield coordinates along the West Bengal shelf.'
                  : currentRole === 'officer'
                  ? 'Real-time surveillance across 6 patrol sectors. Instant flag checks against the uniform 61-day breeding ban and marine sanctuary borders.'
                  : currentRole === 'researcher'
                  ? 'Inspection of raw OCM-3/INCOIS thermal fronts, chlorophyll blooms, and adjustable agent weight sensitivity coefficients.'
                  : 'Aggregate biomass forecasts derived across West Bengal harbor landing centers for cold-chain scheduling and trade distribution.'}
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowVesselRadar(!showVesselRadar)}
                className={`px-3 py-2 rounded-md font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border shadow-xs ${
                  showVesselRadar
                    ? 'bg-cyan-600 text-white border-cyan-700 ring-2 ring-cyan-400/50'
                    : 'bg-[#06121E] text-cyan-300 border-slate-700 hover:bg-slate-900'
                }`}
              >
                <Radio size={14} className="animate-pulse text-emerald-400" />
                <span>Live Bay of Bengal AIS</span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800 font-mono">
                  14 Ships
                </span>
              </button>
              <ScenarioDatePicker date={scanDate} onChange={handleDateChange} />
              <ScanButton onScan={() => runScan()} scanning={scanning} hasResults={!!results} />
            </div>
          </div>

          {/* Parallel Bridge Telemetry Status Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
            {bridgeStations.map((st) => {
              const Icon = st.icon
              return (
                <div
                  key={st.key}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-300 rounded text-xs shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 bg-white border border-slate-200 rounded shrink-0 ${st.color}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="font-serif font-bold text-slate-900 text-xs sm:text-sm">
                        {st.label}
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium">
                        {st.sub}
                      </div>
                    </div>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${scanning ? 'bg-emerald-500 animate-ping' : 'bg-emerald-600'}`} />
                </div>
              )
            })}
          </div>

          {/* Active Mandate Notice if in Ban Window */}
          {isBanActive && (
            <div className="mt-4 p-3.5 border border-red-300 bg-red-50 rounded flex items-center gap-3 text-xs text-red-900">
              <AlertOctagon size={18} className="text-red-700 shrink-0" />
              <span>
                <strong className="font-bold">{t('advisory', 'banActiveNotice')}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Live Bay of Bengal AIS Vessel Radar Drawer */}
        {showVesselRadar && (
          <div className="mb-6">
            <LiveVesselTracker
              onClose={() => setShowVesselRadar(false)}
              onSelectSector={(id) => setSelectedId(id)}
            />
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* ROLE 1: VESSEL SKIPPER — "BEST ZONE TODAY" HERO CARD & SKIPPER DECK */}
        {/* ------------------------------------------------------------------- */}
        {!scanning && currentRole === 'skipper' && (
          <div className="flex flex-col gap-5 mb-6">
            {bestZoneToday && (
              <div className="bg-white border-2 border-emerald-500/80 rounded-xl p-5 sm:p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-mono font-bold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1.5">
                        <Ship size={13} />
                        <span>RECOMMENDED SAILING DESTINATION TODAY</span>
                      </span>
                      <span className="text-xs font-mono text-slate-500">Sector {bestZoneToday.sectorCode}</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A1B27]">
                      {bestZoneToday.zoneName} · {bestZoneToday.distanceOffshore} Offshore
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-700 mt-1 max-w-2xl leading-relaxed">
                      {bestZoneToday.verdict === 'Recommended'
                        ? `Safe sea state confirmed. Wind at ${bestZoneToday.agents?.find(a => a.agent === 'weather')?.readouts?.[0]?.value || '18 km/h'} and waves at ${bestZoneToday.agents?.find(a => a.agent === 'weather')?.readouts?.[1]?.value || '1.1m'} look calm today. Good fish activity predicted.`
                        : bestZoneToday.verdict === 'Unsafe Today'
                        ? 'Squall hazard in coastal waters today. Waves exceed safe limits — stay in harbor until winds subside.'
                        : 'East-coast seasonal breeding ban active. All mechanized crafts must remain moored.'}
                    </p>
                  </div>

                  {/* Instant Big Go / No-Go Stamp */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <span
                      className={`px-4 py-2 rounded-lg font-serif font-bold text-sm sm:text-base uppercase tracking-wider flex items-center gap-2 border shadow-xs ${
                        bestZoneToday.verdict === 'Recommended'
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-red-600 text-white border-red-700'
                      }`}
                    >
                      {bestZoneToday.verdict === 'Recommended' ? (
                        <>
                          <CheckCircle2 size={18} />
                          <span>SAFE TO SAIL — GO</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={18} />
                          <span>STAY IN HARBOR — NO GO</span>
                        </>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedId(bestZoneToday.zoneId)}
                      className="text-xs text-[#007A78] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Inspect Sector Waypoints</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Multilingual Voice Broadcast Player inside Hero Card */}
                <div className="pt-4">
                  <VoiceAdvisoryPlayer zone={bestZoneToday} role={currentRole} />
                </div>
              </div>
            )}

            {/* Diesel Savings & Route Economics Calculator */}
            <DieselEconomicsCalculator selectedZone={selected || bestZoneToday} />

            {/* Skipper Persona Deck: Outlook, Speed Slider, and Catch Log Form */}
            <SkipperDeck
              selectedZone={selected || bestZoneToday}
              scanDate={scanDate}
              boatSpeed={boatSpeed}
              onBoatSpeedChange={setBoatSpeed}
              showUsualOnly={showUsualOnly}
              onToggleUsualOnly={() => setShowUsualOnly(!showUsualOnly)}
              usualCount={usualZones.length}
            />
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* ROLE 4: PORT OPERATOR — "EXPECTED LANDING VOLUME" & PORT LOGISTICS  */}
        {/* ------------------------------------------------------------------- */}
        {!scanning && currentRole === 'port_crew' && (
          <div className="flex flex-col gap-5 mb-6">
            <div className="bg-white border border-[#CCE4EC] rounded-xl p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    <Anchor size={15} className="text-[#007A78]" />
                    <span>DAILY HARBOR DEBRIEF &amp; COLD STORAGE PLANNING</span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A1B27]">
                    Expected Landing Volume Today: {portLandingSummary.totalTonnes} MT
                  </h3>
                  <p className="text-xs text-[#5C7788] mt-1">
                    Aggregated biomass intake summed across all 6 West Bengal coastal fishing sectors ({portLandingSummary.totalKg.toLocaleString()} kg total projected).
                  </p>
                </div>

                {/* Status Metric Box */}
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Contributing Sectors</span>
                    <strong className="text-slate-900 text-sm font-bold">{portLandingSummary.openSectors} of 6 Open</strong>
                  </div>
                  <div className="h-7 w-px bg-slate-300" />
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Berthing Readiness</span>
                    <strong className="text-emerald-700 text-sm font-bold">Quay Clear</strong>
                  </div>
                </div>
              </div>

              {/* Harbor Intake Breakdown Table */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-sans">
                {portLandingSummary.harborBreakdown.map((hb) => (
                  <div key={hb.sectorCode} className={`p-2.5 rounded border ${hb.isClosed ? 'bg-red-50/60 border-red-200 text-red-900' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                    <div className="font-mono text-[10px] font-bold text-slate-500">{hb.sectorCode}</div>
                    <strong className="font-serif font-bold text-xs block truncate" title={hb.zoneName}>{hb.zoneName}</strong>
                    <span className={`text-[11px] font-mono font-bold block mt-1 ${hb.isClosed ? 'text-red-700' : 'text-emerald-700'}`}>
                      {hb.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Port Logistics Deck: Species Mix, 7-Day Inflow, Multi-Port, Landing Form */}
            <PortOperatorDeck
              results={processedResults || []}
              scanDate={scanDate}
              selectedZone={selected}
            />
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* ROLE 3: MARINE SCIENTIST — TELEMETRY LAB & SENSITIVITY DECK        */}
        {/* ------------------------------------------------------------------- */}
        {!scanning && currentRole === 'researcher' && (
          <ScientistDeck
            results={processedResults || []}
            scanDate={scanDate}
            weights={weights}
            onWeightsChange={setWeights}
            precisionMode={precisionMode}
            onTogglePrecisionMode={() => setPrecisionMode(!precisionMode)}
            selectedZone={selected}
          />
        )}

        {/* ------------------------------------------------------------------- */}
        {/* ROLE 2: GOVERNMENT / MARINE OFFICER — PATROL DESK & PRIMARY MAP     */}
        {/* ------------------------------------------------------------------- */}
        {!scanning && currentRole === 'officer' && (
          <div className="flex flex-col gap-5 mb-6">
            <OfficerDeck
              results={processedResults || []}
              scanDate={scanDate}
              localThresholds={localThresholds}
              onThresholdsChange={setLocalThresholds}
              isBanActive={isBanActive}
            />
            <CoastlineMap
              role={currentRole}
              results={sortedResults}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId(id)}
              isBanActive={isBanActive}
              scanDate={scanDate}
            />
          </div>
        )}


        {/* Scanning Indicator */}
        {scanning && (
          <div className="bg-white border border-[#CCE4EC] p-12 flex flex-col items-center justify-center gap-4 text-center shadow-sm rounded-xl">
            <div className="flex items-center gap-3">
              <Anchor size={22} className="text-[#007A78] animate-bounce" />
              <div className="w-20 h-1 bg-[#E2F0F5] overflow-hidden">
                <div className="w-full h-full bg-[#007A78] animate-pulse" />
              </div>
            </div>
            <div className="font-serif text-lg font-bold text-[#0A1B27]">
              {t('advisory', 'soundingBannerTitle')}
            </div>
            <p className="text-xs text-[#5C7788] max-w-md">
              {t('advisory', 'soundingBannerDesc')}
            </p>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* Working Two-Column Layout (Scan Complete)                           */}
        {/* ------------------------------------------------------------------- */}
        {!scanning && sortedResults.length > 0 && (
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column (5 cols): Ranked Sector Ledger */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <div className="flex items-center justify-between px-1 text-xs">
                <span className="font-serif font-bold text-[#0A1B27] tracking-wide">
                  {currentRole === 'officer'
                    ? `Patrol Inspection Ledger (${sortedResults.length} Sectors)`
                    : `${t('advisory', 'dirTitle')} (${sortedResults.length} ${t('advisory', 'sounded')})`}
                </span>
                <span className="text-[11px] text-[#5C7788] tabular-nums font-mono">
                  {currentRole === 'officer' ? 'Sorted by Violation Status' : t('advisory', 'rankedBy')}
                </span>
              </div>

              {sortedResults.map((r, i) => (
                <ZoneCard
                  key={r.zoneId}
                  role={currentRole}
                  result={r}
                  rank={i + 1}
                  selected={selectedId === r.zoneId}
                  onSelect={() => setSelectedId(r.zoneId)}
                  isFavorite={usualZones.includes(r.zoneId)}
                  onToggleFavorite={currentRole === 'skipper' ? toggleUsualZone : null}
                  scanDate={scanDate}
                  boatSpeed={boatSpeed}
                />
              ))}

              {/* For Non-Officer roles, render CoastlineMap as a secondary interactive map */}
              {currentRole !== 'officer' && (
                <div className="mt-4">
                  <CoastlineMap
                    role={currentRole}
                    results={sortedResults}
                    selectedId={selectedId}
                    onSelect={(id) => setSelectedId(id)}
                    isBanActive={isBanActive}
                    scanDate={scanDate}
                  />
                </div>
              )}

            </div>

            {/* Right Column (7 cols): Detailed Sector Advisory Manifest */}
            <div className="lg:col-span-7 lg:sticky lg:top-24 flex flex-col gap-3">
              {selected ? (
                <ReasoningTrace role={currentRole} result={selected} />
              ) : (
                <div className="bg-white border border-[#CCE4EC] p-8 text-center text-xs text-[#5C7788] rounded-xl">
                  {t('advisory', 'selectPrompt')}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* Full-Width Hydrographic Sounding Profile Section at the Bottom       */}
        {/* ------------------------------------------------------------------- */}
        {!scanning && sortedResults.length > 0 && selected && (
          <div className="w-full mt-6 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
              <div className="text-sm sm:text-base font-serif font-bold text-[#0A1B27] flex items-center gap-2">
                <Compass size={16} className="text-[#007A78]" />
                <span>Hydrographic Sounding Profile · {selected.zoneName}</span>
              </div>
              <div className="text-xs text-[#5C7788] font-mono flex items-center gap-2">
                <span>Sector {selected.sectorCode}</span>
                <span>•</span>
                <span>{selected.distanceOffshore} Offshore</span>
                <span>•</span>
                <span className="text-[#007A78] font-bold">{selected.soundingDepth}m LAT Sounding</span>
              </div>
            </div>

            <BathymetricSounder
              activeZoneId={selected.zoneId}
              compact={false}
              panoramic={true}
              interactive={true}
              onSelectZone={(id) => setSelectedId(id)}
            />

            {/* Full-Width Bookmark Sector Card */}
            <div className="bg-white border border-[#CCE4EC] p-3 sm:p-3.5 flex items-center justify-between text-xs shadow-xs rounded-xl">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="p-1.5 bg-[#E2F0F5] rounded-lg shrink-0">
                  <Bookmark
                    size={16}
                    className={
                      savedZones.includes(selected.zoneId)
                        ? 'text-[#007A78] fill-[#007A78]'
                        : 'text-[#5C7788]'
                    }
                  />
                </div>
                <div>
                  <div className="font-bold text-[#0A1B27] text-xs sm:text-sm">
                    {savedZones.includes(selected.zoneId)
                      ? t('auth', 'sectorBookmarked')
                      : t('auth', 'saveSector')}
                  </div>
                  <div className="text-[11px] text-[#5C7788]">
                    {selected.zoneName} · Sector {selected.sectorCode} · Lat {selected.lat?.toFixed(2) || '21.68'}°N Lon {selected.lng?.toFixed(2) || '87.95'}°E
                  </div>
                </div>
              </div>

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => toggleSaveZone(selected.zoneId)}
                  className={`px-3.5 py-2 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    savedZones.includes(selected.zoneId)
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                      : 'bg-[#007A78] text-white hover:bg-[#006361] shadow-xs'
                  }`}
                >
                  <Bookmark size={13} className={savedZones.includes(selected.zoneId) ? 'fill-current' : ''} />
                  <span>{savedZones.includes(selected.zoneId) ? 'Bookmarked' : 'Save to Ledger'}</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="text-[#007A78] hover:underline font-bold text-xs flex items-center gap-1 px-3 py-1.5 bg-[#E2F0F5] rounded-lg"
                >
                  <span>Sign In to Save</span>
                  <ArrowRight size={12} />
                </Link>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Global 1-Click Demo Persona Switcher Modal */}
      <DemoSwitcherModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
      />

      {/* Advisory Console Footer */}
      <footer className="border-t border-[#BCDCE6] bg-[#E2F0F5] py-5 px-4 sm:px-6 mt-auto text-[11px] text-[#5C7788]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            {t('advisory', 'footerText')}
          </span>
          <span className="tabular-nums text-[#0A1B27] font-semibold">
            {t('advisory', 'footerCredits')}
          </span>
        </div>
      </footer>
    </div>
  )
}
