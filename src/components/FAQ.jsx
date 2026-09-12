import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HelpCircle, ChevronDown, ShieldAlert, Sparkles, Compass, Layers, ExternalLink } from 'lucide-react'

const FAQ_ITEMS = [
  {
    id: 'real-data',
    question: 'Is this using real ocean and weather data?',
    badge: 'Telemetry Feed',
    answer: (
      <div className="space-y-2 text-xs sm:text-sm text-[#2D4454] leading-relaxed">
        <p>
          Currently, ORCA uses <strong>scientifically calibrated simulated telemetry</strong> standing in for real-time sensor streams. The simulated values reflect authentic Bay of Bengal physical baselines (sea surface temperatures between 26–31°C, chlorophyll-a densities between 0.2–4.5 mg/m³, and IMD squall thresholds at 32 km/h wind and 2.2m wave height).
        </p>
        <p>
          The architecture is fully decoupled: all telemetry intake is handled through an abstraction layer (<code className="text-[#007A78] bg-[#E2F0F5] px-1 py-0.5 rounded font-mono text-xs">agents.js</code> and the FastAPI backend), so plugging in live INCOIS OCM-3 satellite endpoints and IMD coastal radar APIs requires zero modifications to the decision UI.
        </p>
      </div>
    )
  },
  {
    id: 'sih-context',
    question: 'What is SIH26176?',
    badge: 'Problem Statement',
    answer: (
      <div className="space-y-2 text-xs sm:text-sm text-[#2D4454] leading-relaxed">
        <p>
          <strong>SIH26176</strong> is the designated problem statement issued by the <strong>Indian Space Research Organisation (ISRO)</strong> under the Smart India Hackathon.
        </p>
        <p>
          The challenge tasks participants with creating an explainable, multi-source marine advisory system for artisanal and motorized Indian fishermen. The goal is to maximize trip economics and diesel efficiency while eliminating loss of life from sudden squalls and rigorously upholding coastal breeding ban mandates.
        </p>
      </div>
    )
  },
  {
    id: 'scoring-engine',
    question: 'How does the multi-agent scoring work?',
    badge: 'Consensus Model',
    answer: (
      <div className="space-y-2 text-xs sm:text-sm text-[#2D4454] leading-relaxed">
        <p>
          Instead of a single black-box score, ORCA distributes analysis across four independent bridge stations:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li><strong>Ocean Station (30% weight):</strong> Thermal fronts and plankton chlorophyll bloom densities.</li>
          <li><strong>Weather Station (30% weight):</strong> Coastal wind speed and significant wave height ceilings.</li>
          <li><strong>History Station (25% weight):</strong> CMFRI 10-year seasonal landing benchmarks.</li>
          <li><strong>Sustainability Station (15% weight):</strong> 61-day East-Coast breeding ban and wildlife sanctuary boundaries.</li>
        </ul>
        <p className="pt-1">
          <strong>Crucial Safety Rule:</strong> The Weather and Sustainability stations hold <em>hard veto authority</em>. If coastal winds surpass 32 km/h or the sector is within the April 15 – June 14 breeding moratorium, the zone is instantly flagged as a hazard or violation, overriding any potential fish concentration. Read our full mathematical breakdown on the <Link to="/methodology" className="text-[#007A78] font-bold underline hover:text-[#006361]">Science &amp; Methodology</Link> page.
        </p>
      </div>
    )
  },
  {
    id: 'simulation-seed',
    question: 'Why do results change between scans? / Why don\'t they?',
    badge: 'Deterministic Engine',
    answer: (
      <div className="space-y-2 text-xs sm:text-sm text-[#2D4454] leading-relaxed">
        <p>
          ORCA uses a <strong>deterministic seeded pseudo-random number generator (mulberry32)</strong> keyed to the exact sounding date and sector ID.
        </p>
        <p>
          This means that scanning the same date and sector will always return the exact same numbers, verdicts, and reasoning logs. Every verdict is 100% reproducible and auditable. When you adjust the scenario date picker (for example, testing an April date versus an August date), the engine switches to that calendar period's authentic seasonal cycle, activating the breeding ban or shifting historical fish species.
        </p>
      </div>
    )
  },
  {
    id: 'real-decisions',
    question: 'Can I use this for real fishing and navigation decisions?',
    badge: 'Safety Disclaimer',
    answer: (
      <div className="space-y-2 text-xs sm:text-sm text-[#2D4454] leading-relaxed">
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-950 font-semibold flex items-start gap-2">
          <ShieldAlert size={16} className="text-[#C04B28] shrink-0 mt-0.5" />
          <span>
            DISCLAIMER: ORCA is an academic demonstration and hackathon prototype. Do not navigate into open waters based solely on this application.
          </span>
        </div>
        <p>
          While the hydrographic coordinates, marine safety limits, and regulatory models match real Indian maritime standards, all active telemetry shown is simulated. Vessel skippers and port crews must always consult official bulletins released by the <strong>India Meteorological Department (IMD)</strong>, <strong>INCOIS</strong>, and the <strong>Department of Fisheries (Govt of West Bengal)</strong> before casting off.
        </p>
      </div>
    )
  }
]

