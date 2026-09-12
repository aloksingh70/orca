import { useState, useEffect } from 'react'
import {
  ShieldAlert,
  ShieldCheck,
  Printer,
  Sliders,
  AlertTriangle,
  RotateCcw,
  X,
  FileCheck,
  Building2,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react'
import { fetchViolations } from '../lib/api.js'

export default function OfficerDeck({
  results = [],
  scanDate,
  localThresholds,
  onThresholdsChange,
  isBanActive
}) {
  const [showBulletinModal, setShowBulletinModal] = useState(false)
  const [showThresholdSliders, setShowThresholdSliders] = useState(false)
  const [violations, setViolations] = useState([])
  const [loadingViolations, setLoadingViolations] = useState(false)

  // Load violations from backend API
  const loadViolations = async () => {
    setLoadingViolations(true)
    try {
      const data = await fetchViolations()
      setViolations(data)
    } catch (err) {
      console.warn('Could not load violations:', err)
    } finally {
      setLoadingViolations(false)
    }
  }

  useEffect(() => {
    loadViolations()
  }, [])

  // Calculate local simulation overrides
  const overriddenResults = results.map((r) => {
    const weather = r.agents?.find((a) => a.agent === 'weather')
    const windSpeed = parseFloat(weather?.readouts?.[0]?.value) || 18
    const waveHeight = parseFloat(weather?.readouts?.[1]?.value) || 1.2

    const tripsWind = windSpeed >= (localThresholds.windCutoff || 30)
    const tripsWave = waveHeight >= (localThresholds.waveCutoff || 2.0)
    const isCustomUnsafe = tripsWind || tripsWave

    return {
      ...r,
      tripsCustomWind: tripsWind,
      tripsCustomWave: tripsWave,
      customUnsafe: isCustomUnsafe
    }
  })

  const simulatedHazardsCount = overriddenResults.filter((r) => r.customUnsafe).length

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Officer Command Strip */}
      <div className="bg-white border border-[#CCE4EC] p-3.5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-serif font-bold text-[#0A1B27] flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-[#007A78]" />
            <span>Maritime Fisheries Enforcement Desk</span>
          </span>

          <button
            type="button"
            onClick={() => setShowThresholdSliders(!showThresholdSliders)}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              showThresholdSliders
                ? 'bg-[#007A78] text-white border-[#007A78]'
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Sliders size={13} />
            <span>Adjust Inspection Thresholds</span>
            {(localThresholds.windCutoff !== 30 || localThresholds.waveCutoff !== 2.0) && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>
        </div>

        {/* Printable Bulletin CTA */}
        <button
          type="button"
          onClick={() => setShowBulletinModal(true)}
          className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-3.5 py-1.5 rounded-md font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
        >
          <Printer size={13} className="text-[#007A78]" />
          <span>Print Harbor Gate Bulletin</span>
        </button>
      </div>

      {/* Expandable Threshold Override Panel */}
      {showThresholdSliders && (
        <div className="bg-white border border-[#CCE4EC] p-4 sm:p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
            <div>
              <h4 className="font-serif font-bold text-[#0A1B27] text-sm flex items-center gap-2">
                <Sliders size={15} className="text-[#007A78]" />
                <span>Adjust Local Environmental &amp; Regulatory Cutoffs</span>
              </h4>
              <p className="text-[11px] text-[#5C7788]">
                Simulate stricter enforcement scenarios (e.g. cyclone alert or localized artisanal craft restrictions). Does not overwrite master database rules.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onThresholdsChange({ windCutoff: 30, waveCutoff: 2.0 })}
              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-mono"
            >
              <RotateCcw size={11} />
              <span>Reset Standards</span>
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between mb-1 font-sans">
                <span className="font-bold text-slate-800">Wind Velocity Cutoff</span>
                <span className="font-mono text-[#007A78] font-bold">{localThresholds.windCutoff} km/h</span>
              </div>
              <input
                type="range"
                min="20"
                max="45"
                step="1"
                value={localThresholds.windCutoff}
                onChange={(e) => onThresholdsChange({ ...localThresholds, windCutoff: parseFloat(e.target.value) })}
                className="w-full accent-[#007A78] cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 font-sans block mt-1">Default: 30.0 km/h (Beaufort 5)</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between mb-1 font-sans">
                <span className="font-bold text-slate-800">Wave Height Ceiling</span>
                <span className="font-mono text-[#007A78] font-bold">{localThresholds.waveCutoff.toFixed(1)}m</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.5"
                step="0.1"
                value={localThresholds.waveCutoff}
                onChange={(e) => onThresholdsChange({ ...localThresholds, waveCutoff: parseFloat(e.target.value) })}
                className="w-full accent-[#007A78] cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 font-sans block mt-1">Default: 2.0m (Significant wave height)</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="font-bold text-slate-800 font-sans block mb-1">Simulated Impact</span>
                <div className="text-sm font-bold text-amber-900 font-serif">
                  {simulatedHazardsCount} of {results.length} sectors would trip squall warnings
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-sans">Active threshold simulation mode</span>
            </div>
          </div>
        </div>
      )}

      {/* Violation History Report Ledger */}
      <div className="bg-white border border-[#CCE4EC] p-4 sm:p-5 rounded-xl shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-red-700" />
            <h4 className="font-serif font-bold text-[#0A1B27] text-sm">
              Coastal Violation &amp; Enforcement Log (Audit Trail)
            </h4>
          </div>
          <span className="text-[11px] text-[#5C7788] font-mono">
            {violations.length} incidents logged
          </span>
        </div>

        {loadingViolations ? (
          <div className="p-6 text-center text-xs text-slate-500">Loading enforcement records...</div>
        ) : violations.length === 0 ? (
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-600">
            No active maritime violations detected on this patrol cycle. All Sounded sectors are within standard MFRA compliance boundaries.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Timestamp</th>
                  <th className="p-2.5">Sector</th>
                  <th className="p-2.5">Offense / Condition</th>
                  <th className="p-2.5">Verdict</th>
                  <th className="p-2.5">Action Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {violations.slice(0, 6).map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono text-slate-700">
                      {v.created_at ? new Date(v.created_at).toLocaleString() : v.scan_date}
                    </td>
                    <td className="p-2.5 font-semibold text-slate-900">{v.zone_name}</td>
                    <td className="p-2.5 text-slate-700 max-w-sm truncate">
                      {v.orchestrator_note || 'Condition exceeds safety limits'}
                    </td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-red-100 text-red-800 uppercase">
                        {v.verdict}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <span className="text-[11px] font-bold text-[#007A78] bg-[#E2F0F5] px-2 py-0.5 rounded border border-[#BCDCE6]">
                        Patrol Alerted
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* PRINTABLE DAILY HARBOR BULLETIN MODAL                               */}
      {/* ------------------------------------------------------------------- */}
      {showBulletinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Top Bar (Hidden on Print) */}
            <div className="p-4 bg-slate-100 border-b border-slate-300 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <FileCheck size={18} className="text-[#007A78]" />
                <span className="font-serif font-bold text-[#0A1B27] text-sm">
                  Daily Harbor Gate Maritime Advisory Bulletin
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="bg-[#007A78] hover:bg-[#006361] text-white px-3.5 py-1.5 rounded font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer size={13} />
                  <span>Print Bulletin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulletinModal(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Bulletin Document */}
            <div className="p-6 sm:p-8 overflow-y-auto print:p-0 font-serif text-slate-900 bg-white" id="printable-bulletin">
              {/* Official Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
                <div className="text-xs uppercase font-sans font-bold tracking-widest text-slate-600 mb-1">
                  GOVERNMENT OF WEST BENGAL · DEPARTMENT OF FISHERIES
                </div>
                <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-slate-950">
                  OFFICIAL DAILY COASTAL FISHING CLEARANCE BULLETIN
                </h1>
                <div className="text-xs font-sans text-slate-600 mt-1 flex items-center justify-center gap-4">
                  <span>DATE OF SOUNDING: <strong>{scanDate}</strong></span>
                  <span>•</span>
                  <span>DISPATCH: <strong>ORCA MULTI-AGENT ADVISORY</strong></span>
                  <span>•</span>
                  <span>STATION: <strong>PURBA MEDINIPUR &amp; SAGAR</strong></span>
                </div>
              </div>

              {/* Status Notice */}
              <div className="mb-6 p-3 border border-slate-400 bg-slate-50 text-xs font-sans">
                <div className="font-bold uppercase text-slate-900 mb-1">Regulatory Mandate Notice:</div>
                <p className="text-slate-700 leading-relaxed">
                  Issued under West Bengal Marine Fishing Regulation Act (MFRA) 1993. All registered mechanized and motorized fishing crafts departing Digha, Shankarpur, and Sagar ports must comply with sector clearances soundings listed below.
                </p>
                {isBanActive && (
                  <div className="mt-2 text-red-700 font-bold uppercase">
                    ⚠ UNIFORM 61-DAY EAST-COAST BREEDING BAN IN FORCE. NO TRAWLER OPERATIONS PERMITTED.
                  </div>
                )}
              </div>

              {/* Sector Clearances Table */}
              <div className="mb-6 font-sans">
                <table className="w-full text-left text-xs border border-slate-900">
                  <thead className="bg-slate-200 border-b border-slate-900 text-slate-950 uppercase font-bold">
                    <tr>
                      <th className="p-2 border-r border-slate-900">Sector</th>
                      <th className="p-2 border-r border-slate-900">Fishing Ground</th>
                      <th className="p-2 border-r border-slate-900">Coordinates</th>
                      <th className="p-2 border-r border-slate-900">Sea State</th>
                      <th className="p-2 text-center">Clearance Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-400">
                    {results.map((r) => {
                      const weather = r.agents?.find((a) => a.agent === 'weather')
                      const isClear = r.verdict === 'Recommended'
                      const isNoGo = r.verdict === 'Seasonal Closure' || r.verdict === 'Unsafe Today'

                      return (
                        <tr key={r.zoneId}>
                          <td className="p-2 font-mono font-bold border-r border-slate-400">{r.sectorCode}</td>
                          <td className="p-2 font-bold border-r border-slate-400">{r.zoneName} ({r.distanceOffshore})</td>
                          <td className="p-2 font-mono text-[11px] border-r border-slate-400">{r.coordinates}</td>
                          <td className="p-2 font-mono text-[11px] border-r border-slate-400">
                            {weather?.readouts?.[0]?.value || '18 km/h'} · {weather?.readouts?.[1]?.value || '1.1m'}
                          </td>
                          <td className="p-2 text-center font-bold font-mono">
                            <span className={isClear ? 'text-emerald-800' : isNoGo ? 'text-red-800' : 'text-amber-800'}>
                              {isClear ? 'AUTHORIZED (GO)' : isNoGo ? 'CLOSED (NO GO)' : 'CAUTION'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Signatures & Footer */}
              <div className="pt-8 border-t border-slate-400 flex items-center justify-between text-xs font-sans">
                <div>
                  <div className="font-bold text-slate-900">Director of Marine Fisheries</div>
                  <div className="text-slate-600">Government of West Bengal</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">Port Officer / Coast Guard Detachment</div>
                  <div className="text-slate-600">Sagar Roads Naval Anchorage</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
