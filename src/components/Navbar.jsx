import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Compass, KeyRound, LogOut, Ship, ShieldCheck, Anchor, Sparkles } from 'lucide-react'
import Logo from './Logo.jsx'
import LanguageSelector from './LanguageSelector.jsx'
import DemoSwitcherModal from './DemoSwitcherModal.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [timeStr, setTimeStr] = useState('')
  const location = useLocation()
  const isAdvisory = location.pathname === '/advisory'
  const isLogin = location.pathname === '/login'
  const { t } = useLanguage()
  const { user, isAuthenticated, logout } = useAuth()

  const navLinks = [
    { label: t('nav', 'operationalTransition'), href: '/#operational-reality' },
    { label: t('nav', 'bridgeStations'), href: '/#agents' },
    { label: t('nav', 'fleetLedger'), href: '/#zones' },
    { label: t('nav', 'banMandate'), href: '/#ban-mandate' },
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

      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 border-b border-[#CCE4EC] backdrop-blur-md">
        {/* Indian National Tricolor Accent Ribbon */}
        <div className="tricolor-ribbon w-full" />

      {/* Top Institutional Bar */}
      <div className="border-b border-[#BCDCE6] bg-[#E2F0F5] px-4 sm:px-6 py-1.5 text-[11px] text-[#2D4454] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#0A1B27] tracking-wide">
            {t('nav', 'gov')}
          </span>
          <span className="hidden md:inline text-[#809BAA]">|</span>
          <span className="hidden md:inline font-medium text-[#2D4454]">
            {t('nav', 'sub')}
          </span>
        </div>
        <div className="flex items-center gap-3 tabular-nums text-[10px] sm:text-[11px]">
          <span className="hidden sm:inline text-[#E86014] font-bold">
            {t('nav', 'bengalTag')}
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
              {t('nav', 'sagarRoads')}
            </span>
            <span className="font-sans text-[10px] text-[#5C7788] tabular-nums font-medium">
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
              className="text-[#0A1B27] hover:text-[#007A78] transition-colors"
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
              <button
                type="button"
                onClick={() => setShowDemoModal(true)}
                className="hidden sm:inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 py-1 px-2.5 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                title="Switch between demo personas"
              >
                <Sparkles size={13} className="text-amber-600" />
                <span className="hidden md:inline">Switch Persona</span>
                <span className="md:hidden">Demo</span>
              </button>

              <div className="hidden sm:flex items-center gap-2 bg-[#E2F0F5] border border-[#BCDCE6] py-1 px-2.5 rounded-lg text-xs shadow-2xs">
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
                <button
                  type="button"
                  onClick={() => setShowDemoModal(true)}
                  className="hidden sm:inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                  title="1-Click Demo Logins"
                >
                  <Sparkles size={13} className="text-amber-600" />
                  <span>Demo Logins</span>
                </button>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 border border-[#007A78] text-[#007A78] hover:bg-[#007A78] hover:text-white px-3 py-1.5 font-sans font-bold text-xs uppercase tracking-wider transition-colors shadow-2xs rounded-xs"
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

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden bg-white border-b border-[#CCE4EC] px-6 py-4 flex flex-col gap-3 shadow-lg">
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

          {/* Demo Personas Quick Launch */}
          <button
            type="button"
            onClick={() => {
              setShowDemoModal(true)
              setOpen(false)
            }}
            className="w-full flex items-center justify-center gap-2 bg-amber-50 border border-amber-300 text-amber-900 py-2 px-3 rounded text-xs font-bold uppercase tracking-wider shadow-2xs hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <Sparkles size={14} className="text-amber-600" />
            <span>Switch / Test Demo Personas</span>
          </button>

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

      {/* Global 1-Click Demo Persona Switcher Modal */}
      <DemoSwitcherModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
      />
    </header>
    </>
  )
}



