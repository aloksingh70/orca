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
import { useLanguage } from '../context/LanguageContext.jsx'

const todayStr = () => new Date().toISOString().slice(0, 10)

export default function Advisory() {
  const { t } = useLanguage()
  const [scanDate, setScanDate] = useState(todayStr())
  const [scanning, setScanning] = useState(false)
  const [results, setResults] = useState(null)
  const [selectedId, setSelectedId] = useState(null)

  const bridgeStations = [
    { key: 'ocean', icon: Waves, color: 'text-emerald-600', label: t('stations', 'oceanName'), sub: t('stations', 'oceanSub') },
    { key: 'weather', icon: Wind, color: 'text-orange-600', label: t('stations', 'weatherName'), sub: t('stations', 'weatherSub') },
    { key: 'history', icon: Fish, color: 'text-amber-600', label: t('stations', 'historyName'), sub: t('stations', 'historySub') },
    { key: 'sustain', icon: ShieldAlert, color: 'text-red-600', label: t('stations', 'sustainName'), sub: t('stations', 'sustainSub') }
  ]

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
            <span>{t('nav', 'returnDispatch')}</span>
          </Link>
          <div className="text-xs text-[#5C7788] tabular-nums hidden sm:block font-mono">
            <span>{t('nav', 'sectorLabel')}</span>
          </div>
        </div>

        {/* Working Bridge Control Deck */}
        <div className="bg-white border border-[#CCE4EC] p-5 sm:p-6 mb-6 shadow-sm">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E0EEF3]">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#007A78] font-bold uppercase tracking-wider mb-1.5">
                <Compass size={14} />
                <span>{t('advisory', 'stationTag')}</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A1B27] tracking-tight">
                {t('advisory', 'deckTitle')}
              </h1>
              <p className="text-xs text-[#2D4454] mt-1 max-w-2xl">
                {t('advisory', 'deckDesc')}
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
              {t('advisory', 'soundingBannerTitle')}
            </div>
            <p className="text-xs text-[#5C7788] max-w-md">
              {t('advisory', 'soundingBannerDesc')}
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
                  {t('advisory', 'dirTitle')} ({results.length} {t('advisory', 'sounded')})
                </span>
                <span className="text-[11px] text-[#5C7788] tabular-nums font-mono">
                  {t('advisory', 'rankedBy')}
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
                  {t('advisory', 'selectPrompt')}
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
            {t('advisory', 'footerText')}
          </span>
          <span className="tabular-nums text-slate-300 font-medium">
            {t('advisory', 'footerCredits')}
          </span>
        </div>
      </footer>
    </div>
  )
}