export default function FAQ() {
  const [openId, setOpenId] = useState('real-data')

  const toggleItem = (id) => {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <section id="faq" className="py-16 px-4 sm:px-6 bg-[#EAF4F8] border-b border-[#CCE4EC]">
      <div className="max-w-4xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#E2F0F5] border border-[#BCDCE6] text-[#007A78] text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-3 shadow-2xs">
            <HelpCircle size={14} className="text-[#007A78]" />
            <span>OPERATIONAL TRANSPARENCY &amp; PROTOCOLS</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0A1B27] tracking-tight mb-3">
            Frequently Answered Inquiries
          </h2>
          <p className="text-xs sm:text-sm text-[#5C7788] max-w-xl mx-auto leading-relaxed">
            Direct, plain-language answers regarding telemetry authenticity, ISRO problem statement scope, safety veto algorithms, and prototype constraints.
          </p>
        </div>

        {/* Accordion Stack */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openId === item.id
            const buttonId = `faq-btn-${item.id}`
            const panelId = `faq-panel-${item.id}`

            return (
              <div
                key={item.id}
                className={`bg-white border rounded-xl transition-all duration-200 overflow-hidden shadow-xs ${
                  isOpen
                    ? 'border-[#007A78] ring-1 ring-[#007A78]/20'
                    : 'border-[#CCE4EC] hover:border-[#BCDCE6]'
                }`}
              >
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleItem(item.id)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-[#007A78] focus-visible:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-[#007A78] w-5 shrink-0">
                        0{index + 1}.
                      </span>
                      <span className="font-serif text-base sm:text-lg font-bold text-[#0A1B27]">
                        {item.question}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="hidden sm:inline-block font-mono text-[10px] font-bold uppercase tracking-wider bg-[#E2F0F5] text-[#007A78] px-2 py-0.5 rounded border border-[#BCDCE6]">
                        {item.badge}
                      </span>
                      <div className={`p-1 rounded transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#007A78]' : 'text-[#5C7788]'}`}>
                        <ChevronDown size={18} />
                      </div>
                    </div>
                  </button>
                </h3>

                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="px-4 sm:px-5 pb-5 pt-1 border-t border-[#E0EEF3] animate-in fade-in duration-150"
                  >
                    {item.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footnote Link to Methodology */}
        <div className="mt-8 text-center text-xs text-[#5C7788]">
          <span>Need deeper oceanographic equations? </span>
          <Link to="/methodology" className="text-[#007A78] font-bold underline hover:text-[#006361] inline-flex items-center gap-1">
            <span>Explore the complete 4-Agent mathematical methodology</span>
            <ExternalLink size={12} />
          </Link>
        </div>

      </div>
    </section>
  )
}
