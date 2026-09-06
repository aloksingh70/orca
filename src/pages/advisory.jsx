import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Waves, Wind, Fish, ShieldAlert, AlertOctagon, Anchor, Compass } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import ScanButton from '../components/ScanButton.jsx'
import ScenarioDatePicker from '../components/ScenarioDatePicker.jsx'
import ZoneCard from '../components/ZoneCard.jsx'
import ReasoningTrace from '../components/ReasoningTrace.jsx'
import { zones } from '../lib/zones.js'
import { scanCoastline } from '../lib/agents.js'

const todayStr = () => new Date().toISOString().slice(0, 10)

const BRIDGE_STATIONS = [
  { key: 'ocean', icon: Waves, color: 'text-emerald-400', label: 'Ocean Station (समुद्र)', sub: 'SST & Plankton Bloom' },
  { key: 'weather', icon: Wind, color: 'text-indian-saffron', label: 'Weather Station (मौसम)', sub: 'Wind & Squall Limits' },
  { key: 'history', icon: Fish, color: 'text-amber-400', label: 'Catch Ledger (इतिहास)', sub: 'CMFRI Landing Records' },
  { key: 'sustain', icon: ShieldAlert, color: 'text-red-400', label: 'Sustainability (संरक्षण)', sub: 'Mandatory Ban Guard' }
]

export default function Advisory() {
  const [scanDate, setScanDate] = useState(todayStr())
  const [scanning, setScanning] = useState(false)
  const [results, setResults] = useState(null)
  const [selectedId, setSelectedId] = useState(null)

  const runScan = (date = scanDate, delay = 900) => {
    setScanning(true)
    setTimeout(() => {
      const scanned = scanCoastline(zones, date)
      setResults(scanned)
      setSelectedId(scanned[0]?.zoneId ?? null)
      setScanning(false)
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

  const selected = results?.find((r) => r.zoneId === selectedId) ?? null

  const isBanActive = (() => {
    const d = new Date(scanDate)
    const y = d.getFullYear()
    return d >= new Date(`${y}-04-15`) && d <= new Date(`${y}-06-14`)
  })()

  return (
    <div className="bg-[#EAF4F8] min-h-screen flex flex-col font-sans text-[#2D4454]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-24 pb-16">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 py-3 mb-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#5C7788] hover:text-[#0A1B27] font-semibold transition-colors"
          >
            <ArrowLeft size={14} className="text-[#007A78]" />
            <span>Return to Coastal Dispatch</span>
          </Link>
          <div className="text-xs text-[#5C7788] tabular-nums hidden sm:block font-mono">
            <span>COASTAL SECTOR: NORTHERN BAY OF BENGAL · CONTINENTAL SHELF</span>
          </div>
        </div>

        {/* Working Bridge Control Deck */}
        <div className="bg-white border border-[#CCE4EC] p-5 sm:p-6 mb-6 shadow-sm">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E0EEF3]">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#007A78] font-bold uppercase tracking-wider mb-1.5">
                <Compass size={14} />
                <span>STATION: SAGAR ROADS ANCHORAGE · 21°39'N, 88°02'E • SAGAR MITRA BRIDGE</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A1B27] tracking-tight">
                ORCA Fleet Advisory Deck
              </h1>
              <p className="text-xs text-[#2D4454] mt-1 max-w-2xl">
                Simultaneous multi-agent evaluation across 6 West Bengal coastal fishing sectors calibrated for small crafts, mechanized gillnetters, and motorized nauskas.
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <ScenarioDatePicker date={scanDate} onChange={handleDateChange} />
              <ScanButton onScan={() => runScan()} scanning={scanning} hasResults={!!results} />
            </div>
          </div>

          {/* Parallel Bridge Telemetry Status Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
            {BRIDGE_STATIONS.map((st) => {
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
                <strong className="font-bold">Mandatory Seasonal Fishing Ban Active:</strong> Mechanized harvesting along the East Coast is legally closed under the Marine Fisheries Regulation Act from 15 April to 14 June (61 days). All continental shelf sectors are locked out regardless of ocean productivity.
              </span>
            </div>
          )}
        </div>

        {/* Scanning Indicator */}
        {scanning && (
          <div className="bg-white border border-[#CCE4EC] p-12 flex flex-col items-center justify-center gap-4 text-center shadow-sm">
            <div className="flex items-center gap-3">
              <Anchor size={22} className="text-[#007A78] animate-bounce" />
              <div className="w-20 h-1 bg-[#E2F0F5] overflow-hidden">
                <div className="w-full h-full bg-[#007A78] animate-pulse" />
              </div>
            </div>
            <div className="font-serif text-lg font-bold text-[#0A1B27]">
              Sounding Continental Shelf Sectors…
            </div>
            <p className="text-xs text-[#5C7788] max-w-md">
              Cross-evaluating thermal fronts, chlorophyll blooms, wind ceilings, and breeding ban status across Digha, Shankarpur, and Kakdwip.
            </p>
          </div>
        )}

        {/* Working Two-Column Layout (Scan Complete) */}
        {!scanning && results && (
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column (5 cols): High-density Ranked Sector Ledger */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <div className="flex items-center justify-between px-1 text-xs">
                <span className="font-serif font-bold text-[#0A1B27] tracking-wide">
                  Ranked Sector Directory ({results.length} Sounded)
                </span>
                <span className="text-[11px] text-[#5C7788] tabular-nums font-mono">
                  RANKED BY SAFETY &amp; YIELD
                </span>
              </div>

              {results.map((r, i) => (
                <ZoneCard
                  key={r.zoneId}
                  result={r}
                  rank={i + 1}
                  selected={selectedId === r.zoneId}
                  onSelect={() => setSelectedId(r.zoneId)}
                />
              ))}
            </div>

            {/* Right Column (7 cols): Detailed Sector Advisory & Reasoning Manifest */}
            <div className="lg:col-span-7 lg:sticky lg:top-24">
              {selected ? (
                <ReasoningTrace result={selected} />
              ) : (
                <div className="bg-white border border-[#CCE4EC] p-8 text-center text-xs text-[#5C7788]">
                  Select a coastal sector from the left to inspect detailed telemetry and harbor advisories.
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* Advisory Console Footer */}
      <footer className="border-t border-slate-900 bg-[#061219] py-5 px-4 sm:px-6 mt-auto text-[11px] text-[#5C7788]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            Calibrated for West Bengal coastal crafts (mechanized trawlers, motorized nauka, non-mechanized dinghy).
          </span>
          <span className="tabular-nums text-slate-300 font-medium">
            ISRO SIH26176 · Team Tech Titans · ORCA Sagar Mitra
          </span>
        </div>
      </footer>
    </div>
  )
}

