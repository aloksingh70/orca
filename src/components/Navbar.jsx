import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Compass, ExternalLink } from 'lucide-react'
import Logo from './Logo.jsx'

const NAV_LINKS = [
  { label: 'Operational Transition', href: '/#operational-reality' },
  { label: '4 Bridge Stations', href: '/#agents' },
  { label: 'Bengal Fleet Ledger', href: '/#zones' },
  { label: 'Seasonal Ban Mandate', href: '/#ban-mandate' }
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [timeStr, setTimeStr] = useState('')
  const location = useLocation()
  const isAdvisory = location.pathname === '/advisory'

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const options = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }
      setTimeStr(new Intl.DateTimeFormat('en-GB', options).format(now) + ' IST')
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 border-b border-[#CCE4EC] backdrop-blur-md">
      {/* Indian National Tricolor Accent Ribbon */}
      <div className="tricolor-ribbon w-full" />

      {/* Top Institutional Bar */}
      <div className="border-b border-[#BCDCE6] bg-[#E2F0F5] px-4 sm:px-6 py-1.5 text-[11px] text-[#2D4454] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#0A1B27] tracking-wide">
            भारत सरकार • अंतरिक्ष विभाग
          </span>
          <span className="hidden md:inline text-[#809BAA]">|</span>
          <span className="hidden md:inline font-medium text-[#2D4454]">
            ISRO Problem Statement SIH26176 • INCOIS Coastal Telemetry
          </span>
        </div>
        <div className="flex items-center gap-3 tabular-nums text-[10px] sm:text-[11px]">
          <span className="hidden sm:inline text-[#E86014] font-bold">
            বঙ্গোপসাগরীয় উপকূলীয় নজরদারি
          </span>
          <span className="flex items-center gap-1.5 text-[#0A1B27] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#007A78] animate-pulse" />
            {timeStr || '19:15:00 IST'}
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Left: Logo & Station */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center">
            <Logo className="h-8 w-auto" />
          </Link>
          <div className="hidden xl:flex flex-col border-l border-[#CCE4EC] pl-3 text-xs leading-tight">
            <span className="font-serif text-[#0A1B27] font-bold">
              Sagar Roads Anchorage
            </span>
            <span className="font-sans text-[10px] text-[#5C7788] tabular-nums font-medium">
              21°39'N, 88°02'E • Hooghly Delta Shelf
            </span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-bold">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[#0A1B27] hover:text-[#007A78] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {!isAdvisory ? (
            <Link
              to="/advisory"
              className="inline-flex items-center gap-2 bg-[#061219] hover:bg-[#0E2332] text-white px-4 py-2 font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-[0.98]"
            >
              <Compass size={14} className="text-[#007A78]" />
              <span>Launch Advisory Deck</span>
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 bg-[#E2F0F5] hover:bg-[#D3E8EF] text-[#0A1B27] border border-[#BCDCE6] px-3.5 py-1.5 font-sans font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <span>Return to Overview</span>
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-[#0A1B27] p-1"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close station menu' : 'Open station menu'}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden bg-white border-b border-[#CCE4EC] px-6 py-4 flex flex-col gap-3 shadow-lg">
          <div className="text-xs text-[#5C7788] pb-2 border-b border-[#E0EEF3] font-semibold">
            ISRO SIH26176 • Sagar Roads Station (21°39'N, 88°02'E)
          </div>
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[#0A1B27] hover:text-[#007A78] text-sm py-1 font-bold"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/advisory"
            className="mt-2 inline-flex items-center justify-center gap-2 bg-[#061219] text-white px-4 py-2 font-sans font-bold text-sm uppercase tracking-wider"
            onClick={() => setOpen(false)}
          >
            <Compass size={15} className="text-[#007A78]" />
            Launch Working Advisory Deck
          </Link>
        </div>
      )}
    </header>
  )
}



