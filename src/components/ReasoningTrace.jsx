import { Waves, Wind, Fish, ShieldAlert, CheckCircle2, AlertTriangle, XCircle, Compass } from 'lucide-react'
import AgentGauge from './AgentGauge.jsx'
import BathymetricSounder from './BathymetricSounder.jsx'

export default function ReasoningTrace({ result }) {
  const isBanVeto = result.verdict === 'Seasonal Closure'
  const isWeatherVeto = result.verdict === 'Unsafe Today'
  const isRecommended = result.verdict === 'Recommended'
  const isVetoed = isBanVeto || isWeatherVeto

  let verdictColor = 'text-amber-900 border-amber-300 bg-amber-50'
  let VerdictIcon = AlertTriangle
  let verdictHeadline = 'Marginal Voyage Conditions — Exercise Caution'

  if (isBanVeto) {
    verdictColor = 'text-red-900 border-red-300 bg-red-50'
    VerdictIcon = XCircle
    verdictHeadline = 'Mandatory Seasonal Ban — Fishing Legally Prohibited'
  } else if (isWeatherVeto) {
    verdictColor = 'text-red-900 border-red-300 bg-red-50'
    VerdictIcon = AlertTriangle
    verdictHeadline = 'Unsafe Sea State — High Wind & Wave Ceilings'
  } else if (isRecommended) {
    verdictColor = 'text-emerald-900 border-emerald-300 bg-emerald-50'
    VerdictIcon = CheckCircle2
    verdictHeadline = 'Favorable Conditions — Recommended for Sailing'
  }

  const ocean = result.agents.find((a) => a.agent === 'ocean')
  const weather = result.agents.find((a) => a.agent === 'weather')
  const history = result.agents.find((a) => a.agent === 'history')
  const sustain = result.agents.find((a) => a.agent === 'sustain')

  return (
    <div className="bg-white border border-slate-300 shadow-sm rounded-lg overflow-hidden">
      
      {/* 1. Official Sector Dispatch Masthead */}
      <div className="p-5 sm:p-6 border-b border-slate-300 bg-slate-50">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3.5">
          <div>
            <div className="flex items-center gap-2 text-xs text-teal-800 font-bold uppercase tracking-wider mb-1">
              <Compass size={14} />
              <span>
                {result.sectorCode || 'SECTOR'} · {result.coastalDistrict || 'West Bengal Coast'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-700 tabular-nums font-mono">{result.coordinates}</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {result.zoneName} Sector
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-800 mt-2.5 tabular-nums">
              <span className="bg-white px-2.5 py-1 border border-slate-300 rounded font-medium shadow-2xs">
                {result.distanceOffshore} offshore
              </span>
              <span className="bg-white px-2.5 py-1 border border-slate-300 rounded text-teal-900 font-bold shadow-2xs">
                {result.soundingDepth}m sounding depth
              </span>
              <span className="bg-white px-2.5 py-1 border border-slate-300 rounded text-slate-700 font-medium shadow-2xs">
                Seabed: {result.seabed}
              </span>
            </div>
          </div>

          {/* Composite Score Ledger Stamp */}
          <div className="sm:self-start flex items-center gap-3 bg-white border border-slate-300 px-4 py-2 rounded shadow-xs">
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-slate-600 uppercase tracking-wider font-sans font-bold">Composite Index</span>
              <span className="font-serif text-2xl font-bold text-slate-900 tabular-nums leading-none mt-0.5">
                {result.combinedScore} <span className="text-xs text-slate-500 font-sans font-normal">/ 100</span>
              </span>
            </div>
            <div className={`w-3.5 h-3.5 rounded-full ${isVetoed ? 'bg-red-600' : isRecommended ? 'bg-emerald-600' : 'bg-amber-500'}`} />
          </div>
        </div>

        {/* Harbormaster Verdict Callout */}
        <div className={`border p-3.5 rounded flex items-start gap-3 ${verdictColor}`}>
          <VerdictIcon size={20} className="shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="font-serif text-sm font-bold tracking-tight">
              {verdictHeadline}
            </span>
            <p className="text-xs leading-relaxed mt-1 text-slate-800 font-medium">
              {result.orchestratorNote}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Four Parallel Bridge Stations */}
      <div className="p-5 sm:p-6 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-4">
          <span className="text-xs font-serif font-bold text-slate-900 tracking-wide uppercase">
            Parallel Bridge Stations — Telemetry Consensus
          </span>
          <span className="text-[11px] text-slate-600 font-medium">
            4 stations evaluated simultaneously
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          
          {/* Station: Ocean Telemetry */}
          {ocean && (
            <div className="border border-slate-300 bg-white rounded p-4 flex flex-col justify-between gap-3 shadow-xs">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-teal-800 text-xs font-bold font-serif">
                    <Waves size={15} />
                    <span>Sea Surface &amp; Plankton Bloom</span>
                  </div>
                  <span className="text-[11px] text-slate-600 tabular-nums font-sans">
                    Score: <strong className="text-slate-900 font-bold">{ocean.score}</strong>/100
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-xs tabular-nums text-slate-900 mb-2.5 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                  {ocean.readouts?.map((r) => (
                    <span key={r.label}>
                      <strong className="font-semibold text-slate-600">{r.label}:</strong> {r.value}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {ocean.summary}
                </p>
              </div>
              <AgentGauge score={ocean.score} />
            </div>
          )}

          {/* Station: Weather Safety */}
          {weather && (
            <div className={`border rounded p-4 flex flex-col justify-between gap-3 shadow-xs ${
              weather.unsafe ? 'border-red-300 bg-red-50/40' : 'border-slate-300 bg-white'
            }`}>
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold font-serif text-slate-900">
                    <Wind size={15} className={weather.unsafe ? 'text-red-700' : 'text-teal-800'} />
                    <span>Wind &amp; Wave Limits</span>
                  </div>
                  <span className={`text-[11px] tabular-nums font-sans ${weather.unsafe ? 'text-red-700 font-bold uppercase' : 'text-slate-600'}`}>
                    {weather.unsafe ? 'Squall Veto' : `Score: ${weather.score}/100`}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs tabular-nums text-slate-900 mb-2.5 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                  {weather.readouts?.map((r) => (
                    <span key={r.label}>
                      <strong className="font-semibold text-slate-600">{r.label}:</strong> {r.value}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {weather.summary}
                </p>
              </div>
              <AgentGauge score={weather.score} vetoed={weather.unsafe} />
            </div>
          )}

          {/* Station: Historical Catch Records */}
          {history && (
            <div className="border border-slate-300 bg-white rounded p-4 flex flex-col justify-between gap-3 shadow-xs">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-teal-800 text-xs font-bold font-serif">
                    <Fish size={15} />
                    <span>Historical Catch Ledger (CMFRI)</span>
                  </div>
                  <span className="text-[11px] text-slate-600 tabular-nums font-sans">
                    Yield: <strong className="text-slate-900 font-bold">{history.score}</strong>/100
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs tabular-nums text-slate-900 mb-2.5 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                  {history.readouts?.map((r) => (
                    <span key={r.label}>
                      <strong className="font-semibold text-slate-600">{r.label}:</strong> {r.value}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {history.summary}
                </p>
              </div>
              <AgentGauge score={history.score} />
            </div>
          )}

          {/* Station: Sustainability & Conservation Mandates */}
          {sustain && (
            <div className={`border rounded p-4 flex flex-col justify-between gap-3 shadow-xs ${
              sustain.closed ? 'border-red-300 bg-red-50/40' : 'border-slate-300 bg-white'
            }`}>
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold font-serif text-slate-900">
                    <ShieldAlert size={15} className={sustain.closed ? 'text-red-700' : 'text-teal-800'} />
                    <span>Breeding Ban &amp; Sanctuary</span>
                  </div>
                  <span className={`text-[11px] tabular-nums font-sans ${sustain.closed ? 'text-red-700 font-bold uppercase' : 'text-slate-600'}`}>
                    {sustain.closed ? 'Mandatory Ban Veto' : `Compliance: ${sustain.score}/100`}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs tabular-nums text-slate-900 mb-2.5 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                  {sustain.readouts?.map((r) => (
                    <span key={r.label}>
                      <strong className="font-semibold text-slate-600">{r.label}:</strong> {r.value}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {sustain.summary}
                </p>
              </div>
              <AgentGauge score={sustain.score} vetoed={sustain.closed} />
            </div>
          )}

        </div>

        {/* 3. Bathymetric Cross-Section Strip for Selected Sector */}
        <div className="mt-5 pt-4 border-t border-slate-200">
          <div className="mb-2 text-xs font-serif font-bold text-slate-900">
            Hydrographic Sounding Profile · {result.zoneName}
          </div>
          <BathymetricSounder activeZoneId={result.zoneId} compact={true} interactive={false} />
        </div>
      </div>
    </div>
  )
}

