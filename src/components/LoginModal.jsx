import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  X,
  Compass,
  Ship,
  ShieldCheck,
  Building2,
  User,
  Anchor
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import Logo from './Logo.jsx'

export default function LoginModal({
  isOpen,
  onClose,
  onSuccess,
  redirectPath = '/advisory',
  initialMode = 'signin'
}) {
  const { login, register, officerVerify } = useAuth()
  const navigate = useNavigate()

  const [authMode, setAuthMode] = useState(initialMode)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  
  // Sign In / Register Fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState('')
  const [selectedRole, setSelectedRole] = useState('skipper')
  const [officerType, setOfficerType] = useState('incois_scientist')
  const [govtIdNumber, setGovtIdNumber] = useState('')
  const [department, setDepartment] = useState('INCOIS — Ministry of Earth Sciences')
  const [vesselName, setVesselName] = useState('')
  const [regNumber, setRegNumber] = useState('')
  const [harborBase, setHarborBase] = useState('Shankarpur Principal Fishing Harbour')

  // Clearance Pass on success
  const [clearancePass, setClearancePass] = useState(null)
  const [countdown, setCountdown] = useState(2)

  const emailInputRef = useRef(null)

  // Reset or initialize state when opening
  useEffect(() => {
    if (isOpen) {
      setAuthMode(initialMode)
      setErrorMsg('')
      setClearancePass(null)
      setCountdown(2)
      // Focus the email input after animation starts
      setTimeout(() => {
        emailInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen, initialMode])

  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Auto redirect countdown on clearance
  useEffect(() => {
    let timer = null
    if (clearancePass && isOpen) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            handleFinish()
            return 0
          }
          return prev - 1
        })
      }, 900)
    }
    return () => clearInterval(timer)
  }, [clearancePass, isOpen])

  const handleFinish = () => {
    onClose?.()
    if (onSuccess) {
      onSuccess(clearancePass?.user)
    } else {
      navigate(redirectPath)
    }
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setErrorMsg('')
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
    setSubmitting(true)

    try {
      let verifiedUser = null
      if (selectedRole === 'officer') {
        verifiedUser = await officerVerify({
          govt_id_number: govtIdNumber || 'GOI-OFFICER-01',
          officer_type: officerType,
          department: department,
          email: email,
          password: password,
          full_name: fullName || 'Marine Officer'
        })
      } else {
        verifiedUser = await register({
          email: email,
          password: password,
          full_name: fullName || 'Master Mariner',
          role: selectedRole,
          vessel_name: vesselName,
          registration_number: regNumber,
          harbor_base: harborBase
        })
      }

      setClearancePass({
        user: verifiedUser,
        role: selectedRole,
        timestamp: new Date().toLocaleTimeString('en-GB') + ' IST'
      })
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please check your information and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      id="login-modal"
      data-login-modal="true"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-modal-backdrop overflow-y-auto"
      onClick={(e) => {
        // Close when clicking directly on backdrop
        if (e.target === e.currentTarget) {
          onClose?.()
        }
      }}
    >
      <div
        data-login-modal="true"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#BCDCE6] overflow-hidden animate-popup my-auto"
      >
        {/* Indian Tricolor Accent Top Ribbon */}
        <div className="tricolor-ribbon w-full" />

        {/* Modal Header Bar with Logo and Close Button */}
        <div className="px-5 sm:px-6 pt-4 pb-3 flex items-center justify-between border-b border-[#E0EEF3] bg-[#F7FBFC]">
          <div className="flex items-center gap-3">
            <Logo className="h-6 sm:h-7 w-auto" />
            <div className="border-l border-[#CCE4EC] pl-2.5 hidden xs:block">
              <div className="text-[11px] font-bold text-[#0A1B27] leading-none uppercase tracking-wider">
                Sagar Mitra Identity Gate
              </div>
              <div className="text-[9px] font-mono text-[#5C7788] leading-none mt-1">
                MoES · INCOIS Maritime Security
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Login Modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 max-h-[85vh] overflow-y-auto">
          {clearancePass ? (
            /* Clearance Granted View */
            <div className="text-center py-4 space-y-4 animate-popup">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              
              <div>
                <span className="inline-block px-3 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
                  Clearance Granted &amp; Verified
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#0A1B27]">
                  Welcome, {clearancePass.user?.full_name || 'Mariner'}
                </h3>
                <p className="text-xs text-[#5C7788] mt-1 font-mono">
                  Authentication token active · Session started at {clearancePass.timestamp}
                </p>
              </div>

              <div className="p-3.5 bg-[#F0F7FA] border border-[#CCE4EC] rounded-xl text-left text-xs space-y-1.5">
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
                  onClick={handleFinish}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#007A78] hover:bg-[#006361] text-white py-3 px-5 rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                >
                  <span>Entering Maritime Console ({countdown}s)…</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Heading */}
              <div className="text-center mb-5">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#E1F3F5] text-[#007A78] border border-[#B9E4E8] mb-2.5 shadow-2xs">
                  <Lock size={20} />
                </div>
                <h2 id="login-modal-title" className="font-serif text-2xl font-bold text-[#0A1B27] tracking-tight">
                  {authMode === 'signin' ? 'Sign In to ORCA' : 'Create Marine Account'}
                </h2>
                <p className="text-xs text-[#5C7788] mt-1">
                  {authMode === 'signin'
                    ? 'Enter your email & password to access real-time maritime operations.'
                    : 'Register your maritime profile for continuous coastal advisories.'}
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center p-1 bg-[#F0F7FA] border border-[#CCE4EC] rounded-xl mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin')
                    setErrorMsg('')
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold font-sans uppercase tracking-wider transition-all cursor-pointer ${
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
                  className={`flex-1 py-2 rounded-lg text-xs font-bold font-sans uppercase tracking-wider transition-all cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-[#007A78] text-white shadow-xs'
                      : 'text-[#5C7788] hover:text-[#0A1B27]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2.5 animate-popup">
                  <AlertCircle size={16} className="shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Sign In Form */}
              {authMode === 'signin' ? (
                <form onSubmit={handleSignIn} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <input
                        ref={emailInputRef}
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="skipper@orca.gov.in"
                        className="w-full bg-slate-50 border border-slate-300 focus:border-[#007A78] focus:bg-white text-xs px-3.5 py-2.5 rounded-xl outline-none transition-all font-mono text-[#0A1B27]"
                      />
                      <Mail size={15} className="absolute right-3.5 top-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
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

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#007A78] hover:bg-[#006361] text-white py-3 px-5 rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-98 cursor-pointer disabled:opacity-50"
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

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register')
                        setErrorMsg('')
                      }}
                      className="text-xs text-[#007A78] hover:text-[#005B59] font-semibold underline decoration-dotted cursor-pointer"
                    >
                      Don't have a maritime account? Register here
                    </button>
                  </div>
                </form>
              ) : (
                /* Register Form */
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      ref={emailInputRef}
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Capt. Rajesh Mondal"
                      className="w-full bg-slate-50 border border-slate-300 focus:border-[#007A78] focus:bg-white text-xs px-3.5 py-2.5 rounded-xl outline-none transition-all text-[#0A1B27]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1">
                      Maritime Role *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'skipper', label: 'Vessel Skipper', icon: Ship },
                        { id: 'officer', label: 'Marine Officer', icon: ShieldCheck },
                        { id: 'researcher', label: 'INCOIS Scientist', icon: Compass },
                        { id: 'port_crew', label: 'Port Master', icon: Anchor }
                      ].map((role) => {
                        const Icon = role.icon
                        const isSelected = selectedRole === role.id
                        return (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => setSelectedRole(role.id)}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#E1F3F5] border-[#007A78] text-[#007A78] shadow-2xs'
                                : 'bg-slate-50 border-slate-200 text-[#5C7788] hover:bg-slate-100'
                            }`}
                          >
                            <Icon size={14} className={isSelected ? 'text-[#007A78]' : 'text-slate-400'} />
                            <span>{role.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {selectedRole === 'officer' ? (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1">
                          Officer Type *
                        </label>
                        <select
                          value={officerType}
                          onChange={(e) => {
                            setOfficerType(e.target.value)
                            if (e.target.value === 'incois_scientist') setDepartment('INCOIS — Ministry of Earth Sciences')
                            if (e.target.value === 'coast_guard') setDepartment('Indian Coast Guard — Ministry of Defence')
                            if (e.target.value === 'fisheries_officer') setDepartment('Directorate of Marine Fisheries')
                            if (e.target.value === 'port_master') setDepartment('Kolkata Port Trust & Sagar Maritime Board')
                          }}
                          className="w-full bg-slate-50 border border-slate-300 focus:border-[#007A78] focus:bg-white text-xs px-3.5 py-2.5 rounded-xl outline-none transition-all text-[#0A1B27]"
                        >
                          <option value="incois_scientist">INCOIS Oceanographic Scientist / PFZ Officer</option>
                          <option value="coast_guard">Indian Coast Guard (ICG) Patrol Officer</option>
                          <option value="fisheries_officer">State Fisheries Enforcement Officer</option>
                          <option value="port_master">Port Authority &amp; Harbor Master</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1">
                            Govt Badge ID *
                          </label>
                          <input
                            type="text"
                            required
                            value={govtIdNumber}
                            onChange={(e) => setGovtIdNumber(e.target.value)}
                            placeholder="ICG-PATROL-402"
                            className="w-full bg-slate-50 border border-slate-300 focus:border-[#007A78] text-xs px-3 py-2 rounded-xl outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1">
                            Department *
                          </label>
                          <input
                            type="text"
                            required
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 focus:border-[#007A78] text-xs px-3 py-2 rounded-xl outline-none text-[#0A1B27]"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1">
                          Vessel Name
                        </label>
                        <input
                          type="text"
                          value={vesselName}
                          onChange={(e) => setVesselName(e.target.value)}
                          placeholder="M/V Sagar Kripa"
                          className="w-full bg-slate-50 border border-slate-300 focus:border-[#007A78] text-xs px-3 py-2 rounded-xl outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1">
                          Harbor Base
                        </label>
                        <input
                          type="text"
                          value={harborBase}
                          onChange={(e) => setHarborBase(e.target.value)}
                          placeholder="Shankarpur Harbour"
                          className="w-full bg-slate-50 border border-slate-300 focus:border-[#007A78] text-xs px-3 py-2 rounded-xl outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="officer@orca.gov.in"
                      className="w-full bg-slate-50 border border-slate-300 focus:border-[#007A78] focus:bg-white text-xs px-3.5 py-2.5 rounded-xl outline-none transition-all font-mono text-[#0A1B27]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1">
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

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#007A78] hover:bg-[#006361] text-white py-3 px-5 rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-98 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Create Maritime Account</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin')
                        setErrorMsg('')
                      }}
                      className="text-xs text-[#007A78] hover:text-[#005B59] font-semibold underline decoration-dotted cursor-pointer"
                    >
                      Already have an account? Sign in here
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
