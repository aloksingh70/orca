import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Compass,
  ArrowRight,
  Anchor,
  ShieldAlert,
  Waves,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Ship,
  MapPin,
  ExternalLink,
  Sparkles
} from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import PageMeta from '../components/PageMeta.jsx'
import { REGIONS } from '../lib/regions.js'
import { PORTS } from '../lib/ports.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Regions() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [hoveredRegion, setHoveredRegion] = useState(null)
  const [selectedRegionId, setSelectedRegionId] = useState(() => {
    try {
      return localStorage.getItem('orca_selected_region') || 'bay-of-bengal'
    } catch {
      return 'bay-of-bengal'
    }
  })

  const handleSelectRegion = (region) => {
    setSelectedRegionId(region.id)
    try {
      localStorage.setItem('orca_selected_region', region.id)
      localStorage.setItem('orca_selected_port', region.defaultPortId)
    } catch (e) {}

    // If user is already authenticated or has an active role, jump straight to /advisory
    // Otherwise, transition to /login so they can choose their persona for that region
    if (isAuthenticated) {
      navigate('/advisory')
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-[#EAF4F8] text-[#0A1B27] font-sans flex flex-col">
      <PageMeta
        title="Select Coastal Sea Region — ORCA Pan-India Maritime Intelligence | SIH26176"
        description="Choose among India's 4 major coastal sea regions (Bay of Bengal, Arabian Sea, Andaman & Nicobar, Lakshadweep) to configure multi-agent oceanographic telemetry."
      />
      <Navbar />

      <main id="main-content" className="flex-1 pt-28 pb-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        {/* Navigation Breadcrumb / Back */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#007A78] hover:text-[#0A1B27] uppercase tracking-wider transition-colors"
          >
            <ChevronLeft size={15} />
            <span>Back to Overview</span>
          </Link>

          <span className="font-mono text-[11px] font-bold text-[#5C7788] uppercase tracking-wider">
            STEP 1 OF 3 · COASTLINE REGION
          </span>
        </div>

        {/* Section Header */}
        <div className="mb-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#007A78] uppercase tracking-wider">
            <Compass size={14} />
            <span>PAN-INDIA COASTAL SECTOR CLUSTERING</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A1B27] tracking-tight leading-tight mb-3">
            Select Your Coastal Sea Region
          </h1>
          <p className="text-sm sm:text-base text-[#2D4454] leading-relaxed">
            ORCA operates across all 4 major maritime corridors of the Republic of India. Select your operational sea region to initialize localized oceanographic telemetry, authentic bathymetric profiles, and statutory seasonal breeding ban calendars.
          </p>
        </div>

        {/* 4 Major Sea Region Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {REGIONS.map((region) => {
            const isSelected = selectedRegionId === region.id
            const isHovered = hoveredRegion === region.id
            const portsInRegion = PORTS.filter((p) => p.regionId === region.id)

            return (
              <div
                key={region.id}
                onMouseEnter={() => setHoveredRegion(region.id)}
                onMouseLeave={() => setHoveredRegion(null)}
                className={`relative flex flex-col justify-between rounded-xl border bg-white p-6 sm:p-7 transition-all duration-200 shadow-sm hover:shadow-md ${
                  isSelected
                    ? 'border-[#007A78] ring-2 ring-[#007A78]/30 shadow-md'
                    : 'border-[#CCE4EC] hover:border-[#809BAA]'
                }`}
              >
                {/* Active Selection Badge */}
                {isSelected && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#007A78] text-white text-[10.5px] font-bold tracking-wide">
                    <CheckCircle2 size={12} />
                    <span>ACTIVE REGION</span>
                  </div>
                )}

                <div>
                  {/* Eyebrow & Sanskrit / Hindi tag */}
                  <div className="flex items-center gap-2 text-xs mb-2">
                    <span className="font-serif text-[#007A78] font-bold text-sm tracking-wide">
                      {region.hindiName}
                    </span>
                    <span className="text-[#809BAA]">•</span>
                    <span className="text-[11px] font-mono font-bold text-[#5C7788] uppercase tracking-wider">
                      {region.coastlineKm.toLocaleString()} KM COASTLINE
                    </span>
                  </div>

                  {/* Region Title */}
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A1B27] mb-1.5">
                    {region.name}
                  </h2>

                  {/* Subtitle / States */}
                  <p className="text-xs font-semibold text-[#007A78] mb-4">
                    {region.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-[#2D4454] leading-relaxed mb-5">
                    {region.description}
                  </p>

                  {/* Metadata Chips / Badges */}
                  <div className="space-y-3 pt-3 border-t border-[#EAF4F8] text-xs">
                    {/* Ports in this Region */}
                    <div className="flex items-start gap-2">
                      <Anchor size={14} className="text-[#007A78] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#0A1B27] mr-1.5">
                          {region.majorPortsCount} Major / Island Ports:
                        </span>
                        <span className="text-[#5C7788]">
                          {portsInRegion.map((p) => p.shortName).join(', ')}
                        </span>
                      </div>
                    </div>

                    {/* Statutory Ban Schedule */}
                    <div className="flex items-start gap-2">
                      <ShieldAlert size={14} className="text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#0A1B27] mr-1.5">
                          Statutory Ban Schedule:
                        </span>
                        <span className="inline-block px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-mono font-bold text-[11px]">
                          {region.banSchedule.label}
                        </span>
                      </div>
                    </div>

                    {/* Primary Fisheries */}
                    <div className="flex items-start gap-2">
                      <Waves size={14} className="text-teal-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#0A1B27] mr-1.5">Target Biomass:</span>
                        <span className="text-[#5C7788] italic">{region.primaryFisheries}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="pt-6 mt-6 border-t border-[#CCE4EC]">
                  <button
                    type="button"
                    onClick={() => handleSelectRegion(region)}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#007A78] hover:bg-[#006361] text-white shadow-xs'
                        : 'bg-[#E2F0F5] hover:bg-[#007A78] hover:text-white text-[#0A1B27]'
                    }`}
                  >
                    <span>Configure {region.shortName} Advisory</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Informational Guidance Footer Box */}
        <div className="rounded-xl border border-[#CCE4EC] bg-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xs">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-[#007A78] uppercase tracking-wider mb-1.5">
              <Sparkles size={14} />
              <span>SEAMLESS REGIONAL PERSISTENCE</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#0A1B27] mb-1">
              Returning to a familiar port or coastline?
            </h3>
            <p className="text-xs text-[#5C7788] leading-relaxed">
              Your chosen region and harbor base are automatically persisted in your session. You can switch between coastal corridors at any time using the region badge in the advisory console.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded border border-[#BCDCE6] bg-[#E2F0F5] hover:bg-[#D3E8EF] text-xs font-bold text-[#0A1B27] uppercase tracking-wider transition-colors"
            >
              <span>Read Science &amp; Impact</span>
              <ExternalLink size={13} className="text-[#007A78]" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
