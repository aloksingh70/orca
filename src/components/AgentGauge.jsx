export default function AgentGauge({ score, vetoed = false, showTicks = true }) {
  const width = Math.max(0, Math.min(100, score))
  
  let barColor = 'bg-emerald-600'
  if (vetoed) {
    barColor = 'bg-red-600'
  } else if (score < 45) {
    barColor = 'bg-slate-500'
  } else if (score < 65) {
    barColor = 'bg-amber-500'
  }

  return (
    <div className="w-full flex flex-col gap-1">
      <div className="relative w-full bg-slate-200 border border-slate-300 h-2.5 rounded-full overflow-hidden">
        {/* Fill */}
        <div
          className={`h-full transition-all duration-500 ${barColor}`}
          style={{ width: `${width}%` }}
        />
      </div>
      {showTicks && (
        <div className="flex justify-between items-center text-[10px] text-slate-600 font-medium tabular-nums px-0.5 font-sans">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      )}
    </div>
  )
}

