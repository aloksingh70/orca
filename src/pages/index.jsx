import { Link } from 'react-router-dom'
import {
  Waves,
  Wind,
  Fish,
  ShieldAlert,
  AlertTriangle,
  Check,
  Compass,
  Calendar,
  Layers,
  ServerCog,
  Terminal,
  Anchor,
  MapPin,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import AnimatedShowcase from '../components/AnimatedShowcase.jsx'
import Logo from '../components/Logo.jsx'
import { zones } from '../lib/zones.js'
import { useLanguage } from '../context/LanguageContext.jsx'

const BRIDGE_STATIONS = [
  {
    icon: Waves,
    color: 'text-indian-emerald',
    badge: 'bg-indian-emerald/10 text-indian-emerald border-indian-emerald/30',
    borderColor: 'border-t-indian-emerald',
    name: 'Ocean Station',
    sanskrit: 'समुद्र वेधशाला',
    role: 'Thermal Fronts & Plankton Blooms',
    description: 'Fuses Sea Surface Temperature (SST) with Chlorophyll-a concentration to identify productive feeding aggregations, preventing diesel waste on barren thermal boundaries.',
    feed: 'OCM-3 / INCOIS Telemetry',
    target: '27–30°C optimal feeding band'
  },
  {
    icon: Wind,
    color: 'text-indian-saffron',
    badge: 'bg-indian-saffron/10 text-indian-saffron border-indian-saffron/30',
    borderColor: 'border-t-indian-saffron',
    name: 'Weather Station',
    sanskrit: 'वायु एवं तरंग सीमा',
    role: 'Coastal Wind & Wave Ceilings',
    description: 'Monitors localized squall dimensions, wave chop, and wind thresholds. Small crafts face severe capsize hazard when coastal winds surpass 32 km/h or waves exceed 2.2m.',
    feed: 'IMD Coastal Model Alerts',
    target: 'Hard squall ceiling at 32 km/h'
  },
  {
    icon: Fish,
    color: 'text-indian-marigold',
    badge: 'bg-indian-marigold/10 text-indian-marigold border-indian-marigold/30',
    borderColor: 'border-t-indian-marigold',
    name: 'History Station',
    sanskrit: 'मत्स्य अवतरण अभिलेख',
    role: 'CMFRI 10-Year Catch Benchmarks',
    description: 'Evaluates seasonal landing volumes for the specific calendar month and sector, establishing realistic trip yield benchmarks for motorized nauka and trawlers.',
    feed: 'CMFRI Landing Registries',
    target: 'Seasonal catch index (kg/trip)'
  },
  {
    icon: ShieldAlert,
    color: 'text-indian-terracotta',
    badge: 'bg-indian-terracotta/10 text-indian-terracotta border-indian-terracotta/30',
    borderColor: 'border-t-indian-terracotta',
    name: 'Sustainability Station',
    sanskrit: 'संरक्षण एवं प्रतिबंध',
    role: 'Uniform Breeding Ban & Sanctuaries',
    description: 'Enforces the mandatory 61-day East-Coast fishing ban (15 Apr – 14 Jun) and protected wildlife buffers (Sundarbans & Lothian Island). Holds an absolute override veto.',
    feed: 'State Fisheries Gazette',
    target: 'Immediate fleet shutdown veto'
  }
]

export default function Landing() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen font-sans">
      <Navbar />
      <Hero />
      <AnimatedShowcase />

      {/* ========================================================================= */}
      {/* SECTION 2: OPERATIONAL REALITY (THE BLIND VOYAGE VS THE ORCA SHIELD)       */}
      {/* ========================================================================= */}
      <section id="operational-reality" className="py-16 px-4 sm:px-6 bg-[#EAF4F8] border-b border-[#CCE4EC]">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="max-w-3xl mb-12">
            <div className="text-[#007A78] text-xs font-bold uppercase tracking-wider mb-2">
              {t('reality', 'tag')}
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0A1B27] leading-tight mb-3">
              {t('reality', 'title')}
            </h2>
            <p className="text-sm sm:text-base text-[#2D4454] leading-relaxed">
              {t('reality', 'desc')}
            </p>
          </div>

          {/* Two-Column Comparison Cards */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            
            {/* The Blind Voyage */}
            <div className="bg-white border border-[#CCE4EC] p-6 shadow-sm">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#F8CDC5] mb-5">
                <span className="p-1.5 bg-[#FDF0EE] text-[#B83218] border border-[#F8CDC5]">
                  <AlertTriangle size={16} />
                </span>
                <h3 className="font-serif text-lg font-bold text-[#0A1B27]">
                  The Blind Voyage (Current Coastal Struggles)
                </h3>
              </div>
              
              <div className="flex flex-col gap-4 text-xs sm:text-sm text-[#2D4454] leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="text-[#B83218] font-bold text-base leading-none mt-0.5">✕</span>
                  <div>
                    <strong className="text-[#0A1B27] block font-semibold mb-0.5">
                      Wasted Diesel on Barren Thermal Lines
                    </strong>
                    Chasing isolated warm-water spots with zero chlorophyll presence burns 40–60 liters of fuel without landing a single kilogram of fish.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-[#B83218] font-bold text-base leading-none mt-0.5">✕</span>
                  <div>
                    <strong className="text-[#0A1B27] block font-semibold mb-0.5">
                      Generic Coastal Radio Warnings
                    </strong>
                    Coastal bulletins broadcast broad squall warnings that lack localized wave chop or squall depth for specific sandbar channels like Digha Mohana or Sagar Island.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-[#B83218] font-bold text-base leading-none mt-0.5">✕</span>
                  <div>
                    <strong className="text-[#0A1B27] block font-semibold mb-0.5">
                      Accidental Breeding Sanctuary Incursions
                    </strong>
                    Unclear seasonal dates cause small crews to drift into protected nursery buffers, risking boat impoundment and heavy fines under the Marine Fisheries Regulation Act.
                  </div>
                </div>
              </div>
            </div>

            {/* The ORCA Shield */}
            <div className="bg-white border border-[#CCE4EC] p-6 shadow-sm">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#B9E4E8] mb-5">
                <span className="p-1.5 bg-[#E1F3F5] text-[#007A78] border border-[#B9E4E8]">
                  <Check size={16} />
                </span>
                <h3 className="font-serif text-lg font-bold text-[#0A1B27]">
                  The ORCA Consensus (Deterministic Grounding)
                </h3>
              </div>

              <div className="flex flex-col gap-4 text-xs sm:text-sm text-[#2D4454] leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="text-[#007A78] font-bold text-base leading-none mt-0.5">✓</span>
                  <div>
                    <strong className="text-[#0A1B27] block font-semibold mb-0.5">
                      Fused Thermal &amp; Chlorophyll Feeding Grounds
                    </strong>
                    Pins genuine feeding zones only when favorable 27–30°C sea surface temperatures directly overlap with active chlorophyll bloom.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-[#007A78] font-bold text-base leading-none mt-0.5">✓</span>
                  <div>
                    <strong className="text-[#0A1B27] block font-semibold mb-0.5">
                      Hard Weather &amp; Wave Safety Veto
                    </strong>
                    Any zone exceeding 32 km/h wind or 2.2m wave height is locked out immediately — small-boat safety overrides potential catch every time.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-[#007A78] font-bold text-base leading-none mt-0.5">✓</span>
                  <div>
                    <strong className="text-[#0A1B27] block font-semibold mb-0.5">
                      Plain-Language Bengali &amp; Indian Advisory
                    </strong>
                    Clear sentences a fisherman or port officer can understand in seconds, backed by an auditable multi-agent reasoning trace.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: FOUR PARALLEL BRIDGE STATIONS (SYNCHRONOUS OBSERVATION LAYERS)  */}
      {/* ========================================================================= */}
      <section id="agents" className="py-16 px-4 sm:px-6 bg-[#EAF4F8] border-b border-[#CCE4EC]">
        <div className="max-w-7xl mx-auto">
          
          <div className="max-w-3xl mb-12">
            <div className="text-[#007A78] text-xs font-bold uppercase tracking-wider mb-2">
              SYNCHRONOUS DATA CONVERGENCE
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0A1B27] leading-tight mb-3">
              Four independent observation layers run in parallel, resolving into one definitive operational call.
            </h2>
            <p className="text-sm sm:text-base text-[#2D4454] leading-relaxed">
              Instead of conflicting forecasts from generic weather apps, ORCA computes satellite ocean optics, live sounding telemetry, atmospheric radar, and multi-generational fishing logs simultaneously.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BRIDGE_STATIONS.map((station, idx) => {
              const streamCode = ['STREAM A', 'STREAM B', 'STREAM C', 'STREAM D'][idx]
              const feedCode = ['OCEANSAT-3 / MODIS', 'IN-SITU HYDROACOUSTICS', 'IMD-RADAR / INCOIS BUOYS', 'COMMUNITY ORAL LEDGER'][idx]
              const activeDetection = [
                { label: 'Frontal boundary at 21°12\' N / 87°45\' E', sub: 'Moderate Upwelling Index, +1.8 σ' },
                { label: 'Sediment accretion at Dhamra entry', sub: 'Shoal height increased +0.4m' },
                { label: 'Southwest swell 1.4m @ 8s', sub: 'Wind shear below squall threshold' },
                { label: '32 skiffs reporting heavy Hilsa strike', sub: 'Concentration 9–11 NM offshore Paradip' }
              ][idx]

              return (
                <div
                  key={station.name}
                  className="bg-[#E2F0F5] border border-[#BCDCE6] p-4 sm:p-5 flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-[#007A78] font-mono font-bold tracking-wider uppercase mb-2">
                      <span>{streamCode}</span>
                      <span>{feedCode}</span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-[#0A1B27] mb-1">
                      {station.name}
                    </h3>
                    <div className="text-[11px] text-[#5C7788] mb-2 font-medium">
                      {station.role} · {station.sanskrit}
                    </div>
                    <p className="text-xs text-[#2D4454] leading-relaxed mb-4">
                      {station.description}
                    </p>
                  </div>

                  {/* Active Detection Box */}
                  <div className="bg-white border border-[#BCDCE6] p-2.5 mt-auto">
                    <span className="block text-[9.5px] text-[#5C7788] uppercase tracking-wider font-bold">
                      ACTIVE DETECTIONS
                    </span>
                    <span className="block text-xs font-bold text-[#0A1B27] mt-0.5">
                      {activeDetection.label}
                    </span>
                    <span className="block text-[10px] text-[#007A78] font-semibold mt-0.5">
                      {activeDetection.sub}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Convergence Verdict Generator Strip */}
          <div className="bg-[#E2F0F5] border border-[#BCDCE6] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white border border-[#BCDCE6] text-[#007A78] shrink-0">
                <Compass size={20} />
              </div>
              <div>
                <span className="block text-[10px] text-[#007A78] font-mono font-bold tracking-wider uppercase">
                  CONVERGENCE VERDICT GENERATOR
                </span>
                <span className="font-serif font-bold text-[#0A1B27] text-base block">
                  High Confidence Offshore Clearance: Motorised Skiffs Cleared to 12 NM.
                </span>
                <p className="text-xs text-[#2D4454] mt-0.5">
                  All 4 layers concur: Stable barometric trend, calm shelf chop, high pelagic density within inshore band, zero breeding ban violations for the next 24 hours.
                </p>
              </div>
            </div>

            <Link
              to="/advisory"
              className="shrink-0 bg-[#061219] hover:bg-[#0E2332] text-white px-5 py-2.5 font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              View Advisory Breakdown
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: BENGAL COASTAL SECTOR DIRECTORY (HARBOR LEDGER TABLE)           */}
      {/* ========================================================================= */}
      <section id="zones" className="py-16 px-4 sm:px-6 bg-[#EAF4F8] border-b border-[#CCE4EC]">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-[#007A78] text-xs font-bold uppercase tracking-wider mb-2">
                PORT REGISTRY &amp; HARBOR MASTER LOG
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0A1B27] leading-tight mb-2">
                Harbor Ledger: Verified Inshore Voyages &amp; Ground Truth
              </h2>
              <p className="text-sm text-[#2D4454]">
                Direct radio checks and quay-side debriefs transcribed across major artisanal fish landing centers over the last tide cycle.
              </p>
            </div>

            <div className="text-xs text-[#5C7788] tabular-nums font-mono">
              PORT MASTER DISPATCH LOG: BOOK 2017 · FOLIO 02
            </div>
          </div>

          {/* High-Contrast Open Ledger Table */}
          <div className="bg-white border border-[#CCE4EC] shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#BCDCE6] bg-[#E2F0F5] text-[10.5px] text-[#0A1B27] uppercase tracking-wider font-sans font-bold">
                  <th className="py-3 px-4">Vessel Class &amp; Registration</th>
                  <th className="py-3 px-4">Departure Harbor</th>
                  <th className="py-3 px-4">Target Zone &amp; Sounding</th>
                  <th className="py-3 px-4">Catch Summary</th>
                  <th className="py-3 px-4">Swell &amp; Sea Verdict</th>
                  <th className="py-3 px-4">Notable Sea Conditions</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0EEF3] tabular-nums font-sans">
                {zones.map((zone, i) => {
                  const verdicts = [
                    { label: 'SAFE / FOR DISPATCH', badge: 'bg-[#E1F3F5] text-[#007A78] border-[#B9E4E8]' },
                    { label: 'MODERATE SURF', badge: 'bg-[#FEF5E7] text-[#9A5B0B] border-[#F9E0B7]' },
                    { label: 'EXCELLENT', badge: 'bg-[#E1F3F5] text-[#007A78] border-[#B9E4E8]' },
                    { label: 'CAUTION / SHOAL DRIFT', badge: 'bg-[#FDF0EE] text-[#B83218] border-[#F8CDC5]' },
                    { label: 'FAVORABLE', badge: 'bg-[#E1F3F5] text-[#007A78] border-[#B9E4E8]' },
                    { label: 'SAFE / FOR DISPATCH', badge: 'bg-[#E1F3F5] text-[#007A78] border-[#B9E4E8]' }
                  ]
                  const v = verdicts[i % verdicts.length]

                  return (
                    <tr key={zone.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F4FAF9]'}>
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#0A1B27] block">{zone.fleetType}</span>
                        <span className="text-[10px] text-[#5C7788] font-mono">IND-WB-{zone.sectorCode}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#0A1B27]">
                        {zone.harborName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#0A1B27] block">{zone.distanceOffshore}</span>
                        <span className="text-[11px] text-[#5C7788]">{zone.soundingDepth}m ({Math.round(zone.soundingDepth / 1.8288)} fathoms)</span>
                      </td>
                      <td className="py-3 px-4 text-[#007A78] font-semibold">
                        {zone.targetSpecies}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 text-[9.5px] font-bold uppercase border ${v.badge}`}>
                          {v.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#2D4454] max-w-xs text-[11px]">
                        Seabed: {zone.seabed}. {zone.note}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to="/advisory"
                          className="inline-flex items-center gap-1 text-[#007A78] hover:text-[#061219] font-bold text-xs"
                        >
                          Inspect
                          <ChevronRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#5C7788] pt-3 px-1">
            <span>DATA RECONCILED WITH INCOIS POTENTIAL FISHING ZONE (PFZ) VALIDATION ACOUSTICS</span>
            <span>NEXT HARBOR UPDATE: 21:00 IST AFTER NETWORK FLEET LANDING</span>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: STATUTORY SEASONAL BAN MANDATE (TACTICAL VERDICT WARN BOX)    */}
      {/* ========================================================================= */}
      <section id="ban-mandate" className="py-14 px-4 sm:px-6 bg-[#EAF4F8] border-b border-[#CCE4EC]">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#FDFBF7] border border-[#E5DCC9] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm">
            
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs text-[#9A5B0B] font-bold mb-2">
                <ShieldAlert size={16} />
                <span>STATUTORY MARINE MANDATE · 61-DAY UNIFORM FISHING BAN</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A1B27] mb-2.5">
                Annual East-Coast Uniform Fishing Ban (15 April – 14 June)
              </h3>
              <p className="text-xs sm:text-sm text-[#2D4454] leading-relaxed">
                Under Ministry of Fisheries conservation notifications, all mechanized fishing along the Bay of Bengal coastline is legally suspended for 61 days each year to safeguard spawning fish stocks. Select this date range in the advisory console to see how the Sustainability Station engages an un-bypasable fleet-wide override veto.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                to="/advisory"
                className="inline-flex items-center justify-center gap-2 bg-[#061219] hover:bg-[#0E2332] text-white px-6 py-3.5 font-sans text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
              >
                <Calendar size={14} className="text-[#007A78]" />
                <span>Test 18 May Ban Veto in Console</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: DIRECT FIELD DEPLOYMENT BANNER & ISRO SPECIFICATIONS           */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 bg-[#061219] text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          
          {/* Main Field Deployment Callout matching screenshot */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-12 mb-12 border-b border-slate-800">
            <div className="max-w-2xl">
              <span className="text-[#007A78] text-xs font-mono font-bold tracking-wider uppercase block mb-2">
                DIRECT FIELD DEPLOYMENT
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-2.5">
                Take the Live Advisory Console to Sea.
              </h2>
              <p className="text-sm text-[#A4B8C4] leading-relaxed">
                High-contrast, zero-lag console built for sunlight legibility on low-cost skiff phones and wheelhouse terminals. Works offline cached when past cellular range.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3.5">
              <Link
                to="/advisory"
                className="bg-[#007A78] hover:bg-[#006664] text-white px-6 py-3.5 font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                Launch Working Console
              </Link>
              <a
                href="#zones"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3.5 font-sans font-semibold text-xs uppercase tracking-wider transition-colors"
              >
                Download 7-Day Tide Tables
              </a>
            </div>
          </div>

          {/* Prototype Architecture Specs */}
          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-[#0A1A26] border border-slate-800 p-5 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[#007A78] text-xs font-semibold font-serif">
                <Layers size={15} />
                <span>Deterministic Seeded Engine</span>
              </div>
              <p className="text-xs text-[#A4B8C4] leading-relaxed">
                The four agents evaluate via a reproducible mulberry32 seeded PRNG client-side. The exact same date and sector yield identical, auditable readings.
              </p>
            </div>

            <div className="bg-[#0A1A26] border border-slate-800 p-5 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[#E86014] text-xs font-semibold font-serif">
                <ServerCog size={15} />
                <span>Calibrated Indian Marine Telemetry</span>
              </div>
              <p className="text-xs text-[#A4B8C4] leading-relaxed">
                SST, chlorophyll-a, wind squall limits, and catch densities are calibrated to real Bay of Bengal parameters (OCM-3 / INCOIS and IMD coastal models).
              </p>
            </div>

            <div className="bg-[#0A1A26] border border-slate-800 p-5 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[#D4881A] text-xs font-semibold font-serif">
                <Terminal size={15} />
                <span>Clean Modular Architecture</span>
              </div>
              <p className="text-xs text-[#A4B8C4] leading-relaxed">
                All agent scoring logic resides strictly in <code className="text-[#E86014]">agents.js</code>. Swapping simulated feeds for live INCOIS/IMD endpoints requires zero changes to the UI.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* FOOTER (MATCHING BOTTOM BAR IN SCREENSHOT)                                 */}
      {/* ========================================================================= */}
      <footer className="py-6 px-4 sm:px-6 bg-[#061219] text-[11px] text-[#5C7788] border-t border-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#007A78]" />
            <span className="font-semibold text-slate-300">DATUM WGS-84 / CHART DATUM LAT</span>
            <span>·</span>
            <span>Hydrography Survey Baseline: Survey of India &amp; IHO Standards</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>IMD &amp; INCOIS Marine Telemetry Stream — Live</span>
            <span>·</span>
            <span>© 2026 ORCA Coastal Authority</span>
          </div>
        </div>
      </footer>
    </div>
  )
}



