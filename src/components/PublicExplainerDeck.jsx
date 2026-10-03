import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Compass,
  Waves,
  Wind,
  Fish,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Radio,
  ExternalLink
} from 'lucide-react'

export default function PublicExplainerDeck({
  results = [],
  selectedZone,
  scanDate,
  onSelectZone
}) {
  // 1. Guided Walkthrough State
  const [showWalkthrough, setShowWalkthrough] = useState(false)
  const [walkthroughStep, setWalkthroughStep] = useState(0) // 0: Ocean, 1: Weather, 2: History, 3: Sustain, 4: Verdict

  // 2. Before vs. With ORCA Toggle
  const [comparisonMode, setComparisonMode] = useState('with') // 'before' | 'with'

  // Find the actual top-ranked zone
  const actualTopZone = useMemo(() => {
    if (!results || results.length === 0) return null
    return (
      results.find((r) => r.verdict === 'Recommended') ||
      results.find((r) => r.verdict !== 'Seasonal Closure' && r.verdict !== 'Unsafe Today') ||
      results[0]
    )
  }, [results])

  const targetZone = selectedZone || actualTopZone

  // Agent readings for target zone
  const ocean = targetZone?.agents?.find((a) => a.agent === 'ocean')
  const weather = targetZone?.agents?.find((a) => a.agent === 'weather')
  const history = targetZone?.agents?.find((a) => a.agent === 'history')
  const sustain = targetZone?.agents?.find((a) => a.agent === 'sustain')

  // Walkthrough Steps Definition
  const WALKTHROUGH_STEPS = [
    {
      agent: 'ocean',
      station: 'Agent 1 of 4: Ocean Agent',
      title: 'Measuring Sea Temperatures & Plankton Blooms',
      icon: Waves,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-300',
      whatItMeasured: `Sea Surface Temperature (${ocean?.readouts?.[0]?.value || '28.5°C'}) and Chlorophyll Concentration (${ocean?.readouts?.[1]?.value || '1.5 mg/m³'}).`,
      plainExplanation:
        'Just like humans prefer comfortable room temperatures, fish seek specific water temperatures (usually 27–30°C in the Bay of Bengal). Chlorophyll indicates microscopic plankton: small fish eat plankton, and valuable commercial fish (like Hilsa and Pomfret) follow them.',
      scoreText: `Ocean Productivity Score: ${ocean?.score || 0}/100`,
      takeaway:
        ocean?.score >= 65
          ? 'Plankton food abundance and favorable water temperatures indicate active fish schools gathering in this sector.'
          : 'Water conditions are outside prime feeding ranges today; fish may be scattered.'
    },
    {
      agent: 'weather',
      station: 'Agent 2 of 4: Weather Agent',
      title: 'Testing Wind Speeds & Sea Chop for Mariner Safety',
      icon: Wind,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-300',
      whatItMeasured: `Wind Speed (${weather?.readouts?.[0]?.value || '18 km/h'}) and Wave Height (${weather?.readouts?.[1]?.value || '1.1m'}).`,
      plainExplanation:
        'Small traditional wooden crafts and motorized skiffs cannot safely survive heavy squalls or choppy waves above 2 meters. The Weather Agent verifies whether a boat can venture out and safely return to port before dawn.',
      scoreText: weather?.unsafe
        ? 'SQUALL HAZARD VETO TRIGGERED'
        : `Weather Safety Score: ${weather?.score || 0}/100`,
      takeaway: weather?.unsafe
        ? '⚠️ High waves or squall winds exceed safe limits for small boats. The Weather Agent issues an emergency veto!'
        : 'Sea conditions are calm and workable for coastal navigation today.'
    },
    {
      agent: 'history',
      station: 'Agent 3 of 4: History Agent',
      title: 'Consulting 10-Year Catch Benchmarks',
      icon: Fish,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50 border-amber-300',
      whatItMeasured: `Monthly average landing benchmark (${history?.readouts?.[0]?.value || '450 kg/trip'}).`,
      plainExplanation:
        'Even if the water looks good on satellite, is this the right time of year for this location? The History Agent consults historical landing logs from the Central Marine Fisheries Research Institute (CMFRI) to see what boats typically caught during this exact month over the past decade.',
      scoreText: `Seasonal Baseline Score: ${history?.score || 0}/100`,
      takeaway:
        history?.score >= 65
          ? 'This month is historically near the seasonal peak for this coastal fishing ground.'
          : 'Historical data indicates a moderate or quieter seasonal yield for this month.'
    },
    {
      agent: 'sustain',
      station: 'Agent 4 of 4: Sustainability Agent',
      title: 'Guarding Fish Spawning & Wildlife Sanctuaries',
      icon: ShieldAlert,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-50 border-rose-300',
      whatItMeasured: `Uniform East Coast Breeding Ban status (${sustain?.readouts?.[0]?.value || 'Open'}) and sanctuary proximity (${sustain?.readouts?.[1]?.value || 'Clear'}).`,
      plainExplanation:
        'Every year between 15 April and 14 June, India legally halts mechanized fishing along the East Coast so parent fish can lay eggs and juvenile fish can grow without being caught in fine nets. Protected zones like the Sundarbans Biosphere and Lothian Island Sanctuary must also be safeguarded.',
      scoreText: sustain?.closed ? 'STATUTORY MORATORIUM VETO ACTIVE' : 'Status: Fully Compliant (100/100)',
      takeaway: sustain?.closed
        ? '🚨 Mandatory East-Coast breeding ban active. All commercial trawling is prohibited by law to allow fish populations to recover.'
        : 'Zone is clear of seasonal bans and protected marine sanctuary boundaries.'
    },
    {
      agent: 'verdict',
      station: 'Final Verdict: The Orchestrator Synthesis',
      title: 'Combining Scores & The Absolute Safety Veto',
      icon: ShieldCheck,
      iconColor: 'text-sky-700',
      bgColor: 'bg-sky-50 border-sky-300',
      whatItMeasured: `Final Score: ${targetZone?.combinedScore || 0}/100 · Verdict: "${targetZone?.verdict || 'Recommended'}"`,
      plainExplanation:
        'ORCA does not just average numbers blindly. If the Weather Agent detects dangerous waves, or if the Sustainability Agent detects an active breeding ban, it triggers an IMMEDIATE OVERRIDE VETO. High fish abundance never excuses risking human lives or breaking conservation laws.',
      scoreText: `Synthesis: ${targetZone?.verdict}`,
      takeaway:
        targetZone?.verdict === 'Seasonal Closure'
          ? "Even if ocean and history scores are high, the Sustainability Agent's veto overrides everything: the zone is legally closed for fish breeding."
          : targetZone?.verdict === 'Unsafe Today'
          ? "Even if fish are active, the Weather Agent's safety veto overrides everything: lives come first, boats must stay in harbor."
          : "All four agents align — safe seas, good fish activity, strong seasonal track record, and fully compliant!"
    }
  ]

  return (
    <div className="flex flex-col gap-6 mb-6">
      
      {/* --------------------------------------------------------------------- */}
      {/* 1. CURIOUS VISITOR HERO BANNER                                       */}
      {/* --------------------------------------------------------------------- */}
      <div className="bg-white border-2 border-sky-300 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono font-bold bg-sky-100 text-sky-900 border border-sky-300 px-2.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1.5">
                <Compass size={13} className="text-sky-700" />
                <span>EXPLAINER EXPERIENCE · HOW ORCA THINKS</span>
              </span>
              <span className="text-xs text-[#5C7788] hidden sm:inline">
                Zero Setup · No Maritime License Needed
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A1B27] tracking-tight">
              Understand the AI Behind Safer, Smarter Sea Voyages
            </h2>
            <p className="text-xs sm:text-sm text-[#2D4454] mt-1.5 max-w-3xl leading-relaxed">
              Every morning, coastal fishermen face a high-stakes gamble: guess where to sail, burn expensive diesel, and risk sudden storms. ORCA replaces guesswork with transparent multi-agent reasoning. Explore how four specialized agents collaborate to make transparent, life-saving recommendations.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setShowWalkthrough(true)
                setWalkthroughStep(0)
              }}
              className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-3 rounded-lg font-sans font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm cursor-pointer active:scale-98"
            >
              <Sparkles size={15} />
              <span>Start Guided Walkthrough</span>
            </button>
            <Link
              to="/about"
              className="border border-slate-300 hover:border-sky-600 bg-slate-50 hover:bg-white text-slate-800 px-4 py-3 rounded-lg font-sans font-semibold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
            >
              <Info size={14} className="text-sky-700" />
              <span>Why This Matters (About)</span>
            </Link>
          </div>
        </div>

        {/* 3 Value Pillars for Visitors */}
        <div className="grid sm:grid-cols-3 gap-3.5 pt-4 text-xs">
          <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200">
            <strong className="font-serif font-bold text-slate-900 block mb-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
              <span>1. Transparent, Not a Black Box</span>
            </strong>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Instead of a single blind score ("72/100 — trust us"), ORCA shows the exact reasoning of four independent agents.
            </p>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
            <strong className="font-serif font-bold text-slate-900 block mb-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>2. Safety Veto Overrides Greed</span>
            </strong>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Hazardous weather or active breeding bans immediately override high catch scores. Human life and nature always win.
            </p>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
            <strong className="font-serif font-bold text-slate-900 block mb-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
              <span>3. Grounded in Indian Marine Realities</span>
            </strong>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Architecture mirrors real feeds from INCOIS (ocean), IMD (weather), and CMFRI (10-year historical catch records).
            </p>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. STEP-BY-STEP GUIDED WALKTHROUGH OVERLAY / DRAWER                  */}
      {/* --------------------------------------------------------------------- */}
      {showWalkthrough && (
        <div className="bg-white border-2 border-[#007A78] rounded-2xl p-5 sm:p-7 shadow-lg animate-fade-in relative">
          
          {/* Walkthrough Header */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#007A78] text-white">
                <Sparkles size={18} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#007A78] font-bold block">
                  Interactive Explainer Stepper · Step {walkthroughStep + 1} of 5
                </span>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#0A1B27]">
                  {WALKTHROUGH_STEPS[walkthroughStep].title}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowWalkthrough(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Close Walkthrough"
            >
              <X size={20} />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {WALKTHROUGH_STEPS.map((st, i) => (
              <button
                key={st.station}
                type="button"
                onClick={() => setWalkthroughStep(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === walkthroughStep
                    ? 'bg-[#007A78] ring-2 ring-[#007A78]/30'
                    : i < walkthroughStep
                    ? 'bg-emerald-500'
                    : 'bg-slate-200'
                }`}
                title={st.station}
              />
            ))}
          </div>

          {/* Current Step Content Card */}
          <div className={`p-5 sm:p-6 rounded-xl border ${WALKTHROUGH_STEPS[walkthroughStep].bgColor} space-y-4`}>
            
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                {WALKTHROUGH_STEPS[walkthroughStep].station} · Evaluating {targetZone?.zoneName || 'Sector'}
              </span>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-900 shadow-2xs">
                {WALKTHROUGH_STEPS[walkthroughStep].scoreText}
              </span>
            </div>

            {/* What it measured & Why it matters */}
            <div className="space-y-3 text-xs sm:text-sm text-slate-800">
              <div className="p-3 bg-white/80 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block font-semibold mb-1">
                  📡 What this agent measured:
                </strong>
                <p className="text-slate-700 font-mono text-xs">
                  {WALKTHROUGH_STEPS[walkthroughStep].whatItMeasured}
                </p>
              </div>

              <div className="p-3 bg-white/80 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block font-semibold mb-1">
                  💡 Why it matters in plain English:
                </strong>
                <p className="text-slate-700 leading-relaxed">
                  {WALKTHROUGH_STEPS[walkthroughStep].plainExplanation}
                </p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-300 font-medium">
                <strong className="text-[#007A78] block font-bold mb-0.5">
                  ✓ Current Evaluation:
                </strong>
                <p className="text-slate-800">
                  {WALKTHROUGH_STEPS[walkthroughStep].takeaway}
                </p>
              </div>
            </div>

          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-5 mt-5 border-t border-slate-200">
            <button
              type="button"
              disabled={walkthroughStep === 0}
              onClick={() => setWalkthroughStep((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-30 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Previous Agent</span>
            </button>

            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              Step {walkthroughStep + 1} of 5 · Can be skipped anytime
            </span>

            {walkthroughStep < WALKTHROUGH_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setWalkthroughStep((prev) => prev + 1)}
                className="px-5 py-2.5 rounded-lg bg-[#007A78] hover:bg-[#006361] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm cursor-pointer active:scale-98"
              >
                <span>Next Agent</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowWalkthrough(false)}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm cursor-pointer active:scale-98"
              >
                <CheckCircle2 size={15} />
                <span>Finish Walkthrough</span>
              </button>
            )}
          </div>

        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 3. "BEFORE ORCA vs. WITH ORCA" COMPARISON PANEL                       */}
      {/* --------------------------------------------------------------------- */}
      <div className="bg-white border border-[#CCE4EC] rounded-2xl p-5 sm:p-6 shadow-sm">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#007A78] uppercase tracking-wider mb-0.5">
              <Layers size={14} />
              <span>ILLUSTRATIVE SCENARIO COMPARISON</span>
            </div>
            <h3 className="font-serif font-bold text-lg sm:text-xl text-[#0A1B27]">
              The Daily Sailing Decision: Before ORCA vs. With ORCA
            </h3>
            <p className="text-xs text-[#5C7788]">
              An illustrative contrast of how a coastal mariner prepares for dawn departure.
            </p>
          </div>

          {/* Interactive Toggle Switch */}
          <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl">
            <button
              type="button"
              onClick={() => setComparisonMode('before')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                comparisonMode === 'before'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Before ORCA (Guesswork)
            </button>
            <button
              type="button"
              onClick={() => setComparisonMode('with')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                comparisonMode === 'with'
                  ? 'bg-[#007A78] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              With ORCA (Explainable AI)
            </button>
          </div>
        </div>

        {/* Side-by-Side or Selected View */}
        <div className="grid md:grid-cols-2 gap-4">
          
          {/* Card 1: Traditional Method */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              comparisonMode === 'before'
                ? 'border-rose-300 bg-rose-50/50 shadow-xs ring-2 ring-rose-300/40'
                : 'border-slate-200 bg-slate-50/60 opacity-75'
            }`}
          >
            <div className="flex items-center gap-2 text-rose-800 font-serif font-bold text-sm mb-3">
              <AlertTriangle size={16} className="text-rose-600" />
              <span>The Traditional Way: Manual Guesswork</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✕</span>
                <span><strong>Weather Radio:</strong> Listening to a state-wide AM broadcast that lacks localized squall depth for specific rivermouth sandbars.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✕</span>
                <span><strong>Dock Whispers:</strong> Asking neighboring skippers at the jetty where they caught fish yesterday; by dawn, the fish have already moved.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✕</span>
                <span><strong>Diesel Wastage:</strong> Steaming 30–50 km out to sea only to discover barren warm water, burning ₹4,000–₹6,000 in fuel for zero catch (illustrative estimate).</span>
              </li>
            </ul>
          </div>

          {/* Card 2: With ORCA */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              comparisonMode === 'with'
                ? 'border-emerald-400 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-300/40'
                : 'border-slate-200 bg-slate-50/60 opacity-75'
            }`}
          >
            <div className="flex items-center gap-2 text-emerald-900 font-serif font-bold text-sm mb-3">
              <CheckCircle2 size={16} className="text-emerald-700" />
              <span>With ORCA: One Transparent Recommendation</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">✓</span>
                <span><strong>Satellite Telemetry:</strong> Fuses live Sea Surface Temperature &amp; Chlorophyll blooms to pinpoint actual feeding grounds before sailing.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">✓</span>
                <span><strong>Hyperlocal Weather Safety:</strong> Rigorous localized wave and wind ceilings specifically calibrated for small craft safety.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">✓</span>
                <span><strong>Un-bypassable Safety Veto:</strong> A definitive Go / No-Go verdict that enforces statutory breeding bans and protects lives in squall conditions.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>



      {/* --------------------------------------------------------------------- */}
      {/* 6. DATA HONESTY STATEMENT BLOCK                                       */}
      {/* --------------------------------------------------------------------- */}
      <div className="bg-[#E2F0F5]/70 border border-[#BCDCE6] rounded-2xl p-5 sm:p-6 text-xs text-[#2D4454]">
        <div className="flex items-center gap-2 text-[#007A78] font-serif font-bold text-sm mb-2">
          <Info size={16} />
          <span>Data Honesty &amp; Architecture Disclosure</span>
        </div>
        <div className="space-y-2 leading-relaxed">
          <p>
            <strong>Realistic Simulation for SIH26176:</strong> Every oceanographic and weather reading in this prototype is deterministically simulated using mathematical baselines calibrated to real Bay of Bengal coastal waters (Mulberry32 PRNG engine).
          </p>
          <p>
            <strong>Real-World Telemetry Feeds:</strong> In a production deployment, ORCA would connect directly to official government data endpoints:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 font-mono text-[11px] text-slate-800">
            <li><strong>INCOIS (Indian National Centre for Ocean Information Services):</strong> Satellite SST and chlorophyll Potential Fishing Zone (PFZ) telemetry.</li>
            <li><strong>IMD (India Meteorological Department):</strong> Coastal squall alerts, localized wind vectors, and wave height warnings.</li>
            <li><strong>CMFRI (Central Marine Fisheries Research Institute):</strong> Historical commercial landing registries.</li>
          </ul>
          <p className="pt-1 text-[11px] text-[#5C7788]">
            <strong>Zero UI Rebuild Architecture:</strong> All scoring logic is isolated in a single modular entry point (<code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-300 text-[#007A78]">agents.js</code> / <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-300 text-[#007A78]">agents.py</code>). Swapping simulated feeds for live INCOIS/IMD feeds requires zero changes to the user interface.
          </p>
        </div>
      </div>

    </div>
  )
}
