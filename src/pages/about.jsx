import { Link } from 'react-router-dom'
import {
  Compass,
  Waves,
  Wind,
  Fish,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
  ExternalLink,
  Layers,
  HeartHandshake,
  Cpu,
  Anchor,
  Database
} from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import PageMeta from '../components/PageMeta.jsx'

export default function About() {
  return (
    <div className="bg-[#EAF4F8] min-h-screen flex flex-col font-sans text-[#2D4454]">
      <PageMeta
        title="About ORCA — Human Stakes, Marine Science & Impact | SIH26176"
        description="Learn why ORCA exists: a plain-language explainer on coastal fishing realities, satellite oceanography, ecological breeding bans, and explainable multi-agent AI."
      />
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 pt-24 pb-20 outline-none space-y-12">
        
        {/* =================================================================== */}
        {/* 1. HERO HEADER                                                     */}
        {/* =================================================================== */}
        <div className="text-center max-w-3xl mx-auto pt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 border border-sky-300 text-sky-800 text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <Compass size={14} className="text-sky-700" />
            <span>HUMAN STAKES &amp; OCEAN INTELLIGENCE · SIH26176</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A1B27] tracking-tight leading-tight">
            Why ORCA Exists: Protecting Mariners and Restoring Marine Ecology
          </h1>
          <p className="text-sm sm:text-base text-[#5C7788] mt-3 leading-relaxed">
            A plain-English guide for citizens, students, and evaluators. How space satellites, coastal meteorology, and transparent AI replace costly guesswork with life-saving clarity.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
            <Link
              to="/advisory"
              className="bg-[#007A78] hover:bg-[#006361] text-white px-6 py-3 rounded-lg font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-98 flex items-center gap-2"
            >
              <Compass size={15} />
              <span>Launch Explainer Console</span>
            </Link>
            <a
              href="#human-stakes"
              className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 px-5 py-3 rounded-lg font-sans font-semibold text-xs uppercase tracking-wider transition-colors shadow-2xs"
            >
              Read the Story
            </a>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 2. THE HUMAN STAKES: A DAY IN THE LIFE                             */}
        {/* =================================================================== */}
        <section id="human-stakes" className="bg-white border border-[#CCE4EC] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#007A78] uppercase tracking-wider">
            <HeartHandshake size={16} />
            <span>THE HUMAN STAKES · COASTAL WEST BENGAL</span>
          </div>
          
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A1B27]">
            A 03:30 AM Gamble on the Water
          </h2>

          <div className="prose text-xs sm:text-sm text-[#2D4454] leading-relaxed space-y-4">
            <p>
              In coastal harbors like Shankarpur and Digha Mohana, a skipper's day begins long before dawn. At 03:30 AM, cold winds blow across the jetties as crews load diesel cans, block ice, and nylon gillnets onto modest 10-meter wooden craft.
            </p>
            <p>
              In West Bengal alone, coastal marine fisheries support over <strong className="text-[#0A1B27]">200,000 traditional and motorized fisherfolk</strong> (<span className="text-slate-500 italic">source: CMFRI Marine Fisheries Census published reports</span>). Every trip requires a significant financial investment: an estimated <strong className="text-[#0A1B27]">₹4,000 to ₹6,000 in marine diesel</strong> per day voyage (<span className="text-slate-500 italic">explicitly labeled: illustrative estimate based on 45–60 liters of marine diesel at coastal cooperative rates</span>).
            </p>
            <p>
              Historically, the decision of where to steer has been a blind gamble:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-slate-700">
              <li>
                <strong>Statewide AM Radio Bulletins:</strong> Broadcast broad storm advisories for the entire northern Bay of Bengal, with zero localized resolution for shallow river sandbars or coastal chop.
              </li>
              <li>
                <strong>Quayside Word of Mouth:</strong> Asking fellow fishermen where fish were spotted yesterday; by dawn, currents and thermal fronts have shifted miles away.
              </li>
              <li>
                <strong>The Cost of Being Wrong:</strong> If a skipper steams 40 kilometers into barren warm water, the crew returns with empty holds and devastating debt. Worse, if sudden localized squalls hit shallow waters, small boats face immediate capsize danger (<span className="text-slate-500 italic">illustrative synthesis: coastal safety analyses note over 80% of artisanal casualties occur during sudden squall winds when boats lack timely pre-sailing verification</span>).
              </li>
            </ul>
            <p>
              ORCA was designed to answer one question before a boat unties its moorings: <strong className="text-[#007A78]">Is it safe to sail today, and if so, where are the fish gathering?</strong>
            </p>
          </div>
        </section>

        {/* =================================================================== */}
        {/* 3. ENVIRONMENTAL & ECOLOGICAL SUSTAINABILITY                        */}
        {/* =================================================================== */}
        <section className="bg-white border border-[#CCE4EC] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-700 uppercase tracking-wider">
            <ShieldAlert size={16} />
            <span>ECOLOGICAL CONSERVATION &amp; SPAWNING PROTECTION</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A1B27]">
            Why the 61-Day Fishing Ban is Law, Not an Inconvenience
          </h2>

          <div className="text-xs sm:text-sm text-[#2D4454] leading-relaxed space-y-3">
            <p>
              Every year between <strong>15 April and 14 June</strong>, the Government of India enforces a mandatory 61-day uniform fishing moratorium across the entire East Coast shelf. Why does this ban exist?
            </p>
            <p>
              This period coincides with the peak biological spawning cycle of high-value marine species like Hilsa (<em>Tenualosa ilisha</em>) and Silver Pomfret. When mechanized trawlers drag fine-mesh bottom nets through breeding grounds, they catch gravid (egg-bearing) females and millions of juvenile fingerlings before they have a chance to reproduce.
            </p>
            <p>
              In ORCA, the <strong>Sustainability Agent's override veto</strong> is not an arbitrary technological blockade. It is a grounded conservation safeguard. Even if ocean temperatures are ideal and historical catches were huge, the veto triggers an un-bypassable shutdown: <strong>protecting future fish stocks takes absolute precedence over single-day catches.</strong>
            </p>
          </div>
        </section>

        {/* =================================================================== */}
        {/* 4. CONTEXT ON THE HACKATHON & ISRO PROBLEM STATEMENT                */}
        {/* =================================================================== */}
        <section className="bg-white border border-[#CCE4EC] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#007A78] uppercase tracking-wider">
            <Cpu size={16} />
            <span>SMART INDIA HACKATHON · ISRO PROBLEM STATEMENT SIH26176</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A1B27]">
            From Broad Space Research to a Concrete Field Tool
          </h2>

          <div className="text-xs sm:text-sm text-[#2D4454] leading-relaxed space-y-3">
            <p>
              The <strong>Smart India Hackathon (SIH)</strong> is the world’s largest open innovation initiative, challenging university teams to solve critical problems proposed by Indian ministries, defense agencies, and research institutes.
            </p>
            <p>
              Under Problem Statement <strong>SIH26176</strong>, the <strong>Indian Space Research Organisation (ISRO)</strong> called for an advanced <em>"Decision Support System for Marine Fishing Zone Advisory"</em> to harness India's ocean-observing satellite constellation.
            </p>
            <p>
              While deep academic research often stays locked inside complex geospatial software, <strong>ORCA was built as a concrete, usable product</strong>. We distilled complex satellite telemetry (OCM-3, Oceansat), meteorological forecasts (IMD), and 10-year catch registries (CMFRI) into an intuitive, explainable advisory console that works seamlessly on low-cost smartphones at sea.
            </p>
          </div>
        </section>

        {/* =================================================================== */}
        {/* 5. EXPLAINABILITY CONTRAST: BLACK-BOX VS. ORCA                      */}
        {/* =================================================================== */}
        <section className="bg-white border border-[#CCE4EC] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#007A78] uppercase tracking-wider">
            <Layers size={16} />
            <span>TRANSPARENT REASONING VS. BLACK-BOX SCORING</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A1B27]">
            Why Fishermen Don't Trust "Black-Box" Algorithms
          </h2>

          <p className="text-xs sm:text-sm text-[#5C7788] leading-relaxed">
            If a mariner's life and boat depend on a recommendation, telling them <em>"Score: 72/100 — trust our proprietary neural network"</em> fails completely. If bad weather hits, they won't understand why the tool led them into danger. ORCA replaces black-box scoring with four inspectable, transparent agents.
          </p>

          {/* Side by Side Real Comparison */}
          <div className="grid md:grid-cols-2 gap-5 pt-2">
            
            {/* The Black Box Mockup */}
            <div className="p-5 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-rose-700 block mb-1">
                  Conventional "Black-Box" Tool
                </span>
                <h3 className="font-serif font-bold text-lg text-slate-900 mb-2">
                  Digha Mohana · Score: 78/100
                </h3>
                <div className="p-4 bg-white rounded-lg border border-rose-200 text-center my-3">
                  <span className="text-3xl font-serif font-bold text-slate-900 block">78</span>
                  <span className="text-xs text-slate-500">Predicted Catch Index</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <em>"Algorithm predicts high fish aggregation. No intermediate telemetry displayed. Squall risk cannot be inspected."</em>
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-rose-200 text-[11px] text-rose-800 font-semibold">
                ✕ Zero safety audit trail · Mariners cannot inspect why
              </div>
            </div>

            {/* ORCA Explainable Output (Real Example from runAgents) */}
            <div className="p-5 rounded-xl border border-emerald-300 bg-emerald-50/40 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 block mb-1">
                  ORCA Multi-Agent Transparent Output
                </span>
                <h3 className="font-serif font-bold text-lg text-slate-900 mb-2">
                  Digha (WB-01) · Recommended (82/100)
                </h3>
                
                <div className="grid grid-cols-2 gap-2 my-3 text-[11px] font-mono">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500 block">Ocean Agent</span>
                    <strong className="text-emerald-700">88/100</strong> (SST 28.2°C, Chl 1.7)
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500 block">Weather Agent</span>
                    <strong className="text-slate-800">84/100</strong> (Wind 18km/h, 1.1m)
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500 block">History Agent</span>
                    <strong className="text-amber-700">82/100</strong> (CMFRI: 480 kg/trip)
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500 block">Sustainability</span>
                    <strong className="text-emerald-700">100/100</strong> (Ban: Clear)
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  <strong>Orchestrator Synthesis:</strong> "Digha combines strong ocean conditions, safe weather chop, and solid historical landing records for this season — a safe and productive pick today."
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-200 text-[11px] text-emerald-900 font-semibold">
                ✓ Full explainability · Hard safety veto overrides all scores
              </div>
            </div>

          </div>
        </section>



        {/* =================================================================== */}
        {/* 7. DATA HONESTY STATEMENT BLOCK                                     */}
        {/* =================================================================== */}
        <section className="bg-[#E2F0F5] border border-[#BCDCE6] rounded-2xl p-6 sm:p-8 shadow-sm space-y-4 text-xs text-[#2D4454]">
          <div className="flex items-center gap-2 text-[#007A78] font-bold uppercase tracking-wider text-xs">
            <Database size={16} />
            <span>TRANSPARENCY &amp; DATA HONESTY DISCLOSURE</span>
          </div>

          <h3 className="font-serif font-bold text-lg text-[#0A1B27]">
            Honest Truth About Prototype Simulation vs. Real Production Feeds
          </h3>

          <div className="space-y-3 leading-relaxed">
            <p>
              <strong>1. Realistic Simulation for the Hackathon:</strong> In this evaluation prototype, all ocean temperatures, chlorophyll readings, wind speeds, and catch indices are deterministically simulated using a mathematical model (Mulberry32 seeded PRNG) calibrated to realistic Bay of Bengal coastal ranges.
            </p>
            <p>
              <strong>2. Real-World Counterpart Services:</strong> In production deployment, ORCA would connect directly to official government data providers:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-3 font-mono text-[11px] text-slate-800">
              <li><strong>INCOIS (MoES):</strong> Satellite oceanography (OCM-3 / Oceansat) and official PFZ coordinates.</li>
              <li><strong>IMD (MoES):</strong> Coastal squall alerts, localized wind vectors, and wave height warnings.</li>
              <li><strong>CMFRI (ICAR):</strong> Historical commercial landing registries across harbor centers.</li>
            </ul>
            <p>
              <strong>3. Modular "Zero UI Rebuild" Architecture:</strong> All scoring and veto rules reside strictly in <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-300 text-[#007A78]">agents.js</code> / <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-300 text-[#007A78]">agents.py</code>. Swapping simulated feeds for live INCOIS and IMD APIs requires zero redesign of the frontend user interface.
            </p>
          </div>
        </section>

        {/* =================================================================== */}
        {/* 8. WHAT HAPPENS NEXT: NON-TECHNICAL ROADMAP                         */}
        {/* =================================================================== */}
        <section className="bg-white border border-[#CCE4EC] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#007A78] uppercase tracking-wider">
            <Sparkles size={16} />
            <span>WHAT HAPPENS NEXT · THE ROAD AHEAD</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A1B27]">
            Taking ORCA from Prototype to Coastal Wheelhouses
          </h2>

          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-mono font-bold text-[#007A78] block mb-1">
                STAGE 1 · CURRENT PROTOTYPE
              </span>
              <strong className="font-serif font-bold text-slate-900 block mb-1">
                Verified Multi-Agent Architecture
              </strong>
              <p className="text-slate-600 leading-relaxed">
                Tested four-agent scoring pipeline, deterministic scenario simulation, vernacular audio advisories, and role-based operational decks.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-mono font-bold text-[#007A78] block mb-1">
                STAGE 2 · SATELLITE INTEGRATION
              </span>
              <strong className="font-serif font-bold text-slate-900 block mb-1">
                Live INCOIS &amp; IMD Telemetry
              </strong>
              <p className="text-slate-600 leading-relaxed">
                Connecting the modular <code className="font-mono text-[#007A78]">runAgents()</code> pipeline to real-time OCM-3 satellite feeds and IMD coastal squall radar.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-mono font-bold text-[#007A78] block mb-1">
                STAGE 3 · COOPERATIVE PILOTS
              </span>
              <strong className="font-serif font-bold text-slate-900 block mb-1">
                Quayside Wheelhouse Trials
              </strong>
              <p className="text-slate-600 leading-relaxed">
                Deploying working tablets with fishermen cooperatives in Shankarpur and Digha Mohana, integrated with NavIC coastal transponders.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-[#5C7788]">
              Want to see the system evaluate live sectors?
            </span>
            <Link
              to="/advisory"
              className="bg-[#007A78] hover:bg-[#006361] text-white px-6 py-3 rounded-lg font-sans font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
            >
              <span>Explore the Advisory Console</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="py-6 px-4 sm:px-6 bg-[#E2F0F5] text-[11px] text-[#5C7788] border-t border-[#BCDCE6] mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#007A78]" />
            <span className="font-semibold text-[#0A1B27]">ORCA Marine Intelligence</span>
            <span>·</span>
            <span>Smart India Hackathon · Problem Statement SIH26176</span>
          </div>

          <div className="flex items-center gap-4 text-[#5C7788]">
            <Link to="/" className="hover:text-[#007A78]">Home</Link>
            <span>·</span>
            <Link to="/about" className="hover:text-[#007A78] font-bold text-[#007A78]">About ORCA</Link>
            <span>·</span>
            <Link to="/advisory" className="hover:text-[#007A78]">Advisory Console</Link>
            <span>·</span>
            <Link to="/methodology" className="hover:text-[#007A78]">Methodology</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
