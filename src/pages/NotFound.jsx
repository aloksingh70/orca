import { Link } from 'react-router-dom'
import { Compass, Anchor, AlertOctagon, ArrowLeft, Waves, Radio } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import PageMeta from '../components/PageMeta.jsx'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#EAF4F8] text-[#2D4454] flex flex-col justify-between selection:bg-[#C04B28] selection:text-white">
      <PageMeta
        title="Page Not Found — ORCA"
        description="The requested marine sector or page lies outside charted coastal waters of the Bay of Bengal."
      />

      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-1 flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 outline-none">
        <div className="max-w-2xl w-full mx-auto text-center">
          
          {/* Hydrographic Instrument Box */}
          <div className="bg-white border border-[#CCE4EC] rounded-2xl p-8 sm:p-12 shadow-sm relative overflow-hidden">
            
            {/* Background Sounding Pulse Motif */}
            <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
              <div className="w-80 h-80 rounded-full border border-[#007A78]/30 animate-ping" style={{ animationDuration: '4s' }} />
              <div className="w-56 h-56 rounded-full border border-[#007A78]/40" />
              <div className="w-32 h-32 rounded-full border border-[#E86014]/40" />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#E2F0F5] border border-[#BCDCE6] text-[#007A78] text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-6 shadow-2xs">
              <AlertOctagon size={14} className="text-[#C04B28]" />
              <span>404 · Uncharted Hydrographic Sector</span>
            </div>

            {/* Large 404 Heading with Nautical Styling */}
            <div className="font-serif text-6xl sm:text-7xl font-bold text-[#0A1B27] tracking-tight leading-none mb-3">
              404
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A1B27] mb-4">
              Vessel Off Surveyed Chart Course
            </h1>

            <p className="text-sm sm:text-base text-[#5C7788] leading-relaxed max-w-lg mx-auto mb-8">
              The coordinates or resource you navigated to lie beyond the surveyed boundaries of the Bay of Bengal coastal observation grid. The sounding beam returned no echo for this sector.
            </p>

            {/* Clear Dual CTAs with Strict Primary / Secondary Visual Hierarchy */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/advisory"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#007A78] hover:bg-[#006361] text-white px-6 py-3.5 rounded-lg font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#007A78] focus-visible:outline-none"
              >
                <Compass size={15} />
                <span>Launch Advisory Console</span>
              </Link>

              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#E2F0F5] hover:bg-[#D3E8EF] text-[#0A1B27] border border-[#BCDCE6] px-5 py-3.5 rounded-lg font-sans font-semibold text-xs uppercase tracking-wider transition-colors shadow-2xs focus-visible:ring-2 focus-visible:ring-[#007A78] focus-visible:outline-none"
              >
                <Anchor size={15} className="text-[#007A78]" />
                <span>Return to Home Station</span>
              </Link>
            </div>

            {/* Chart Reference Metadata */}
            <div className="mt-8 pt-6 border-t border-[#E0EEF3] flex flex-wrap items-center justify-center gap-4 text-[11px] text-[#809BAA] font-mono">
              <span>LATITUDE: UNMAPPED</span>
              <span>•</span>
              <span>LONGITUDE: UNMAPPED</span>
              <span>•</span>
              <span>DATUM: WGS-84</span>
            </div>

          </div>
        </div>
      </main>

      {/* Institutional Nautical Footer */}
      <footer className="py-6 px-4 sm:px-6 bg-[#E2F0F5] text-[11px] text-[#5C7788] border-t border-[#BCDCE6]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#007A78]" />
            <span className="font-semibold text-[#0A1B27]">ORCA COASTAL AUTHORITY</span>
            <span>·</span>
            <span>ISRO • INCOIS • IMD Marine Advisory</span>
          </div>
          <div className="flex items-center gap-4 text-[#5C7788]">
            <Link to="/" className="hover:text-[#007A78]">Home</Link>
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
