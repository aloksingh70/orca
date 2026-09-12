import { useState } from 'react'
import {
  Cpu,
  Download,
  Sliders,
  Scale,
  RotateCcw,
  Layers,
  Table,
  Sparkles,
  AlertCircle,
  FileSpreadsheet,
  BarChart2
} from 'lucide-react'
import { generateFullSeasonData, detectAnomalies } from '../lib/derived.js'
import { exportScanAuditLog } from '../lib/api.js'
import { zones } from '../lib/zones.js'

export default function ScientistDeck({
  results = [],
  scanDate,
  weights,
  onWeightsChange,
  precisionMode,
  onTogglePrecisionMode,
  selectedZone
}) {
  const [showSliders, setShowSliders] = useState(false)
  const [activeTab, setActiveTab] = useState('correlation') // 'correlation' | 'sensitivity'
  const [exportingAudit, setExportingAudit] = useState(false)

  // 1. Full 12-Month Season Simulated Dataset Exporter
  const handleExportSimulatedSeason = (format) => {
    const seasonData = generateFullSeasonData(zones, 2026)

    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(seasonData, null, 2))
      const a = document.createElement('a')
      a.href = dataStr
      a.download = `orca_full_season_simulated_2026.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } else {
      // CSV
      const headers = Object.keys(seasonData[0]).join(',')
      const rows = seasonData.map((d) => Object.values(d).map((val) => `"${val}"`).join(','))
      const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers, ...rows].join('\n'))
      const a = document.createElement('a')
      a.href = csvContent
      a.download = `orca_full_season_simulated_2026.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
    }
  }

  // 2. Real Backend Scan Audit Exporter
  const handleExportRealAudit = async (format) => {
    setExportingAudit(true)
    try {
      await exportScanAuditLog(format)
    } catch (err) {
      console.warn('Real audit log export failed, falling back:', err)
      alert('FastAPI server did not respond. Check backend connection.')
    } finally {
      setExportingAudit(false)
    }
  }

  // 3. Sensitivity Matrix Calculations for Selected Zone
  const sensitivityData = (() => {
    if (!selectedZone) return []

    const oScore = selectedZone.agents?.find((a) => a.agent === 'ocean')?.score || 0
    const wScore = selectedZone.agents?.find((a) => a.agent === 'weather')?.score || 0
    const hScore = selectedZone.agents?.find((a) => a.agent === 'history')?.score || 0
    const sScore = selectedZone.agents?.find((a) => a.agent === 'sustain')?.score || 0

    const currentBase = (oScore * weights.ocean + wScore * weights.weather + hScore * weights.history + sScore * weights.sustain) /
      (weights.ocean + weights.weather + weights.history + weights.sustain || 1)

    const agentsList = [
      { key: 'ocean', name: 'Ocean Thermal & Plankton', score: oScore, weight: weights.ocean },
      { key: 'weather', name: 'Weather Hydrodynamics', score: wScore, weight: weights.weather },
      { key: 'history', name: 'CMFRI Historical Catch', score: hScore, weight: weights.history },
      { key: 'sustain', name: 'Sustainability & Ban', score: sScore, weight: weights.sustain }
    ]

    return agentsList.map((ag) => {
      // Plus 10%
      const wPlus = ag.weight * 1.1
      const sumPlus = (ag.key === 'ocean' ? wPlus : weights.ocean) +
        (ag.key === 'weather' ? wPlus : weights.weather) +
        (ag.key === 'history' ? wPlus : weights.history) +
        (ag.key === 'sustain' ? wPlus : weights.sustain)
      const scorePlus = ((ag.key === 'ocean' ? oScore * wPlus : oScore * weights.ocean) +
        (ag.key === 'weather' ? wScore * wPlus : wScore * weights.weather) +
        (ag.key === 'history' ? hScore * wPlus : hScore * weights.history) +
        (ag.key === 'sustain' ? sScore * wPlus : sScore * weights.sustain)) / sumPlus

      // Minus 10%
      const wMinus = Math.max(0.05, ag.weight * 0.9)
      const sumMinus = (ag.key === 'ocean' ? wMinus : weights.ocean) +
        (ag.key === 'weather' ? wMinus : weights.weather) +
        (ag.key === 'history' ? wMinus : weights.history) +
        (ag.key === 'sustain' ? wMinus : weights.sustain)
      const scoreMinus = ((ag.key === 'ocean' ? oScore * wMinus : oScore * weights.ocean) +
        (ag.key === 'weather' ? wScore * wMinus : wScore * weights.weather) +
        (ag.key === 'history' ? hScore * wMinus : hScore * weights.history) +
        (ag.key === 'sustain' ? sScore * wMinus : sScore * weights.sustain)) / sumMinus

      return {
        ...ag,
        baseScore: currentBase,
        scorePlus,
        scoreMinus,
        deltaPlus: scorePlus - currentBase,
        deltaMinus: scoreMinus - currentBase
      }
    })
  })()

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Top Controls Bar */}
      <div className="bg-white border border-[#CCE4EC] p-3.5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-serif font-bold text-[#0A1B27] flex items-center gap-1.5">
            <Cpu size={16} className="text-[#007A78]" />
            <span>Hydrographic Lab &amp; Multi-Agent Metrics</span>
          </span>

          {/* Raw Precision Mode Toggle */}
          <button
            type="button"
            onClick={onTogglePrecisionMode}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              precisionMode
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <span>{precisionMode ? '🔬 Raw Precision (Float)' : 'Standard Precision (Rounded)'}</span>
          </button>

          {/* Calibrate Weights Toggle */}
          <button
            type="button"
            onClick={() => setShowSliders(!showSliders)}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              showSliders
                ? 'bg-[#007A78] text-white border-[#007A78]'
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Sliders size={13} />
            <span>Calibrate Agent Weights</span>
          </button>
        </div>

        {/* Exporters Dropdown / Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleExportRealAudit('csv')}
            disabled={exportingAudit}
            className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Export real scan history from backend SQLite audit table"
          >
            <Download size={13} className="text-[#007A78]" />
            <span>{exportingAudit ? 'Exporting...' : 'Scan Audit CSV'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleExportSimulatedSeason('csv')}
            className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Export complete 12-month simulated baseline dataset (all 6 zones)"
          >
            <FileSpreadsheet size={13} className="text-emerald-700" />
            <span>12-Mo Season CSV</span>
          </button>
        </div>
      </div>

      {/* Expandable Agent Weight Sliders */}
      {showSliders && (
        <div className="bg-white border border-[#CCE4EC] p-4 sm:p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
            <div>
              <h4 className="font-serif font-bold text-[#0A1B27] text-sm flex items-center gap-2">
                <Scale size={15} className="text-[#007A78]" />
                <span>Adjust Multi-Agent Composite Weights (Client-Side Recalculation)</span>
              </h4>
              <p className="text-[11px] text-[#5C7788]">
                Changes recalculate combined scores in real time without modifying server parameters.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onWeightsChange({ ocean: 0.3, weather: 0.3, history: 0.25, sustain: 0.15 })}
              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-mono"
            >
              <RotateCcw size={11} />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between mb-1 font-sans">
                <span className="font-bold text-emerald-800">Ocean Agent</span>
                <span className="font-mono text-slate-700">{weights.ocean.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={weights.ocean}
                onChange={(e) => onWeightsChange({ ...weights, ocean: parseFloat(e.target.value) })}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between mb-1 font-sans">
                <span className="font-bold text-orange-800">Weather Agent</span>
                <span className="font-mono text-slate-700">{weights.weather.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={weights.weather}
                onChange={(e) => onWeightsChange({ ...weights, weather: parseFloat(e.target.value) })}
                className="w-full accent-orange-600 cursor-pointer"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between mb-1 font-sans">
                <span className="font-bold text-amber-800">History Agent</span>
                <span className="font-mono text-slate-700">{weights.history.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={weights.history}
                onChange={(e) => onWeightsChange({ ...weights, history: parseFloat(e.target.value) })}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between mb-1 font-sans">
                <span className="font-bold text-teal-800">Sustain Agent</span>
                <span className="font-mono text-slate-700">{weights.sustain.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={weights.sustain}
                onChange={(e) => onWeightsChange({ ...weights, sustain: parseFloat(e.target.value) })}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Analytical Tabbed Card: Cross-Zone Correlation & Sensitivity Matrix */}
      <div className="bg-white border border-[#CCE4EC] rounded-xl overflow-hidden shadow-xs">
        {/* Tab Headers */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 border-b border-[#CCE4EC]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('correlation')}
              className={`px-3 py-1.5 rounded-md font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'correlation'
                  ? 'bg-white text-[#007A78] shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table size={13} />
              <span>Cross-Zone Comparative Matrix</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sensitivity')}
              className={`px-3 py-1.5 rounded-md font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'sensitivity'
                  ? 'bg-white text-[#007A78] shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 size={13} />
              <span>±10% Agent Weight Sensitivity Matrix</span>
            </button>
          </div>

          <span className="text-[11px] text-[#5C7788] font-mono hidden sm:inline">
            Telemetry: 6 Coastal Quadrants
          </span>
        </div>

        {/* Tab 1: Cross-Zone Correlation View */}
        {activeTab === 'correlation' && (
          <div className="p-4 sm:p-5 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Sector</th>
                  <th className="p-2.5">Zone Name</th>
                  <th className="p-2.5">SST (°C)</th>
                  <th className="p-2.5">Chl-a (mg/m³)</th>
                  <th className="p-2.5">Depth</th>
                  <th className="p-2.5">Offshore</th>
                  <th className="p-2.5">Baseline Anomaly</th>
                  <th className="p-2.5">Composite Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {results.map((r) => {
                  const zObj = zones.find((z) => z.id === r.zoneId) || zones[0]
                  const ocean = r.agents?.find((a) => a.agent === 'ocean')
                  const sstVal = parseFloat(ocean?.readouts?.[0]?.value) || zObj.baseSST
                  const chlVal = parseFloat(ocean?.readouts?.[1]?.value) || zObj.baseChlorophyll
                  const anomaly = detectAnomalies(zObj, scanDate, sstVal, chlVal)

                  return (
                    <tr key={r.zoneId} className="hover:bg-slate-50 font-mono">
                      <td className="p-2.5 font-bold text-teal-800">{r.sectorCode}</td>
                      <td className="p-2.5 font-serif font-bold text-slate-900">{r.zoneName}</td>
                      <td className="p-2.5 text-slate-800">
                        {precisionMode ? sstVal.toFixed(2) : sstVal.toFixed(1)}°C
                      </td>
                      <td className="p-2.5 text-slate-800">
                        {precisionMode ? chlVal.toFixed(3) : chlVal.toFixed(2)}
                      </td>
                      <td className="p-2.5 text-slate-700">{r.soundingDepth}m</td>
                      <td className="p-2.5 text-slate-700">{r.distanceOffshore}</td>
                      <td className="p-2.5">
                        {anomaly.hasAnomaly ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-50 text-rose-800 border border-rose-200 font-bold">
                            Δ {anomaly.sstAnomaly ? `SST ${(anomaly.sstDeviation ?? Math.abs(anomaly.sstDiff || 0)).toFixed(1)}°` : ''} {anomaly.chlAnomaly ? `Chl ${(anomaly.chlDeviation ?? Math.abs(anomaly.chlDiff || 0)).toFixed(2)}` : ''}
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-sans">Nominal</span>
                        )}
                      </td>
                      <td className="p-2.5 font-serif font-bold text-slate-900 text-sm">
                        {precisionMode ? (r.combinedScoreRaw || r.combinedScore).toFixed(2) : r.combinedScore}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Sensitivity Matrix */}
        {activeTab === 'sensitivity' && (
          <div className="p-4 sm:p-5">
            <div className="mb-3 text-xs text-slate-600">
              Examining elasticity for <strong>{selectedZone?.zoneName || 'Selected Sector'}</strong> under individual ±10% perturbation of agent coefficients:
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 font-sans">
                  <tr>
                    <th className="p-2.5">Agent Pipeline</th>
                    <th className="p-2.5">Base Weight</th>
                    <th className="p-2.5">Sub-Agent Score</th>
                    <th className="p-2.5">+10% Shift Outcome</th>
                    <th className="p-2.5">-10% Shift Outcome</th>
                    <th className="p-2.5">Elasticity Swing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white font-mono">
                  {sensitivityData.map((row) => (
                    <tr key={row.key} className="hover:bg-slate-50">
                      <td className="p-2.5 font-sans font-bold text-slate-900">{row.name}</td>
                      <td className="p-2.5 text-slate-700">{row.weight.toFixed(2)}</td>
                      <td className="p-2.5 font-bold text-slate-800">{row.score}/100</td>
                      <td className="p-2.5">
                        <span className={row.deltaPlus >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                          {row.scorePlus.toFixed(2)} ({row.deltaPlus >= 0 ? '+' : ''}{row.deltaPlus.toFixed(2)})
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span className={row.deltaMinus >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                          {row.scoreMinus.toFixed(2)} ({row.deltaMinus >= 0 ? '+' : ''}{row.deltaMinus.toFixed(2)})
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-800 font-bold">
                        ±{Math.abs(row.deltaPlus - row.deltaMinus).toFixed(2)} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
