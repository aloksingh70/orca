import { Link } from 'react-router-dom'
import { Compass, TableProperties, ShieldCheck, Radio } from 'lucide-react'
import BathymetricSounder from './BathymetricSounder.jsx'

export default function Hero() {
  return (
    <section id="home" className="relative w-full pt-28 pb-16 px-4 sm:px-6 bg-[#EAF4F8] border-b border-[#CCE4EC]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column (5 cols): Authoritative Hydrographic Dispatch */}
          <div className="lg:col-span-5 flex flex-col items-start pt-2">
            
            {/* Hydrographics Eyebrow Tag */}
            <div className="flex items-center gap-2 mb-3 text-xs">
              <span className="text-[#007A78] font-bold uppercase tracking-wider">
                HYDROGRAPHICS DIVISION · BAY OF BENGAL SHELF
              </span>
              <span className="text-[#809BAA]">•</span>
              <span className="text-[#5C7788] font-semibold">
                ISRO SIH26176
              </span>
            </div>

            {/* Main Serif Headline */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#0A1B27] leading-[1.14] mb-4">
              Accurate soundings, live thermal fronts, and localized surf bulletins for Bengal coastal fleets.
            </h1>

            {/* Subtext Paragraph */}
            <p className="text-sm sm:text-base text-[#2D4454] leading-relaxed mb-7 max-w-xl">
              Synthesizing satellite chlorophyll upwelling, inshore bathymetry drifts, automated acoustic buoys, and century-old artisanal harbor memory across Digha, Shankarpur, Kakdwip, and the Swatch of No Ground.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 mb-8 w-full sm:w-auto">
              <Link
                to="/advisory"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#061219] hover:bg-[#0E2332] text-white px-6 py-3.5 font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-[0.98]"
              >
                <Compass size={14} className="text-[#007A78]" />
                <span>Open Working Advisory Console</span>
              </Link>
              <a
                href="#zones"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#E2F0F5] hover:bg-[#D3E8EF] text-[#0A1B27] border border-[#BCDCE6] px-5 py-3.5 font-sans font-semibold text-xs uppercase tracking-wider transition-colors"
              >
                <TableProperties size={14} className="text-[#007A78]" />
                <span>View Port Logs</span>
              </a>
            </div>

            {/* Open Station Facts separated by subtle rules */}
            <div className="w-full flex items-center gap-6 pt-5 border-t border-[#CCE4EC] text-xs">
              <div>
                <span className="block text-[10px] text-[#5C7788] uppercase tracking-wider font-semibold">Spatial Fleet Extent</span>
                <span className="font-serif text-[#0A1B27] font-bold text-base">6 Coastal Sectors</span>
                <span className="block text-[11px] text-[#007A78] mt-0.5">Purba Medinipur to 24 Parganas</span>
              </div>
              <div className="h-9 w-px bg-[#CCE4EC]" />
              <div>
                <span className="block text-[10px] text-[#5C7788] uppercase tracking-wider font-semibold">Parallel Observation</span>
                <span className="font-serif text-[#0A1B27] font-bold text-base">4 Ground Stations</span>
                <span className="block text-[11px] text-[#007A78] mt-0.5">Simultaneous evaluation</span>
              </div>
            </div>

          </div>

          {/* Right Column (7 cols): Hydrographic Chart IN-351 Frame */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-white border border-[#CCE4EC] shadow-sm p-4 sm:p-5">
              
              {/* Chart Masthead */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-[#E0EEF3] text-xs">
                <div>
                  <h3 className="font-serif font-bold text-[#0A1B27] text-base sm:text-lg">
                    Chart IN-351: Northern Bengal Shelf &amp; Canyon Head
                  </h3>
                  <div className="text-[11px] text-[#5C7788] tabular-nums mt-0.5">
                    Scale 1:150,000 · Mercator Projection · LAT 20°40'N – 21°55'N · LONG 86°50'E – 89°20'E
                  </div>
                </div>
                <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#E1F3F5] text-[#007A78] border border-[#B9E4E8] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">
                  <Radio size={11} className="animate-pulse" />
                  <span>Acoustic Beacon 74 Online</span>
                </div>
              </div>

              {/* Bathymetric Sounder Instrument */}
              <BathymetricSounder interactive={true} />

              <div className="mt-3 flex items-center justify-between text-xs text-[#5C7788] pt-2 border-t border-[#E0EEF3]">
                <span className="flex items-center gap-1.5 text-[#007A78] font-medium text-[11px]">
                  <ShieldCheck size={13} />
                  <span>Soundings reduced to lowest astronomical tide (LAT) · Survey of India Baseline</span>
                </span>
                <span className="hidden sm:inline italic text-[11px]">
                  Click sector node to inspect depth profile
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}


