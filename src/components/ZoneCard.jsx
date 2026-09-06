export default function ZoneCard({ result, rank, selected, onSelect }) {
  const isVetoed = result.verdict === 'Unsafe Today' || result.verdict === 'Seasonal Closure'
  const isRecommended = result.verdict === 'Recommended'
  
  const ocean = result.agents.find((a) => a.agent === 'ocean')
  const weather = result.agents.find((a) => a.agent === 'weather')
  const history = result.agents.find((a) => a.agent === 'history')

  let statusClass = 'border-slate-300 bg-slate-100 text-slate-800'
  let accentBorder = 'border-l-slate-400'

  if (result.verdict === 'Seasonal Closure' || result.verdict === 'Unsafe Today') {
    statusClass = 'border-red-300 bg-red-50 text-red-800 font-bold'
    accentBorder = 'border-l-red-600'
  } else if (isRecommended) {
    statusClass = 'border-emerald-300 bg-emerald-50 text-emerald-800 font-bold'
    accentBorder = 'border-l-emerald-600'
  } else {
    statusClass = 'border-amber-300 bg-amber-50 text-amber-900 font-bold'
    accentBorder = 'border-l-amber-600'
  }

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left transition-all p-3.5 flex flex-col gap-2 rounded-r ${accentBorder} border-l-[4px] cursor-pointer ${
        selected
          ? 'bg-white border-y border-r border-teal-700 ring-2 ring-teal-700/20 shadow-md'
          : 'bg-white border-y border-r border-slate-300 hover:border-slate-400 shadow-xs'
      } ${isVetoed ? 'opacity-95' : ''}`}
    >
      {/* Top Header: Code, Sector Name, Distance, Verdict Badge */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 tabular-nums">
            <span className="font-bold text-teal-800">
              {result.sectorCode || `WB-0${rank}`}
            </span>
            <span>•</span>
            <span>{result.distanceOffshore} offshore</span>
            {result.soundingDepth && (
              <>
                <span>•</span>
                <span className="text-slate-900 font-bold">{result.soundingDepth}m depth</span>
              </>
            )}
          </div>
          <h3 className="font-serif text-lg font-bold text-slate-900 mt-0.5">
            {result.zoneName}
          </h3>
        </div>

        {/* Verdict Badge */}
        <span className={`shrink-0 text-xs px-2.5 py-1 border rounded leading-tight text-center ${statusClass}`}>
          {result.verdict}
        </span>
      </div>

      {/* Bottom Readout Strip: Telemetry & Combined Score */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-600 tabular-nums">
        <div className="flex items-center gap-3">
          {ocean && ocean.readouts?.[0] && (
            <span>SST <strong className="text-slate-900 font-bold">{ocean.readouts[0].value}</strong></span>
          )}
          {weather && weather.readouts?.[0] && (
            <span>Wind <strong className="text-slate-900 font-bold">{weather.readouts[0].value}</strong></span>
          )}
          {history && history.readouts?.[0] && (
            <span className="hidden sm:inline">Yield <strong className="text-slate-900 font-bold">{history.readouts[0].value.replace('/trip', '')}</strong></span>
          )}
        </div>

        <div className="flex items-baseline gap-1">
          {isVetoed ? (
            <span className="text-red-700 font-serif font-bold text-sm uppercase">Vetoed</span>
          ) : (
            <>
              <span className="font-serif text-xl font-bold text-slate-900">
                {result.combinedScore}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">/100</span>
            </>
          )}
        </div>
      </div>
    </button>
  )
}


