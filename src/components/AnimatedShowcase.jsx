import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Waves,
  Wind,
  Fish,
  ShieldAlert,
  ShieldCheck,
  Compass,
  Cpu,
  Radio,
  Sparkles,
  ArrowRight,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Eye,
  HelpCircle
} from 'lucide-react'

export default function AnimatedShowcase() {
  const [activeTab, setActiveTab] = useState('what') // 'what' | 'how'
  const [simulating, setSimulating] = useState(false)
  const [simStep, setSimStep] = useState(0)
  const [selectedSector, setSelectedSector] = useState('shankarpur')
  const [simResults, setSimResults] = useState({
    ocean: { score: 86, sst: '28.3°C', chl: '1.70 mg/m³', status: 'Optimal Bloom' },
    weather: { score: 79, wind: '20.0 km/h', wave: '1.2 m', status: 'Safe Sea State' },
    history: { score: 82, catch: '580 kg/trip', status: 'Prime Season' },
    sustainability: { score: 95, ban: 'Open / Cleared', status: 'No Violations' },
    combinedScore: 84,
    verdict: 'FAVORABLE / CLEARED FOR DISPATCH'
  })

  const sectors = [
    { id: 'digha', name: 'Digha Mohana', code: 'WB-01', depth: '12m' },
    { id: 'shankarpur', name: 'Shankarpur Harbour', code: 'WB-02', depth: '16m' },
    { id: 'junput', name: 'Junput Coastal Basin', code: 'WB-03', depth: '18m' },
    { id: 'sagar', name: 'Sagar Roads Anchorage', code: 'WB-04', depth: '14m' }
  ]

  const triggerSimulation = () => {
    setSimulating(true)
    setSimStep(1)
    setTimeout(() => setSimStep(2), 600)
    setTimeout(() => setSimStep(3), 1300)
    setTimeout(() => setSimStep(4), 2000)
    setTimeout(() => {
      setSimStep(5)
      setSimulating(false)
    }, 2700)
  }

  return (
    <section id="how-it-works" className="relative py-20 px-4 sm:px-6 bg-[#061219] text-white border-b border-slate-800 overflow-hidden">
      {/* Background Animated Glowing Waves & Grid Telemetry */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#007A78] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#E86014] rounded-full blur-3xl opacity-30" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E384D15_1px,transparent_1px),linear-gradient(to_bottom,#1E384D15_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-[#007A78]/20 border border-[#007A78]/40 text-[#00b4d8] text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-3">
            <Radio size={13} className="animate-pulse text-[#00b4d8]" />
            <span>OPERATIONAL BLUEPRINT · ISRO SIH26176</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Demystifying ORCA Intelligence
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Discover what this autonomous marine AI platform delivers to coastal fishermen and officers, and how four synchronized agents eliminate dangerous guesswork at sea.
          </p>

          {/* Interactive Dual-Mode Switcher */}
          <div className="inline-flex p-1.5 bg-[#0A1A26] border border-slate-700/80 rounded-xl mt-6 shadow-xl">
            <button
              type="button"
              onClick={() => setActiveTab('what')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'what'
                  ? 'bg-[#007A78] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HelpCircle size={15} />
              <span>1. What ORCA Does</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('how')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'how'
                  ? 'bg-[#007A78] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu size={15} />
              <span>2. How ORCA Does It (Live Engine)</span>
            </button>
          </div>
        </div>

        {/* TAB 1: WHAT ORCA DOES */}
        {activeTab === 'what' && (
          <div className="space-y-10 animate-fade-in">
            {/* 4 Core Pillars of Impact */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1: Ocean Feeding Telemetry */}
              <div className="bg-[#0A1A26]/90 border border-slate-800 hover:border-[#007A78] p-6 rounded-xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-[#007A78]/20 border border-[#007A78]/40 text-[#00b4d8] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Waves size={24} />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00b4d8] block mb-1">
                    PILLAR 01 · OCEAN INTELLIGENCE
                  </span>
                  <h3 className="font-serif text-lg font-bold text-white mb-2">
                    Predicts Feeding Grounds
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Fuses satellite Sea Surface Temperatures (SST) with active Chlorophyll-a plankton blooms to identify where fish actually school — saving up to 50 liters of diesel per trip.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                  <span>Data: OCM-3 / MODIS</span>
                  <span className="text-emerald-400 font-bold">27–30°C Band</span>
                </div>
              </div>

              {/* Card 2: Life-Saving Weather Veto */}
              <div className="bg-[#0A1A26]/90 border border-slate-800 hover:border-[#E86014] p-6 rounded-xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-[#E86014]/20 border border-[#E86014]/40 text-[#fca311] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Wind size={24} />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#fca311] block mb-1">
                    PILLAR 02 · HARD SAFETY NET
                  </span>
                  <h3 className="font-serif text-lg font-bold text-white mb-2">
                    Enforces Weather Ceilings
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Instantly flags hazardous conditions when coastal winds exceed 32 km/h or waves top 2.2m. Small skiff and trawler safety strictly overrides potential catch value.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                  <span>Data: IMD Buoys & Radar</span>
                  <span className="text-[#fca311] font-bold">Auto-Veto Cap</span>
                </div>
              </div>

              {/* Card 3: 10-Year Catch Benchmarks */}
              <div className="bg-[#0A1A26]/90 border border-slate-800 hover:border-amber-500 p-6 rounded-xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Fish size={24} />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 block mb-1">
                    PILLAR 03 · HISTORICAL YIELDS
                  </span>
                  <h3 className="font-serif text-lg font-bold text-white mb-2">
                    10-Year Catch Grounding
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    References decades of ICAR-CMFRI landing statistics for each Bengali harbor sector and lunar cycle, predicting realistic harvest yields per craft category.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                  <span>Data: CMFRI Ledgers</span>
                  <span className="text-amber-300 font-bold">Kg/Trip Baseline</span>
                </div>
              </div>

              {/* Card 4: Breeding Ban & Sanctuary Protection */}
              <div className="bg-[#0A1A26]/90 border border-slate-800 hover:border-red-500 p-6 rounded-xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ShieldAlert size={24} />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-400 block mb-1">
                    PILLAR 04 · ECOLOGICAL VETO
                  </span>
                  <h3 className="font-serif text-lg font-bold text-white mb-2">
                    Statutory Conservation
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Prevents heavy fines and vessel impoundment by automatically locking out zones during the 61-day Bay of Bengal fishing ban and around Sundarbans biosphere buffers.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                  <span>Mandate: 15 Apr – 14 Jun</span>
                  <span className="text-red-400 font-bold">Absolute Veto</span>
                </div>
              </div>

            </div>

            {/* Visual Value Demonstration Box */}
            <div className="bg-[#0A1A26] border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-[#00b4d8] text-xs font-mono font-bold mb-2">
                  <Activity size={15} />
                  <span>MEASURABLE HARBOR IMPACT</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3">
                  Moving from Risky Speculation to Transparent Consensus
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Traditional fishermen rely on fragmented radio snippets or generic forecasts, resulting in lost gear, capsize tragedies, and empty nets. ORCA provides an explainable 0–100 score backed by a full reasoning trace — not an opaque AI black box.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 shrink-0 w-full sm:w-auto">
                <div className="bg-[#061219] border border-slate-800 p-4 rounded-lg text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-[#00b4d8] font-mono">35%</div>
                  <div className="text-[10px] sm:text-xs text-slate-400 mt-1 uppercase font-semibold">Fuel Waste Avoidance</div>
                </div>
                <div className="bg-[#061219] border border-slate-800 p-4 rounded-lg text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">100%</div>
                  <div className="text-[10px] sm:text-xs text-slate-400 mt-1 uppercase font-semibold">Safety Override Adherence</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HOW ORCA DOES IT (LIVE ARCHITECTURE & INTERACTIVE SIMULATOR) */}
        {activeTab === 'how' && (
          <div className="space-y-10 animate-fade-in">
            
            {/* Step Pipeline Breakdown */}
            <div className="grid md:grid-cols-4 gap-4">
              
              <div className={`p-4 rounded-xl border transition-all ${simStep >= 1 ? 'bg-[#007A78]/20 border-[#00b4d8]' : 'bg-[#0A1A26] border-slate-800'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-[#00b4d8]">PHASE 01</span>
                  <span className="w-2 h-2 rounded-full bg-[#00b4d8] animate-ping" />
                </div>
                <h4 className="font-serif font-bold text-sm text-white mb-1">Telemetry Ingestion</h4>
                <p className="text-[11px] text-slate-300">
                  Pulls Oceansat-3 OCM optical data, IMD Doppler wind feeds, and CMFRI harvest tables.
                </p>
              </div>

              <div className={`p-4 rounded-xl border transition-all ${simStep >= 2 ? 'bg-[#007A78]/20 border-[#00b4d8]' : 'bg-[#0A1A26] border-slate-800'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-[#fca311]">PHASE 02</span>
                  <span className="w-2 h-2 rounded-full bg-[#fca311]" />
                </div>
                <h4 className="font-serif font-bold text-sm text-white mb-1">Parallel Agents</h4>
                <p className="text-[11px] text-slate-300">
                  Ocean, Weather, History, and Sustainability agents compute individual ratings in parallel.
                </p>
              </div>

              <div className={`p-4 rounded-xl border transition-all ${simStep >= 3 ? 'bg-[#007A78]/20 border-[#00b4d8]' : 'bg-[#0A1A26] border-slate-800'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-red-400">PHASE 03</span>
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                </div>
                <h4 className="font-serif font-bold text-sm text-white mb-1">Safety Veto Check</h4>
                <p className="text-[11px] text-slate-300">
                  Safety and Ban thresholds act as an un-bypasable circuit breaker before final ranking.
                </p>
              </div>

              <div className={`p-4 rounded-xl border transition-all ${simStep >= 4 ? 'bg-[#007A78]/20 border-[#00b4d8]' : 'bg-[#0A1A26] border-slate-800'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-400">PHASE 04</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <h4 className="font-serif font-bold text-sm text-white mb-1">Consensus Dispatch</h4>
                <p className="text-[11px] text-slate-300">
                  Outputs ranked sector cards with plain-language vernacular advisory guidance.
                </p>
              </div>

            </div>

            {/* Interactive Live Agent Convergence Simulator Console */}
            <div className="bg-[#0A1A26] border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
              
              {/* Simulator Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00b4d8] mb-1">
                    <Sparkles size={14} />
                    <span>INTERACTIVE CONSENSUS SIMULATOR</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                    Live Multi-Agent Reasoning Testbed
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="bg-[#061219] border border-slate-700 text-white text-xs px-3 py-2 rounded-lg font-medium outline-none focus:border-[#007A78]"
                  >
                    {sectors.map((s) => (
                      <option key={s.id} value={s.id}>
                        Sector: {s.name} ({s.code})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    disabled={simulating}
                    onClick={triggerSimulation}
                    className="flex items-center gap-2 bg-[#007A78] hover:bg-[#006361] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all shadow-md cursor-pointer"
                  >
                    {simulating ? (
                      <>
                        <RotateCcw size={13} className="animate-spin" />
                        <span>Simulating…</span>
                      </>
                    ) : (
                      <>
                        <Play size={13} fill="currentColor" />
                        <span>Run Convergence</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 4 Agent Live Dials */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
                
                {/* Ocean Agent Dial */}
                <div className="bg-[#061219] border border-slate-800 p-4 rounded-xl">
                  <div className="flex items-center justify-between text-xs font-bold text-[#00b4d8] mb-2">
                    <span className="flex items-center gap-1.5">
                      <Waves size={14} />
                      <span>Ocean Agent</span>
                    </span>
                    <span className="font-mono">{simResults.ocean.score}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-[#00b4d8] transition-all duration-700" style={{ width: `${simResults.ocean.score}%` }} />
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-1 font-mono">
                    <div className="flex justify-between"><span>SST:</span> <strong className="text-white">{simResults.ocean.sst}</strong></div>
                    <div className="flex justify-between"><span>Chlorophyll-a:</span> <strong className="text-white">{simResults.ocean.chl}</strong></div>
                  </div>
                </div>

                {/* Weather Agent Dial */}
                <div className="bg-[#061219] border border-slate-800 p-4 rounded-xl">
                  <div className="flex items-center justify-between text-xs font-bold text-[#fca311] mb-2">
                    <span className="flex items-center gap-1.5">
                      <Wind size={14} />
                      <span>Weather Agent</span>
                    </span>
                    <span className="font-mono">{simResults.weather.score}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-[#fca311] transition-all duration-700" style={{ width: `${simResults.weather.score}%` }} />
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-1 font-mono">
                    <div className="flex justify-between"><span>Wind:</span> <strong className="text-white">{simResults.weather.wind}</strong></div>
                    <div className="flex justify-between"><span>Wave Chop:</span> <strong className="text-white">{simResults.weather.wave}</strong></div>
                  </div>
                </div>

                {/* History Agent Dial */}
                <div className="bg-[#061219] border border-slate-800 p-4 rounded-xl">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Fish size={14} />
                      <span>History Agent</span>
                    </span>
                    <span className="font-mono">{simResults.history.score}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-amber-400 transition-all duration-700" style={{ width: `${simResults.history.score}%` }} />
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-1 font-mono">
                    <div className="flex justify-between"><span>Yield Index:</span> <strong className="text-white">{simResults.history.catch}</strong></div>
                    <div className="flex justify-between"><span>Trend:</span> <strong className="text-white">Peak Run</strong></div>
                  </div>
                </div>

                {/* Sustainability Agent Dial */}
                <div className="bg-[#061219] border border-slate-800 p-4 rounded-xl">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-2">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={14} />
                      <span>Sustainability</span>
                    </span>
                    <span className="font-mono">{simResults.sustainability.score}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${simResults.sustainability.score}%` }} />
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-1 font-mono">
                    <div className="flex justify-between"><span>Ban Status:</span> <strong className="text-emerald-400">{simResults.sustainability.ban}</strong></div>
                    <div className="flex justify-between"><span>Buffer:</span> <strong className="text-white">&gt; 12 km clear</strong></div>
                  </div>
                </div>

              </div>

              {/* Central Orchestrator Consensus Verdict */}
              <div className="bg-[#061219] border border-[#007A78]/50 p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-[#007A78]/20 text-[#00b4d8] border border-[#007A78]/40 shrink-0">
                    <Compass size={24} className="animate-spin-slow" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-[#00b4d8] uppercase">
                        SYNCHRONIZED ORCHESTRATOR VERDICT
                      </span>
                      <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
                        CONFIDENCE: 92%
                      </span>
                    </div>
                    <div className="font-serif font-bold text-white text-lg mt-0.5">
                      {simResults.verdict} (Score: {simResults.combinedScore}/100)
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                      Favorable thermal convergence (28.3°C) and chlorophyll bloom verified. Wave shear remains well beneath the 2.2m hazard cap. Fishing ban clear. Mechanized skiffs cleared for immediate dispatch.
                    </p>
                  </div>
                </div>

                <Link
                  to="/advisory"
                  className="shrink-0 inline-flex items-center gap-2 bg-[#007A78] hover:bg-[#006361] text-white px-5 py-2.5 rounded-lg font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
                >
                  <span>Launch Live Advisory Tool</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  )
}
