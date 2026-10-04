import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  ShieldCheck,
  Compass,
  Ship,
  Anchor,
  KeyRound,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Building2,
  BadgeCheck,
  Cpu,
  Mail,
  User,
  Check,
  Eye,
  EyeOff,
  ChevronLeft
} from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import { getRegionById } from '../lib/regions.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import PageMeta from '../components/PageMeta.jsx'
import { ROLE_CONFIGS } from '../components/LoginModal.jsx'

export default function Login() {
  const { login, register, officerVerify } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const fromPath = location.state?.from || '/advisory'
  const isActionRequired = location.state?.reason === 'action_required' || Boolean(location.state?.from)

  const [selectedRegionId] = useState(() => {
    try {
      return localStorage.getItem('orca_selected_region') || 'bay-of-bengal'
    } catch {
      return 'bay-of-bengal'
    }
  })
  const activeRegion = getRegionById(selectedRegionId)

  // Auth mode: 'signin' | 'register'
  const [authMode, setAuthMode] = useState('signin')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Form Fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState('')
  const [selectedRole, setSelectedRole] = useState('skipper') // 'skipper' | 'officer' | 'researcher' | 'port_crew' | 'general'
  const [officerType, setOfficerType] = useState('incois_scientist')
  const [govtIdNumber, setGovtIdNumber] = useState('')
  const [department, setDepartment] = useState('INCOIS — Ministry of Earth Sciences')
  const [vesselName, setVesselName] = useState('')
  const [regNumber, setRegNumber] = useState('')
  const [harborBase, setHarborBase] = useState('')

  // Clearance Pass presentation after successful login
  const [clearancePass, setClearancePass] = useState(null)
  const [countdown, setCountdown] = useState(2)

  const OFFICER_CATEGORIES = [
    {
      id: 'incois_scientist',
      title: 'INCOIS Oceanographic Scientist / PFZ Officer',
      dept: 'INCOIS — Ministry of Earth Sciences'
    },
    {
      id: 'coast_guard',
      title: 'Indian Coast Guard (ICG) Patrol Officer',
      dept: 'Indian Coast Guard — Ministry of Defence'
    },
    {
      id: 'fisheries_officer',
      title: 'State Fisheries Enforcement Officer',
      dept: 'Directorate of Marine Fisheries'
    },
    {
      id: 'port_master',
      title: 'Port Authority & Harbor Master',
      dept: 'Kolkata Port Trust & Sagar Anchorage Maritime Board'
    }
  ]

  const handleSignIn = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    setSubmitting(true)

    try {
      const verifiedUser = await login(email, password)
      setClearancePass({
        user: verifiedUser,
        role: verifiedUser.role || 'skipper',
        timestamp: new Date().toLocaleTimeString('en-GB') + ' IST'
      })
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your email and password.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    setSubmitting(true)

    const roleCfg = ROLE_CONFIGS[selectedRole] || ROLE_CONFIGS.skipper

    try {
      let verifiedUser = null
      if (selectedRole === 'officer') {
        verifiedUser = await officerVerify({
          govt_id_number: govtIdNumber || 'GOI-OFFICER-01',
          officer_type: officerType,
          department: department,
          email: email,
          password: password,
          full_name: fullName || roleCfg.namePlaceholder.replace('e.g. ', '')
        })
      } else {
        verifiedUser = await register({
          email: email,
          password: password,
          full_name: fullName || roleCfg.namePlaceholder.replace('e.g. ', ''),
          role: selectedRole === 'general' ? 'public' : selectedRole,
          vessel_name: vesselName || roleCfg.defaultVessel || '',
          registration_number: regNumber,
          harbor_base: harborBase || roleCfg.defaultHarbor || ''
        })
      }

      setClearancePass({
        user: verifiedUser,
        role: selectedRole === 'general' ? 'General User' : roleCfg.label,
        timestamp: new Date().toLocaleTimeString('en-GB') + ' IST'
      })
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please check your information and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Auto-redirect after clearance pass
  useEffect(() => {
    let timer = null
    if (clearancePass) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            navigate(fromPath, { replace: true })
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [clearancePass, navigate, fromPath])

  return (
    <div className="bg-[#EAF4F8] min-h-screen flex flex-col font-sans text-[#2D4454] w-full max-w-full overflow-x-hidden">
      <PageMeta
        title="Sign In — ORCA Marine Portal"
        description="Authenticate with registered marine credentials to access the ORCA maritime command console."
      />
      
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-xl mx-auto w-full max-w-full min-w-0 px-4 sm:px-6 pt-28 pb-16 flex flex-col justify-center outline-none overflow-x-hidden">
        
        {/* Navigation Breadcrumb / Return to Overview */}
        <div className="mb-3 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#007A78] hover:text-[#0A1B27] uppercase tracking-wider transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Return to Overview</span>
          </Link>
          <span className="text-[11px] font-mono text-[#5C7788]">
            ORCA Maritime Identity Gate
          </span>
        </div>

        {/* Action Required Alert Banner */}
        {isActionRequired && (
          <div className="mb-4 p-3 bg-[#E1F3F5] border border-[#B9E4E8] rounded-xl flex items-center gap-2.5 text-xs text-[#007A78] font-medium shadow-2xs animate-fade-in">
            <Lock size={15} className="shrink-0 text-[#007A78]" />
            <span>Please sign in with credentials or create an account to access ORCA operations.</span>
          </div>
        )}

        {/* Active Maritime Corridor Header */}
        <div className="bg-white border border-[#BCDCE6] px-4 py-2.5 rounded-xl mb-5 flex items-center justify-between shadow-2xs text-xs">
          <div className="flex items-center gap-2">
            <Compass size={15} className="text-[#007A78] shrink-0" />
            <span className="text-[#5C7788] font-medium">Corridor:</span>
            <strong className="text-[#0A1B27] font-serif text-sm">{activeRegion.name}</strong>
          </div>
          <Link
            to="/regions"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#007A78] hover:text-[#005B59] uppercase tracking-wider transition-colors"
          >
            <span>Change</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* Clearance Pass Modal when successfully logged in */}
        {clearancePass ? (
          <div className="bg-white border border-emerald-300 shadow-xl rounded-2xl p-8 text-center animate-popup space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            
            <div>
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-mono font-bold uppercase tracking-wider mb-2">
                Identity Verified &amp; Cleared
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#0A1B27]">
                Welcome aboard, {clearancePass.user?.full_name || 'Mariner'}
              </h2>
              <p className="text-xs text-[#5C7788] mt-1 font-mono">
                Access Token Granted · Session Authenticated at {clearancePass.timestamp}
              </p>
            </div>

            <div className="p-4 bg-[#F0F7FA] border border-[#CCE4EC] rounded-xl text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#5C7788]">Authorized Role:</span>
                <strong className="text-[#0A1B27] capitalize font-mono">{clearancePass.role}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C7788]">Official Email:</span>
                <strong className="text-[#0A1B27] font-mono">{clearancePass.user?.email}</strong>
              </div>
              {clearancePass.user?.vessel_name && (
                <div className="flex justify-between">
                  <span className="text-[#5C7788]">Vessel / Station:</span>
                  <strong className="text-[#0A1B27] font-mono">{clearancePass.user.vessel_name}</strong>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate(fromPath, { replace: true })}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#007A78] hover:bg-[#006361] text-white py-3.5 px-6 rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
              >
                <span>Entering Advisory Console ({countdown}s)…</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#CCE4EC] shadow-xl rounded-2xl p-6 sm:p-8 animate-popup">
            
            {/* Form Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#E1F3F5] text-[#007A78] border border-[#B9E4E8] mb-3">
                <Lock size={22} />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A1B27] tracking-tight">
                {authMode === 'signin' ? 'Sign In to ORCA' : 'Register Marine Account'}
              </h1>
              <p className="text-xs sm:text-sm text-[#5C7788] mt-1.5">
                {authMode === 'signin'
                  ? 'Enter your registered credentials to access your maritime operational console.'
                  : 'Create a new operator account for coastal advisory access.'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center p-1 bg-[#F0F7FA] border border-[#CCE4EC] rounded-xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin')
                  setErrorMsg('')
                }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold font-sans uppercase tracking-wider transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-[#007A78] text-white shadow-xs'
                    : 'text-[#5C7788] hover:text-[#0A1B27]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register')
                  setErrorMsg('')
                }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold font-sans uppercase tracking-wider transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-[#007A78] text-white shadow-xs'
                    : 'text-[#5C7788] hover:text-[#0A1B27]'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2.5 animate-fade-in">
                <AlertCircle size={16} className="shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            {authMode === 'signin' ? (
              <div className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="enter your email"
                        className="w-full bg-slate-50 border border-slate-300 focus:border-[#007A78] focus:bg-white text-xs px-3.5 py-3 rounded-xl outline-none transition-all font-mono text-[#0A1B27]"
                      />
                      <Mail size={15} className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1.5">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-300 focus:border-[#007A78] focus:bg-white text-xs px-3.5 py-3 rounded-xl outline-none transition-all text-[#0A1B27] pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-[#007A78] transition-colors cursor-pointer p-0.5"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#007A78] hover:bg-[#006361] text-white py-3.5 px-6 rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-98 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Sign In to Console</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={ROLE_CONFIGS[selectedRole]?.namePlaceholder || 'e.g. Capt. Rajesh Mondal'}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-[#007A78] focus:bg-white text-xs px-3.5 py-2.5 rounded-xl outline-none transition-all text-[#0A1B27]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={ROLE_CONFIGS[selectedRole]?.emailPlaceholder || 'enter your email'}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-[#007A78] focus:bg-white text-xs px-3.5 py-2.5 rounded-xl outline-none transition-all font-mono text-[#0A1B27]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1.5">
                    Password (min. 6 chars) *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-300 focus:border-[#007A78] focus:bg-white text-xs px-3.5 py-2.5 rounded-xl outline-none transition-all text-[#0A1B27] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-[#007A78] transition-colors cursor-pointer p-0.5"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1.5">
                    Operational Maritime Role *
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-[#007A78] focus:bg-white text-xs px-3.5 py-2.5 rounded-xl outline-none transition-all text-[#0A1B27]"
                  >
                    <option value="skipper">Vessel Skipper / Commercial Fisherman</option>
                    <option value="officer">Coast Guard / Fisheries Enforcement Officer</option>
                    <option value="researcher">Oceanographic Researcher / Marine Scientist</option>
                    <option value="port_crew">Port Authority &amp; Harbor Logistics Crew</option>
                    <option value="general">General User / Coastal Citizen</option>
                  </select>
                </div>

                {selectedRole === 'officer' && (
                  <div className="space-y-3 p-3.5 bg-[#F0F7FA] border border-[#CCE4EC] rounded-xl">
                    <div>
                      <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1">
                        Cadre Department
                      </label>
                      <select
                        value={officerType}
                        onChange={(e) => {
                          setOfficerType(e.target.value)
                          const item = OFFICER_CATEGORIES.find((c) => c.id === e.target.value)
                          if (item) setDepartment(item.dept)
                        }}
                        className="w-full bg-white border border-slate-300 text-xs px-3 py-2 rounded-lg outline-none"
                      >
                        {OFFICER_CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1">
                        Government Service ID / Badge Number
                      </label>
                      <input
                        type="text"
                        value={govtIdNumber}
                        onChange={(e) => setGovtIdNumber(e.target.value)}
                        placeholder="e.g. GOI-INCOIS-PFZ-02"
                        className="w-full bg-white border border-slate-300 text-xs px-3 py-2 rounded-lg outline-none font-mono"
                      />
                    </div>
                  </div>
                )}

                {selectedRole !== 'officer' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1">
                        {ROLE_CONFIGS[selectedRole]?.field1Label || 'Vessel Name'}
                      </label>
                      <input
                        type="text"
                        value={vesselName}
                        onChange={(e) => setVesselName(e.target.value)}
                        placeholder={ROLE_CONFIGS[selectedRole]?.field1Placeholder || 'FB Maa Ganga'}
                        className="w-full bg-slate-50 border border-slate-300 text-xs px-3 py-2 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1">
                        {ROLE_CONFIGS[selectedRole]?.field2Label || 'Harbor Base'}
                      </label>
                      <input
                        type="text"
                        value={harborBase}
                        onChange={(e) => setHarborBase(e.target.value)}
                        placeholder={ROLE_CONFIGS[selectedRole]?.field2Placeholder || 'Shankarpur Principal Fishing Harbour'}
                        className="w-full bg-slate-50 border border-slate-300 text-xs px-3 py-2 rounded-lg outline-none font-mono"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#007A78] hover:bg-[#006361] text-white py-3.5 px-6 rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{ROLE_CONFIGS[selectedRole]?.btnText || 'Create Account & Sign In'}</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Bottom Links */}
            <div className="mt-6 pt-5 border-t border-[#CCE4EC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5C7788]">
              <Link
                to="/"
                className="hover:text-[#007A78] transition-colors flex items-center gap-1"
              >
                <span>← Return to Operational Overview</span>
              </Link>
              <Link
                to="/advisory"
                className="font-bold text-[#007A78] hover:underline"
              >
                Explore Advisory Console as Guest →
              </Link>
            </div>

          </div>
        )}

      </main>

      {/* Institutional Footer */}
      <footer className="py-4 px-4 sm:px-6 bg-[#E2F0F5] text-[11px] text-[#5C7788] border-t border-[#BCDCE6] text-center">
        <span>Ministry of Earth Sciences · INCOIS Marine Telemetry Stream · ISRO SIH26176</span>
      </footer>
    </div>
  )
}
