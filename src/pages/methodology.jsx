import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Waves,
  Wind,
  Fish,
  ShieldAlert,
  Compass,
  Cpu,
  ShieldCheck,
  Binary,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  ExternalLink
} from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import PageMeta from '../components/PageMeta.jsx'

export default function Methodology() {
  return (
    <div className="bg-[#EAF4F8] min-h-screen flex flex-col font-sans text-[#2D4454] w-full max-w-full overflow-x-hidden">
      <PageMeta
        title="Science & Methodology — ORCA"
        description="Four-agent consensus architecture, oceanographic sensor baselines, and mathematical verification algorithms powering ORCA."
      />
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-6xl mx-auto w-full max-w-full min-w-0 px-4 sm:px-6 pt-24 pb-20 outline-none overflow-x-hidden">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/advisory"
            className="inline-flex items-center gap-1.5 text-xs text-[#5C7788] hover:text-[#0A1B27] font-semibold transition-colors"
          >
            <ArrowLeft size={14} className="text-[#007A78]" />
            <span>Return to Marine Operations Deck</span>
          </Link>
        </div>

        {/* Hero Header */}
        <div className="bg-white border border-[#CCE4EC] p-6 sm:p-10 rounded-2xl shadow-sm mb-10">
          <div className="inline-flex items-center gap-2 bg-[#E2F0F5] border border-[#BCDCE6] text-[#007A78] text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-3 shadow-2xs">
            <Cpu size={14} className="text-[#007A78]" />
            <span>TECHNICAL SPECIFICATION · SIH26176 (ISRO)</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0A1B27] tracking-tight mb-4">
            ORCA Mathematical &amp; Algorithmic Methodology
          </h1>
          <p className="text-sm sm:text-base text-[#2D4454] leading-relaxed max-w-3xl">
            This document outlines the exact deterministic formulas, sensor normalizations, Bayesian weights,
            and safety veto logic governing the four synchronized marine agents in the ORCA platform.
          </p>
        </div>

        {/* Overview: The Multi-Agent Pipeline */}
        <section className="bg-white border border-[#CCE4EC] p-6 sm:p-8 rounded-2xl shadow-sm mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0A1B27] mb-3 flex items-center gap-2">
            <Layers size={22} className="text-[#007A78]" />
            <span>1. System Architecture &amp; Execution Pipeline</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#2D4454] leading-relaxed mb-6">
            ORCA executes four asynchronous domain agents in parallel for every coastal fishing sector.
            The individual agents output normalized scalar ratings in the range <code className="bg-[#E2F0F5] text-[#007A78] px-1.5 py-0.5 rounded font-mono">[0, 100]</code>.
            An orchestrator module then synthesizes these scores via a convex linear combination, followed by an absolute safety circuit breaker veto.
          </p>

          <div className="p-4 bg-[#F8FCFD] border border-[#CCE4EC] rounded-xl font-mono text-xs text-[#0A1B27] overflow-x-auto mb-4">
            <span className="text-[#5C7788]">// Orchestrator Convex Combination Equation:</span>
            <div className="font-bold text-[#007A78] mt-1 text-sm">
              S_combined = w_ocean · S_ocean + w_weather · S_weather + w_history · S_history + w_sustain · S_sustain
            </div>
            <div className="text-[11px] text-[#5C7788] mt-1">
              where default weights: w_ocean = 0.30, w_weather = 0.30, w_history = 0.25, w_sustain = 0.15 (Σw = 1.0)
            </div>
          </div>
        </section>

        {/* The Four Domain Agents Formula Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          
          {/* Agent 1: Ocean Agent */}
          <div className="bg-white border border-[#CCE4EC] p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#007A78] mb-2">
                <Waves size={16} />
                <span>AGENT 01 · OCEAN INTELLIGENCE</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0A1B27] mb-2">
                Sea Surface Temperature &amp; Chlorophyll Plankton Bloom
              </h3>
              <p className="text-xs text-[#2D4454] leading-relaxed mb-4">
                Identifies pelagic feeding grounds by evaluating thermal convergence fronts and active chlorophyll-a concentrations.
              </p>

              <div className="bg-[#F8FCFD] border border-[#CCE4EC] p-3 rounded-lg font-mono text-xs text-[#0A1B27] space-y-1 mb-4">
                <div><strong>SST Optimum:</strong> T_opt = 28.5°C</div>
                <div><strong>SST Score:</strong> S_sst = clamp(100 - 14 · |T_current - 28.5|)</div>
                <div><strong>Chlorophyll Score:</strong> S_chl = clamp(Chl_current · 45)</div>
                <div className="text-[#007A78] pt-1 border-t border-[#CCE4EC] font-bold">
                  S_ocean = clamp(0.55 · S_sst + 0.45 · S_chl)
                </div>
              </div>
            </div>
            <div className="text-[11px] text-[#5C7788] border-t border-[#E0EEF3] pt-3">
              Calibration: OCM-3 sensor (Oceansat-3) / MODIS-Aqua thermal bands.
            </div>
          </div>

          {/* Agent 2: Weather Agent */}
          <div className="bg-white border border-[#CCE4EC] p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#E86014] mb-2">
                <Wind size={16} />
                <span>AGENT 02 · HARD SAFETY NET</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0A1B27] mb-2">
                Wind Velocity &amp; Shelf Wave Chop
              </h3>
              <p className="text-xs text-[#2D4454] leading-relaxed mb-4">
                Measures surface squall velocity and wave height. Designed strictly around small mechanized gillnetter and skiff stability limits.
              </p>

              <div className="bg-[#F8FCFD] border border-[#CCE4EC] p-3 rounded-lg font-mono text-xs text-[#0A1B27] space-y-1 mb-4">
                <div><strong>Wind Score:</strong> S_wind = clamp(100 - (Wind_kmh - 8) · 4)</div>
                <div><strong>Wave Score:</strong> S_wave = clamp(100 - (Wave_m - 0.5) · 55)</div>
                <div className="text-[#E86014] pt-1 border-t border-[#CCE4EC] font-bold">
                  S_weather = clamp(0.50 · S_wind + 0.50 · S_wave)
                </div>
                <div className="text-red-700 text-[11px] font-bold pt-1">
                  VETO THRESHOLD: Wind &gt; 32 km/h OR Wave &gt; 2.2m
                </div>
              </div>
            </div>
            <div className="text-[11px] text-[#5C7788] border-t border-[#E0EEF3] pt-3">
              Calibration: IMD coastal Doppler radar &amp; INCOIS moored ocean buoys.
            </div>
          </div>

          {/* Agent 3: History Agent */}
          <div className="bg-white border border-[#CCE4EC] p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-700 mb-2">
                <Fish size={16} />
                <span>AGENT 03 · HISTORICAL YIELDS</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0A1B27] mb-2">
                Multi-Year Landing Statistics &amp; Seasonal Catch Index
              </h3>
              <p className="text-xs text-[#2D4454] leading-relaxed mb-4">
                Cross-references the sector's 12-month historical harvest records (ICAR-CMFRI data), matching lunar and seasonal productivity cycles.
              </p>

              <div className="bg-[#F8FCFD] border border-[#CCE4EC] p-3 rounded-lg font-mono text-xs text-[#0A1B27] space-y-1 mb-4">
                <div><strong>Monthly Index:</strong> C_baseline = seasonalCatchIndex[month]</div>
                <div><strong>Expected Catch:</strong> C_exp = C_baseline · (0.85 + 0.30 · r_hist)</div>
                <div className="text-amber-700 pt-1 border-t border-[#CCE4EC] font-bold">
                  S_history = clamp((C_exp / C_peak) · 100)
                </div>
              </div>
            </div>
            <div className="text-[11px] text-[#5C7788] border-t border-[#E0EEF3] pt-3">
              Calibration: CMFRI 10-year West Bengal marine fish landing census.
            </div>
          </div>

          {/* Agent 4: Sustainability Agent */}
          <div className="bg-white border border-[#CCE4EC] p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-red-600 mb-2">
                <ShieldAlert size={16} />
                <span>AGENT 04 · STATUTORY CONSERVATION</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0A1B27] mb-2">
                Uniform 61-Day Ban &amp; Protected Marine Sanctuaries
              </h3>
              <p className="text-xs text-[#2D4454] leading-relaxed mb-4">
                Monitors mandatory government conservation calendars (15 April – 14 June) and proximity to UNESCO biosphere reserves.
              </p>

              <div className="bg-[#F8FCFD] border border-[#CCE4EC] p-3 rounded-lg font-mono text-xs text-[#0A1B27] space-y-1 mb-4">
                <div><strong>Ban Date Window:</strong> April 15 – June 14</div>
                <div><strong>If In Ban:</strong> Score = 0, Verdict = "Seasonal Closure"</div>
                <div><strong>Sanctuary Buffer:</strong> Deduction -25 pts if near protected reserve</div>
                <div className="text-red-700 pt-1 border-t border-[#CCE4EC] font-bold">
                  S_sustain = 100 - penalties (or 0 during ban)
                </div>
              </div>
            </div>
            <div className="text-[11px] text-[#5C7788] border-t border-[#E0EEF3] pt-3">
              Calibration: Ministry of Fisheries notification &amp; Sundarbans Biosphere Act.
            </div>
          </div>

        </div>

        {/* Safety Veto Circuit Breaker Logic */}
        <section className="bg-white border border-[#CCE4EC] p-6 sm:p-8 rounded-2xl shadow-sm mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0A1B27] mb-3 flex items-center gap-2">
            <ShieldCheck size={22} className="text-[#007A78]" />
            <span>2. Safety Veto Circuit Breaker (Non-Negotiable Overrides)</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#2D4454] leading-relaxed mb-4">
            Even if a zone exhibits optimal ocean temperature (SST score 98) and peak Hilsa runs (History score 95),
            the safety net enforces an unconditional veto:
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs">
              <div className="font-bold text-red-800 flex items-center gap-1.5 mb-1">
                <AlertTriangle size={15} />
                <span>Statutory Breeding Ban Override</span>
              </div>
              <p className="text-red-900 leading-relaxed">
                If the query date falls within April 15 – June 14, the sector verdict is locked to <strong>"Seasonal Closure"</strong>.
                The final combined score is hard capped at 0.
              </p>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-xs">
              <div className="font-bold text-orange-900 flex items-center gap-1.5 mb-1">
                <Wind size={15} />
                <span>Weather Squall / Wave Cap Override</span>
              </div>
              <p className="text-orange-950 leading-relaxed">
                If wind speed exceeds 32 km/h OR wave chop tops 2.2 meters, the verdict is locked to <strong>"Unsafe Today"</strong>.
                Small boat safety strictly overrides potential catch every time.
              </p>
            </div>
          </div>
        </section>

        {/* Vernacular Natural Language Synthesis */}
        <section className="bg-white border border-[#CCE4EC] p-6 sm:p-8 rounded-2xl shadow-sm">
          <h2 className="font-serif text-2xl font-bold text-[#0A1B27] mb-3 flex items-center gap-2">
            <Binary size={22} className="text-[#007A78]" />
            <span>3. Explainable Vernacular NLG Advisory</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#2D4454] leading-relaxed mb-4">
            Instead of presenting an opaque AI black-box score to coastal skippers, ORCA's orchestrator synthesizes
            the outputs of the four agents into plain-language Bengali and English natural language sentences.
            Every recommendation is accompanied by an auditable reasoning trace containing the exact inputs and rationale.
          </p>
          <div className="bg-[#E2F0F5] border border-[#BCDCE6] p-4 rounded-xl text-xs text-[#0A1B27]">
            <span className="font-bold block text-[#007A78] mb-1">Sample Synthesized Verdict:</span>
            <p className="italic">
              &ldquo;Recommended — Optimal thermal front at 28.3°C and strong chlorophyll bloom (1.70 mg/m³) verified.
              Calm wind at 20 km/h and wave chop 1.2m ensures safe passage for motorized skiffs. Prime season yield of 580 kg expected.&rdquo;
            </p>
          </div>
        </section>

      </main>
    </div>
  )
}
