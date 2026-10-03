import { useEffect, useRef, useState } from 'react'
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
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GlassTiltCard from './GlassTiltCard.jsx'

// Register GSAP Plugin safely
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const AGENTS = [
  {
    id: 'ocean',
    name: 'Ocean Agent',
    sanskrit: 'समुद्र वेधशाला',
    role: 'Thermal Fronts & Plankton Blooms',
    color: '#17A398',
    borderColor: 'border-[#17A398]/40',
    glowColor: 'from-[#17A398]/20',
    icon: Waves,
    metric: 'SST 28.4°C · Chl 1.70 mg/m³',
    status: 'Optimal Feeding Aggregation',
    description: 'Fuses OCM-3 satellite telemetry to pinpoint genuine feeding zones where 27–30°C thermal boundaries overlap with chlorophyll-rich plankton.'
  },
  {
    id: 'weather',
    name: 'Weather Agent',
    sanskrit: 'वायु एवं तरंग सीमा',
    role: 'Coastal Wind & Wave Ceilings',
    color: '#4C7FE0',
    borderColor: 'border-[#4C7FE0]/40',
    glowColor: 'from-[#4C7FE0]/20',
    icon: Wind,
    metric: 'Wind 18 km/h · Swell 1.1m @ 8s',
    status: 'Safe Sea State Confirmed',
    description: 'Monitors localized coastal squall corridors. Enforces hard safety ceilings: small craft locked out if winds exceed 32 km/h or waves surpass 2.2m.'
  },
  {
    id: 'history',
    name: 'History Agent',
    sanskrit: 'मत्स्य अवतरण अभिलेख',
    role: 'CMFRI 10-Year Catch Benchmarks',
    color: '#8B5CF6',
    borderColor: 'border-[#8B5CF6]/40',
    glowColor: 'from-[#8B5CF6]/20',
    icon: Fish,
    metric: 'Historic Yield: 580 kg/trip',
    status: 'Prime Hilsa Run Season',
    description: 'Cross-references decade-long harbor landing registries for the current calendar week, establishing realistic commercial yield benchmarks.'
  },
  {
    id: 'sustainability',
    name: 'Sustainability Agent',
    sanskrit: 'संरक्षण एवं प्रतिबंध',
    role: 'Uniform Breeding Ban & Sanctuaries',
    color: '#3FA35C',
    borderColor: 'border-[#3FA35C]/40',
    glowColor: 'from-[#3FA35C]/20',
    icon: ShieldAlert,
    metric: 'Ban Status: Open / Compliant',
    status: 'Zero Ecological Violations',
    description: 'Enforces statutory 61-day breeding bans and wildlife buffers. Holds an absolute hard veto that overrides all fish activity scores.'
  }
]

export default function AgentConvergenceSection() {
  const sectionRef = useRef(null)
  const coreRef = useRef(null)
  const cardsRef = useRef([])
  const [activeVerdictStep, setActiveVerdictStep] = useState(1)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Initial State: Stagger agent cards into viewport
      gsap.from(cardsRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          end: 'top 30%',
          scrub: 1
        },
        y: 60,
        opacity: 0,
        stagger: 0.15,
        ease: 'power2.out'
      })

      // 2. Convergence Assembly Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 50%',
          end: 'bottom 80%',
          scrub: 1.2,
          onUpdate: (self) => {
            const progress = self.progress
            if (progress > 0.65) {
              setActiveVerdictStep(3)
            } else if (progress > 0.3) {
              setActiveVerdictStep(2)
            } else {
              setActiveVerdictStep(1)
            }
          }
        }
      })

      // Central core breathing and pulsing
      tl.to(coreRef.current, {
        scale: 1.05,
        boxShadow: '0 0 60px rgba(44, 166, 164, 0.4)',
        duration: 1,
        ease: 'power2.inOut'
      })

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="agents"
      className="relative py-24 px-4 sm:px-6 bg-[#031520] border-b border-white/10 overflow-hidden"
    >
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-radial from-[#17A398]/10 via-[#0a2333]/20 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 text-xs font-mono font-bold tracking-wider uppercase mb-3">
            <Cpu size={13} className="text-teal-400" />
            <span>Multi-Agent Consensus Architecture</span>
          </div>
          
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4 leading-tight">
            Four independent agents converge into{' '}
            <span className="bg-gradient-to-r from-teal-300 via-sky-300 to-[#17A398] bg-clip-text text-transparent">
              one transparent verdict
            </span>
          </h2>
          
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Instead of trusting a single black-box algorithm, ORCA synchronizes satellite ocean optics, localized wind/wave ceilings, historic landings, and ecological moratoria simultaneously.
          </p>
        </div>

        {/* 4 Agent Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {AGENTS.map((agent, idx) => {
            const Icon = agent.icon
            return (
              <div
                key={agent.id}
                ref={(el) => (cardsRef.current[idx] = el)}
              >
                <GlassTiltCard
                  accentColor={agent.color}
                  className="p-5 h-full flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner"
                        style={{
                          backgroundColor: `${agent.color}15`,
                          borderColor: `${agent.color}40`,
                          color: agent.color
                        }}
                      >
                        <Icon size={20} />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                        Agent 0{idx + 1}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-white mb-0.5">
                      {agent.name}
                    </h3>
                    <div className="text-[11px] font-mono text-slate-400 mb-3">
                      {agent.sanskrit} · {agent.role}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {agent.description}
                    </p>
                  </div>

                  {/* Telemetry Readout Strip */}
                  <div className="mt-auto p-3 rounded-xl bg-black/40 border border-white/10">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>LIVE TELEMETRY</span>
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: agent.color }} />
                    </div>
                    <div className="text-xs font-bold text-white truncate font-mono">
                      {agent.metric}
                    </div>
                    <div className="text-[11px] font-semibold mt-0.5" style={{ color: agent.color }}>
                      {agent.status}
                    </div>
                  </div>
                </GlassTiltCard>
              </div>
            )
          })}
        </div>

        {/* Central Orchestrator Convergence Core */}
        <div
          ref={coreRef}
          className="relative rounded-2xl border border-teal-500/30 bg-[#071927]/80 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(23,163,152,0.15)] max-w-4xl mx-auto"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#17A398] to-[#0a524c] border border-teal-300/40 text-white flex items-center justify-center shrink-0 shadow-[0_0_25px_#17A398]">
                <Compass size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    ORCHESTRATOR SYNTHESIS CORE
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Real-Time Consensus</span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  High-Confidence Coastal Clearance Verdict
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  All four agent stations align: sea surface temperatures overlap with chlorophyll bloom, swell chop is below small-boat hazard ceiling, and breeding sanctuaries remain clear.
                </p>
              </div>
            </div>

            {/* Final Go Verdict Stamp */}
            <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
              <span className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-serif font-bold text-sm uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(63,163,92,0.3)]">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>CLEARED TO SAIL · GO</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Synthesis Score: <strong className="text-white">88/100</strong>
              </span>
            </div>
          </div>

          {/* 4-Station Convergence Flow Indicator */}
          <div className="pt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-white/5 border border-teal-500/20 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#17A398]" />
              <span className="text-slate-300 truncate">Ocean: 88/100 (Pass)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5 border border-blue-500/20 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4C7FE0]" />
              <span className="text-slate-300 truncate">Weather: 84/100 (Pass)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5 border border-purple-500/20 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
              <span className="text-slate-300 truncate">History: 82/100 (Pass)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5 border border-emerald-500/20 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#3FA35C]" />
              <span className="text-slate-300 truncate">Sustain: 100/100 (Clear)</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
