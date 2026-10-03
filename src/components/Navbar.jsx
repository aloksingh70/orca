import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Compass, KeyRound, LogOut, Ship, ShieldCheck, Anchor, Sparkles, MapPin } from 'lucide-react'
import Logo from './Logo.jsx'
import LanguageSelector from './LanguageSelector.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getRegionById } from '../lib/regions.js'

export default function Navbar({ darkGlass = false }) {
  const [open, setOpen] = useState(false)
  const [timeStr, setTimeStr] = useState('')
  const [currentRegionId, setCurrentRegionId] = useState(() => {
    try {
      return localStorage.getItem('orca_selected_region') || 'bay-of-bengal'
    } catch {
      return 'bay-of-bengal'
    }
  })
  const location = useLocation()
  const isAdvisory = location.pathname === '/advisory'
  const isLogin = location.pathname === '/login'
  const { t } = useLanguage()
  const { user, isAuthenticated, logout } = useAuth()

  const currentRegion = getRegionById(currentRegionId)

  const navLinks = [
    { label: 'Sea Regions', href: '/regions' },
    { label: t('nav', 'operationalTransition'), href: '/#operational-reality' },
    { label: t('nav', 'bridgeStations'), href: '/#agents' },
    { label: t('nav', 'fleetLedger'), href: '/#zones' },
    { label: t('nav', 'banMandate'), href: '/#ban-mandate' },
    { label: 'About', href: '/about' },
    { label: 'FAQ', href: '/#faq' }
  ]

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
    <>
      {/* Accessible Skip to Main Content Link for Keyboard Users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#007A78] focus:text-white focus:font-bold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white rounded text-xs uppercase tracking-wider"
      >
        Skip to main content
      </a>

      <header className={`fixed top-0 left-0 right-0 z-50 transition-colors ${
        darkGlass
          ? 'bg-[#031520]/80 border-b border-white/10 backdrop-blur-xl text-white'
          : 'bg-white/95 border-b border-[#CCE4EC] backdrop-blur-md text-[#2D4454]'
      }`}>
        {/* Indian National Tricolor Accent Ribbon */}
        <div className="tricolor-ribbon w-full" />

      {/* Top Institutional Bar */}
      <div className={`px-4 sm:px-6 py-1.5 text-[11px] flex items-center justify-between transition-colors ${
        darkGlass
          ? 'border-b border-white/10 bg-[#071927]/90 text-slate-300'
          : 'border-b border-[#BCDCE6] bg-[#E2F0F5] text-[#2D4454]'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`font-bold tracking-wide ${darkGlass ? 'text-white' : 'text-[#0A1B27]'}`}>
            {t('nav', 'gov')}
          </span>
          <span className="hidden md:inline opacity-40">|</span>
          <span className={`hidden md:inline font-medium ${darkGlass ? 'text-slate-300' : 'text-[#2D4454]'}`}>
            {t('nav', 'sub')}
          </span>
        </div>
        <div className="flex items-center gap-3 tabular-nums text-[10px] sm:text-[11px]">
          <Link
            to="/regions"
            className="hidden sm:inline-flex items-center gap-1.5 text-[#E86014] hover:text-[#FF7722] font-bold transition-colors"
            title="Switch Sea Region"
          >
            <span>{currentRegion?.name || 'Pan-India Maritime'} Corridor</span>
            <span className="text-[10px] bg-orange-500/20 text-orange-300 px-1.5 py-0.2 rounded font-mono border border-orange-400/30">Switch</span>
          </Link>
          <span className={`flex items-center gap-1.5 font-bold ${darkGlass ? 'text-white' : 'text-[#0A1B27]'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#17A398] animate-pulse" />
            {timeStr || '19:15:00 IST'}
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Left: Logo & Station */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center">
            <Logo className={`h-8 w-auto ${darkGlass ? 'brightness-110' : ''}`} />
          </Link>
          <div className={`hidden xl:flex flex-col border-l pl-3 text-xs leading-tight ${darkGlass ? 'border-white/10' : 'border-[#CCE4EC]'}`}>
            <span className={`font-serif font-bold ${darkGlass ? 'text-white' : 'text-[#0A1B27]'}`}>
              {t('nav', 'sagarRoads')}
            </span>
            <span className={`font-sans text-[10px] tabular-nums font-medium ${darkGlass ? 'text-slate-400' : 'text-[#5C7788]'}`}>
              {t('nav', 'hooghlyDelta')}
            </span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-bold">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={darkGlass ? 'text-slate-200 hover:text-teal-300 transition-colors' : 'text-[#0A1B27] hover:text-[#007A78] transition-colors'}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right: Language Menu & Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Language Selector Dropdown Menu */}
          <LanguageSelector />

          {/* User Auth Status / Sign In Button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-[#E2F0F5] border border-[#BCDCE6] py-1 px-2.5 rounded-lg text-xs shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-[#0A1B27]">
                  {user?.role === 'officer' ? (
                    <>
                      <ShieldCheck size={14} className="text-[#E86014]" />
                      <span className="text-[9px] bg-[#E86014]/15 text-[#E86014] font-bold px-1 py-0.5 rounded font-mono">
                        OFFICER
                      </span>
                    </>
                  ) : user?.role === 'researcher' ? (
                    <>
                      <Ship size={14} className="text-[#007A78]" />
                      <span className="text-[9px] bg-[#007A78]/15 text-[#007A78] font-bold px-1 py-0.5 rounded font-mono">
                        RESEARCH
                      </span>
                    </>
                  ) : user?.role === 'port_crew' ? (
                    <>
                      <Anchor size={14} className="text-slate-700" />
                      <span className="text-[9px] bg-slate-200 text-slate-800 font-bold px-1 py-0.5 rounded font-mono">
                        PORT
                      </span>
                    </>
                  ) : (
                    <>
                      <Ship size={14} className="text-[#007A78]" />
                      <span className="text-[9px] bg-[#007A78]/15 text-[#007A78] font-bold px-1 py-0.5 rounded font-mono">
                        SKIPPER
                      </span>
                    </>
                  )}
                  <span className="truncate max-w-[130px]" title={user?.vessel_name || user?.full_name}>
                    {user?.role === 'officer' ? user?.full_name : (user?.vessel_name || user?.full_name)}
                  </span>
                </div>
                <span className="text-[#BCDCE6]">|</span>
                <button
                  type="button"
                  onClick={logout}
                  title="Sign Out"
                  aria-label="Sign Out of Session"
                  className="text-[#5C7788] hover:text-red-700 transition-colors p-0.5 cursor-pointer rounded focus-visible:ring-2 focus-visible:ring-[#007A78] focus-visible:outline-none"
                >
                  <LogOut size={13} />
                </button>
              </div>
            </div>
          ) : (
            !isLogin && (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 border border-[#007A78] text-[#007A78] hover:bg-[#007A78] hover:text-white px-3.5 py-1.5 font-sans font-bold text-xs uppercase tracking-wider transition-colors shadow-2xs rounded-xs"
                >
                  <KeyRound size={13} />
                  <span className="hidden xs:inline">{t('auth', 'tabSignIn').split(' ')[0]}</span>
                  <span>Sign In</span>
                </Link>
              </div>
            )
          )}

          {!isAdvisory ? (
            <Link
              to="/advisory"
              className="inline-flex items-center gap-2 bg-[#007A78] hover:bg-[#006361] text-white px-3.5 sm:px-4 py-2 font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-[0.98]"
            >
              <Compass size={14} className="text-white" />
              <span className="hidden xs:inline">{t('nav', 'launchAdvisory')}</span>
              <span className="xs:hidden">Advisory</span>
            </Link>
          ) : (
            <Link
              to="/overview"
              className="inline-flex items-center gap-1.5 bg-[#E2F0F5] hover:bg-[#D3E8EF] text-[#0A1B27] border border-[#BCDCE6] px-3.5 py-1.5 font-sans font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <span>{t('nav', 'returnOverview')}</span>
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-[#0A1B27] p-1.5 rounded hover:bg-slate-100"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close station menu' : 'Open station menu'}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {open && (
        <div className={`lg:hidden border-t px-4 py-5 flex flex-col gap-3 text-xs ${
          darkGlass
            ? 'bg-[#031520]/95 border-white/10 backdrop-blur-2xl text-white'
            : 'bg-white border-[#CCE4EC] text-[#2D4454]'
        } shadow-lg`}>
          <div className="flex items-center justify-between pb-2 border-b border-[#E0EEF3]">
            <span className="text-xs text-[#5C7788] font-semibold">
              ISRO SIH26176 • Sagar Roads Station
            </span>
            <LanguageSelector compact={false} />
          </div>

          {/* Mobile User Profile or Login */}
          {isAuthenticated ? (
            <div className="flex items-center justify-between bg-[#E2F0F5] border border-[#BCDCE6] p-2.5 rounded text-xs">
              <div className="flex items-center gap-2 font-bold text-[#0A1B27]">
                {user?.role === 'officer' ? (
                  <ShieldCheck size={16} className="text-[#E86014]" />
                ) : (
                  <Ship size={16} className="text-[#007A78]" />
                )}
                <div>
                  <div>{user?.full_name}</div>
                  <div className="text-[10px] text-[#5C7788] font-normal">{user?.vessel_name || user?.role}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout()
                  setOpen(false)
                }}
                className="text-xs font-bold text-red-700 bg-white border border-red-200 px-2 py-1 rounded hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 bg-[#007A78] text-white py-2 px-3 rounded text-xs font-bold uppercase tracking-wider"
              onClick={() => setOpen(false)}
            >
              <KeyRound size={14} />
              <span>Fleet Sign In / Register</span>
            </Link>
          )}

          {navLinks.map((link) => (
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
            className="mt-2 inline-flex items-center justify-center gap-2 bg-[#007A78] hover:bg-[#006361] text-white px-4 py-2 font-sans font-bold text-sm uppercase tracking-wider transition-all shadow-sm"
            onClick={() => setOpen(false)}
          >
            <Compass size={15} className="text-white" />
            {t('nav', 'launchAdvisory')}
          </Link>
        </div>
      )}
    </header>
    </>
  )
}



