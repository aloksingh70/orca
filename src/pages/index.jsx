import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  ChevronRight,
  Radio,
  Ship
} from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import AnimatedShowcase from '../components/AnimatedShowcase.jsx'
import FAQ from '../components/FAQ.jsx'
import PageMeta from '../components/PageMeta.jsx'
import { zones } from '../lib/zones.js'
import { REGIONS } from '../lib/regions.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const BRIDGE_STATIONS = [
  {
    icon: Waves,
    color: 'text-[#007A78]',
    badge: 'bg-[#E1F3F5] text-[#007A78] border-[#B9E4E8]',
    borderColor: 'border-t-[#007A78]',
    name: 'Ocean Station',
    sanskrit: 'समुद्र वेधशाला',
    role: 'Thermal Fronts & Plankton Blooms',
    description: 'Fuses Sea Surface Temperature (SST) with Chlorophyll-a concentration to identify productive feeding aggregations, preventing diesel waste on barren thermal boundaries.',
    feed: 'OCM-3 / INCOIS Telemetry',
    target: '27–30°C optimal feeding band'
  },
  {
    icon: Wind,
    color: 'text-[#E86014]',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    borderColor: 'border-t-[#E86014]',
    name: 'Weather Station',
    sanskrit: 'वायु एवं तरंग सीमा',
    role: 'Coastal Wind & Wave Ceilings',
    description: 'Monitors localized squall dimensions, wave chop, and wind thresholds. Small crafts face severe capsize hazard when coastal winds surpass 32 km/h or waves exceed 2.2m.',
    feed: 'IMD Coastal Model Alerts',
    target: 'Hard squall ceiling at 32 km/h'
  },
  {
    icon: Fish,
    color: 'text-amber-700',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    borderColor: 'border-t-amber-500',
    name: 'History Station',
    sanskrit: 'मत्स्य अवतरण अभिलेख',
    role: 'CMFRI 10-Year Catch Benchmarks',
    description: 'Evaluates seasonal landing volumes for the specific calendar month and sector, establishing realistic trip yield benchmarks for motorized nauka and trawlers.',
    feed: 'CMFRI Landing Registries',
    target: 'Seasonal catch index (kg/trip)'
  },
  {
    icon: ShieldAlert,
    color: 'text-rose-700',
    badge: 'bg-rose-50 text-rose-800 border-rose-200',
    borderColor: 'border-t-rose-600',
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
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [activeRegionFilter, setActiveRegionFilter] = useState('all')

  const displayedZones = activeRegionFilter === 'all'
    ? zones
    : zones.filter((z) => z.regionId === activeRegionFilter)

  // Intercept any interactive button/action clicks for unauthenticated visitors while allowing scrolling
  const handleLandingClickCapture = (e) => {
    if (isAuthenticated) return

    // 1. Allow Language selector dropdown interactions so visitor can change language & read
    if (
      e.target.closest('[data-allow-guest="true"]') ||
      e.target.closest('.language-selector-wrapper') ||
      e.target.closest('.language-menu') ||
      e.target.closest('button[title*="Language"]')
    ) {
      return
    }

    // 2. Allow mobile hamburger button toggle so phone users can open/close drawer
    if (e.target.closest('[data-mobile-toggle="true"]')) {
      return
    }

    // 3. In-page anchor links that scroll the page (e.g. href="#faq", href="/#operational-reality", etc.) and Home/Overview logo links
    const anchor = e.target.closest('a')
    if (anchor) {
      const href = anchor.getAttribute('href') || ''
      if (
        href === '/' ||
        href === '/overview' ||
        href === '/landing' ||
        href.startsWith('#') ||
        href.startsWith('/#') ||
        (href.includes('#') && !href.startsWith('http') && !href.startsWith('/advisory') && !href.startsWith('/regions'))
      ) {
        return // Allow home link and in-page scroll navigation!
      }
      // Any other link (e.g., /advisory, /regions, /about, /methodology)
      e.preventDefault()
      e.stopPropagation()
      navigate('/login', { state: { from: href || '/advisory', reason: 'action_required' } })
      return
    }

    // 4. Any button element or clickable role (scan simulation, inspect, corridor buttons, filters, etc.)
    const button = e.target.closest('button, [role="button"]')
    if (button) {
      e.preventDefault()
      e.stopPropagation()
      navigate('/login', { state: { from: '/advisory', reason: 'action_required' } })
      return
    }
  }

  return (
    <div
      onClickCapture={handleLandingClickCapture}
      className="min-h-screen bg-[#EAF4F8] text-[#2D4454] font-sans selection:bg-[#007A78] selection:text-white w-full max-w-full overflow-x-hidden"
    >
      <PageMeta
        title="ORCA — Marine Fishing Zone Advisory | SIH26176"
        description="Operational marine harvesting advisory and explainable AI safety intelligence for coastal mariners across India's maritime corridors."
      />

      <Navbar />

      <main id="main-content" tabIndex={-1} className="outline-none w-full max-w-full overflow-x-hidden">
        
        {/* SECTION 1: HYDROGRAPHIC HERO SECTION */}
        <Hero />

        {/* SECTION 2: INTERACTIVE ANIMATED SHOWCASE */}
        <AnimatedShowcase />

        {/* SECTION 3: OPERATIONAL REALITY (THE BLIND VOYAGE VS THE ORCA CONSENSUS) */}
        <section id="operational-reality" className="py-16 px-4 sm:px-6 bg-[#EAF4F8] border-b border-[#CCE4EC]">
          <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="max-w-3xl mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#007A78]/30 bg-[#E1F3F5] text-[#007A78] text-xs font-mono font-bold tracking-wider uppercase mb-3">
                <Radio size={13} className="text-[#007A78] animate-pulse" />
                <span>OPERATIONAL TRANSITION · THE BLIND VOYAGE VS THE ORCA SHIELD</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0A1B27] leading-tight mb-3">
                Bridging Satellite Telemetry to the Fisherman's Deck
              </h2>
              <p className="text-sm sm:text-base text-[#2D4454] leading-relaxed">
                Traditional marine operations force small-boat skippers to navigate with fragmented radio alerts, raw sea temperature maps, and word-of-mouth rumours. ORCA replaces guesswork with deterministic, parallel agent deliberation.
              </p>
            </div>

            {/* Two-Column Comparison Cards */}
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              
              {/* The Blind Voyage */}
              <div className="bg-white border border-[#CCE4EC] rounded-xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#F8CDC5] mb-5">
                  <span className="p-1.5 bg-[#FDF0EE] text-[#B83218] border border-[#F8CDC5] rounded-lg">
                    <AlertTriangle size={18} />
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0A1B27]">
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
                      Coastal bulletins broadcast broad squall warnings that lack localized wave chop or squall depth for specific sandbar channels like Digha Mohana or Sagar Roads.
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
              <div className="bg-white border border-[#CCE4EC] rounded-xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#B9E4E8] mb-5">
                  <span className="p-1.5 bg-[#E1F3F5] text-[#007A78] border border-[#B9E4E8] rounded-lg">
                    <Check size={18} />
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0A1B27]">
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
                        Plain-Language Multi-Lingual Advisory
                      </strong>
                      Clear sentences a fisherman, vessel skipper, or port officer can understand in seconds, backed by an auditable multi-agent reasoning trace.
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 4: FOUR PARALLEL BRIDGE STATIONS */}
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
                const Icon = station.icon

                return (
                  <div
                    key={station.name}
                    className={`bg-[#E2F0F5] border border-[#BCDCE6] ${station.borderColor} border-t-4 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-[#007A78] font-mono font-bold tracking-wider uppercase mb-2">
                        <span>{streamCode}</span>
                        <span>{feedCode}</span>
                      </div>

                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={18} className={station.color} />
                        <h3 className="font-serif text-lg font-bold text-[#0A1B27]">
                          {station.name}
                        </h3>
                      </div>
                      <div className="text-[11px] text-[#5C7788] mb-2 font-medium">
                        {station.role} · {station.sanskrit}
                      </div>
                      <p className="text-xs text-[#2D4454] leading-relaxed mb-4">
                        {station.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#BCDCE6]/80 flex flex-col gap-1 text-[11px]">
                      <span className="font-mono text-[#5C7788]">Telemetry: {station.feed}</span>
                      <span className="font-bold text-[#0A1B27]">{station.target}</span>
                    </div>
                  </div>
                )
              })}
            </div>

          </div>
        </section>

        {/* SECTION 5: PAN-INDIA COASTAL SECTOR DIRECTORY */}
        <section id="zones" className="py-16 px-4 sm:px-6 bg-[#EAF4F8] border-b border-[#CCE4EC]">
          <div className="max-w-7xl mx-auto">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#007A78]/30 bg-[#E1F3F5] text-[#007A78] text-xs font-mono font-bold tracking-wider uppercase mb-3">
                  <Ship size={13} className="text-[#007A78]" />
                  <span>NATIONAL PORT REGISTRY &amp; HARBOR MASTER LOG</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0A1B27] leading-tight mb-2">
                  Harbor Ledger: Verified Inshore Voyages Across 10 Major Ports
                </h2>
                <p className="text-sm text-[#5C7788] max-w-2xl">
                  Quay-side debriefs and real-time sensor evaluations transcribed across major Indian coastal ports over the current tide cycle.
                </p>
              </div>

              <div className="text-xs text-[#007A78] font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#007A78] animate-pulse" />
                <span>30+ MONITORED SECTORS ONLINE</span>
              </div>
            </div>

            {/* Regional Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs font-mono text-[#5C7788] mr-1">Filter Region:</span>
              <button
                type="button"
                onClick={() => setActiveRegionFilter('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeRegionFilter === 'all'
                    ? 'bg-[#007A78] text-white shadow-xs'
                    : 'bg-white text-[#2D4454] border border-[#CCE4EC] hover:border-[#007A78]'
                }`}
              >
                All Regions (10 Ports)
              </button>
              {REGIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveRegionFilter(r.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    activeRegionFilter === r.id
                      ? 'bg-[#007A78] text-white shadow-xs'
                      : 'bg-white text-[#2D4454] border border-[#CCE4EC] hover:border-[#007A78]'
                  }`}
                >
                  {r.shortName}
                </button>
              ))}
            </div>

            {/* Light Harbor Ledger Table */}
            <div className="rounded-xl border border-[#CCE4EC] bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#CCE4EC] bg-[#F0F7FA] text-[10.5px] text-[#007A78] uppercase tracking-wider font-mono font-bold">
                      <th className="py-3.5 px-4">Vessel Class &amp; Code</th>
                      <th className="py-3.5 px-4">Departure Harbor</th>
                      <th className="py-3.5 px-4">Target Zone &amp; Sounding</th>
                      <th className="py-3.5 px-4">Catch Summary</th>
                      <th className="py-3.5 px-4">Sea Verdict</th>
                      <th className="py-3.5 px-4">Notable Hydrography</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CCE4EC]/60 font-sans">
                    {displayedZones.map((zone, i) => {
                      const verdicts = [
                        { label: 'SAFE / DISPATCH', badge: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
                        { label: 'MODERATE SURF', badge: 'bg-amber-50 text-amber-800 border-amber-300' },
                        { label: 'OPTIMAL', badge: 'bg-teal-50 text-teal-800 border-teal-300' },
                        { label: 'CAUTION / SWELL', badge: 'bg-rose-50 text-rose-800 border-rose-300' }
                      ]
                      const v = verdicts[i % verdicts.length]

                      return (
                        <tr
                          key={zone.id}
                          className="hover:bg-[#F0F7FA]/70 transition-colors group"
                        >
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-[#0A1B27] block">{zone.fleetType}</span>
                            <span className="text-[10px] text-[#5C7788] font-mono">IND-{zone.sectorCode}</span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-[#0A1B27]">
                            {zone.harborName}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-[#0A1B27] block">{zone.distanceOffshore}</span>
                            <span className="text-[11px] text-[#5C7788] font-mono">{zone.soundingDepth}m Sounding</span>
                          </td>
                          <td className="py-3.5 px-4 text-[#007A78] font-semibold">
                            {zone.targetSpecies}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-block px-2 py-0.5 text-[9.5px] font-mono font-bold uppercase border rounded ${v.badge}`}>
                              {v.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#5C7788] max-w-xs text-[11px]">
                            Seabed: {zone.seabed}. {zone.note}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Link
                              to={isAuthenticated ? "/advisory" : "/login"}
                              state={{ from: '/advisory', reason: 'action_required' }}
                              className="inline-flex items-center gap-1 text-[#007A78] hover:text-[#061219] font-bold text-xs group-hover:translate-x-0.5 transition-all"
                            >
                              <span>Inspect</span>
                              <ChevronRight size={13} />
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#5C7788] pt-3 px-1">
              <span>DATA RECONCILED WITH INCOIS PFZ &amp; IMD MARINE WARNING CRITERIA</span>
              <span>SHOWING {displayedZones.length} OF {zones.length} REGISTERED HARBOR SECTORS</span>
            </div>

          </div>
        </section>

        {/* SECTION 6: STATUTORY SEASONAL BAN MANDATE */}
        <section id="ban-mandate" className="py-16 px-4 sm:px-6 bg-[#EAF4F8] border-b border-[#CCE4EC]">
          <div className="max-w-7xl mx-auto">
            <div className="bg-[#FDFBF7] border border-[#E5DCC9] rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-xs text-[#9A5B0B] font-bold mb-2">
                  <ShieldAlert size={16} />
                  <span>STATUTORY MARINE MANDATE · DUAL 61-DAY UNIFORM FISHING BANS</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A1B27] mb-2.5">
                  Annual Uniform Marine Fishing Moratoriums
                </h3>
                <p className="text-xs sm:text-sm text-[#2D4454] leading-relaxed mb-3">
                  Under statutory notifications issued by the Ministry of Fisheries, Animal Husbandry and Dairying (MoFAHD), mechanized and motorized fishing along India's EEZ is temporarily suspended for 61 days each year to safeguard spawning broodstock:
                </p>
                <div className="flex flex-wrap gap-2 text-xs font-mono font-bold">
                  <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg">
                    East Coast &amp; Andaman: 15 April – 14 June
                  </span>
                  <span className="px-3 py-1 bg-sky-50 text-sky-800 border border-sky-300 rounded-lg">
                    West Coast &amp; Lakshadweep: 01 June – 31 July
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                <Link
                  to={isAuthenticated ? "/advisory" : "/login"}
                  state={{ from: '/advisory', reason: 'action_required' }}
                  className="inline-flex items-center justify-center gap-2 bg-[#061219] hover:bg-[#0E2332] text-white px-6 py-3.5 font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
                >
                  <Calendar size={14} className="text-[#007A78]" />
                  <span>Test Seasonal Ban Veto</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: DIRECT FIELD DEPLOYMENT BANNER */}
        <section className="py-16 px-4 sm:px-6 bg-[#EAF4F8] text-[#2D4454] border-b border-[#CCE4EC]">
          <div className="max-w-7xl mx-auto">
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-12 mb-12 border-b border-[#CCE4EC]">
              <div className="max-w-2xl">
                <span className="text-[#007A78] text-xs font-mono font-bold tracking-wider uppercase block mb-2">
                  DIRECT FIELD DEPLOYMENT
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0A1B27] mb-2.5">
                  Take the Live Advisory Console to Sea.
                </h2>
                <p className="text-sm text-[#5C7788] leading-relaxed">
                  High-contrast, zero-lag console built for sunlight legibility on low-cost skiff phones and wheelhouse terminals. Works offline cached when past cellular range.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3.5">
                <Link
                  to={isAuthenticated ? "/advisory" : "/login"}
                  state={{ from: '/advisory', reason: 'action_required' }}
                  className="bg-[#007A78] hover:bg-[#006361] text-white px-6 py-3.5 font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-98 rounded-lg"
                >
                  Launch Working Console
                </Link>
                <Link
                  to={isAuthenticated ? "/regions" : "/login"}
                  state={{ from: '/regions', reason: 'action_required' }}
                  className="bg-white hover:bg-slate-50 text-[#0A1B27] border border-[#CCE4EC] px-6 py-3.5 font-sans font-semibold text-xs uppercase tracking-wider transition-colors shadow-2xs rounded-lg"
                >
                  Browse Regional Gateways
                </Link>
              </div>
            </div>

            {/* Prototype Architecture Specs */}
            <div className="grid md:grid-cols-3 gap-5">
              <div className="bg-white border border-[#CCE4EC] p-5 flex flex-col gap-2 rounded-xl shadow-xs hover:border-[#007A78] transition-all">
                <div className="flex items-center gap-2 text-[#007A78] text-xs font-semibold font-serif">
                  <Layers size={15} />
                  <span>Deterministic Seeded Engine</span>
                </div>
                <p className="text-xs text-[#5C7788] leading-relaxed">
                  The four agents evaluate via a reproducible mulberry32 seeded PRNG client-side. The exact same date and sector yield identical, auditable readings.
                </p>
              </div>

              <div className="bg-white border border-[#CCE4EC] p-5 flex flex-col gap-2 rounded-xl shadow-xs hover:border-[#E86014] transition-all">
                <div className="flex items-center gap-2 text-[#E86014] text-xs font-semibold font-serif">
                  <ServerCog size={15} />
                  <span>Calibrated Indian Marine Telemetry</span>
                </div>
                <p className="text-xs text-[#5C7788] leading-relaxed">
                  SST, chlorophyll-a, wind squall limits, and catch densities are calibrated to real Bay of Bengal parameters (OCM-3 / INCOIS and IMD coastal models).
                </p>
              </div>

              <div className="bg-white border border-[#CCE4EC] p-5 flex flex-col gap-2 rounded-xl shadow-xs hover:border-amber-500 transition-all">
                <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold font-serif">
                  <Terminal size={15} />
                  <span>Clean Modular Architecture</span>
                </div>
                <p className="text-xs text-[#5C7788] leading-relaxed">
                  All agent scoring logic resides strictly in <code className="text-[#007A78] bg-[#E2F0F5] px-1.5 py-0.5 rounded font-mono">agents.js</code>. Swapping simulated feeds for live INCOIS/IMD endpoints requires zero changes to the UI.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 8: FREQUENTLY ANSWERED INQUIRIES (FAQ ACCORDION) */}
        <FAQ />

      </main>

      {/* FOOTER */}
      <footer className="py-6 px-4 sm:px-6 bg-[#E2F0F5] text-[11px] text-[#5C7788] border-t border-[#BCDCE6]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#007A78]" />
            <span className="font-semibold text-[#0A1B27]">DATUM WGS-84 / CHART DATUM LAT</span>
            <span>·</span>
            <span>Hydrography Survey Baseline: Survey of India &amp; IHO Standards</span>
          </div>

          <div className="flex items-center gap-4 text-[#5C7788]">
            <a href="#faq" className="hover:text-[#007A78]">FAQ</a>
            <span>·</span>
            <Link to="/about" className="hover:text-[#007A78]">About / Impact</Link>
            <span>·</span>
            <Link to="/methodology" className="hover:text-[#007A78]">Methodology</Link>
            <span>·</span>
            <Link
              to={isAuthenticated ? "/advisory" : "/login"}
              state={{ from: '/advisory', reason: 'action_required' }}
              className="hover:text-[#007A78]"
            >
              Advisory Console
            </Link>
            <span>·</span>
            <span>© 2026 ORCA Coastal Authority</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
