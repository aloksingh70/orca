import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  ShieldCheck,
  Compass,
  Ship,
  Anchor,
  KeyRound,
  User,
  MapPin,
  FileText,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Building2,
  BadgeCheck,
  Cpu,
  ChevronLeft,
  Search,
  Check,
  Sparkles,
  Radio,
  ExternalLink
} from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import SSOButtons from '../components/SSOButtons.jsx'
import DemoLoginGrid from '../components/DemoLoginGrid.jsx'
import { DEMO_USERS } from '../lib/demoUsers.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import PageMeta from '../components/PageMeta.jsx'

export default function Login() {
  const { login, register, officerVerify, ssoLogin, isAuthenticated, user, activeRole, setActiveRole } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()

  // Steps: 'role_select' -> 'credentials' -> 'verified_welcome'
  const [currentStep, setCurrentStep] = useState('role_select')
  const [loginMode, setLoginMode] = useState('demo') // 'demo' | 'manual'
  const [authenticatingEmail, setAuthenticatingEmail] = useState(null)
  const [selectedRole, setSelectedRole] = useState(() => activeRole || 'officer') // 'officer' | 'skipper' | 'researcher' | 'port_crew'
  const [officerType, setOfficerType] = useState('incois_scientist') // 'incois_scientist' | 'coast_guard' | 'fisheries_officer' | 'port_master'

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    if (setActiveRole) setActiveRole(role)
  }

  const [submitting, setSubmitting] = useState(false)
  const [verifyingGovtId, setVerifyingGovtId] = useState(false)
  const [verificationStage, setVerificationStage] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    govtIdNumber: '',
    department: 'INCOIS — Ministry of Earth Sciences',
    vesselName: '',
    regNumber: '',
    harborBase: 'Shankarpur Principal Fishing Harbour',
    isNewAccount: false
  })

  // Clearance pass state after verification
  const [clearancePass, setClearancePass] = useState(null)
  const [countdown, setCountdown] = useState(3)

  // Officer sub-categories definition
  const OFFICER_CATEGORIES = [
    {
      id: 'incois_scientist',
      title: 'INCOIS Oceanographic Scientist / PFZ Officer',
      dept: 'INCOIS — Ministry of Earth Sciences',
      sampleId: 'GOI-INCOIS-PFZ-02',
      email: 'officer.incois@orca.gov.in',
      name: 'Dr. Ananya Sen',
      desc: 'Authorizes Potential Fishing Zone (PFZ) telemetry, satellite SST models & scientific advisories.'
    },
    {
      id: 'coast_guard',
      title: 'Indian Coast Guard (ICG) Patrol Officer',
      dept: 'Indian Coast Guard — Ministry of Defence',
      sampleId: 'ICG-OFF-8821',
      email: 'officer.coastguard@orca.gov.in',
      name: 'Cmdr. Vikram Rathore',
      desc: 'Monitors maritime boundary safety, distress beacons, search/rescue operations & squall zones.'
    },
    {
      id: 'fisheries_officer',
      title: 'State Fisheries Enforcement Officer',
      dept: 'Directorate of Marine Fisheries, Govt of WB',
      sampleId: 'WB-FISH-7734',
      email: 'officer.fisheries@orca.gov.in',
      name: 'Sunil Roy',
      desc: 'Enforces the 61-day Bay of Bengal fishing ban, breeding sanctuaries, and mesh net compliance.'
    },
    {
      id: 'port_master',
      title: 'Port Authority & Harbor Master',
      dept: 'Sagar Roads Anchorage & Marine Board',
      sampleId: 'PORT-SAGAR-01',
      email: 'officer.portmaster@orca.gov.in',
      name: 'Capt. B. K. Halder',
      desc: 'Authorizes vessel departures, quayside draft soundings, tidal navigation, and cold-chain logistics.'
    }
  ]

  // 1-Click Instant Demo Authentication
  const handleInstantDemoLogin = async (demoUser) => {
    setErrorMsg('')
    setSubmitting(true)
    setAuthenticatingEmail(demoUser.email)

    try {
      const verifiedUser = await login(demoUser.email, demoUser.password || 'orca123')
      
      // Configure clearance pass for presentation
      setClearancePass({
        user: verifiedUser,
        role: verifiedUser.role || demoUser.role,
        officerType: verifiedUser.officer_type || demoUser.officerType,
        govtIdNumber: verifiedUser.govt_id_number || verifiedUser.registration_number || demoUser.badgeOrReg || 'VERIFIED-IND',
        timestamp: new Date().toLocaleTimeString('en-GB') + ' IST'
      })
      setCurrentStep('verified_welcome')
    } catch (err) {
      setErrorMsg(err.message || 'Demo authentication failed. Please verify credentials.')
    } finally {
      setSubmitting(false)
      setAuthenticatingEmail(null)
    }
  }

  // Pre-fill Form for Manual Testing
  const handleFillCredentials = (demoUser) => {
    setErrorMsg('')
    setSelectedRole(demoUser.role)
    if (demoUser.officerType) {
      setOfficerType(demoUser.officerType)
    }
    setFormData({
      email: demoUser.email,
      password: demoUser.password || 'orca123',
      fullName: demoUser.name,
      govtIdNumber: demoUser.badgeOrReg || '',
      department: demoUser.cadre || '',
      vesselName: demoUser.vesselOrStation || '',
      regNumber: demoUser.badgeOrReg || '',
      harborBase: demoUser.vesselOrStation || 'Sagar Roads Station',
      isNewAccount: false
    })
    setLoginMode('manual')
    setCurrentStep('credentials')
  }

  // Auto fill demo accounts
  const handleQuickDemoFill = (type, customOfficerType = null) => {
    setErrorMsg('')
    if (type === 'officer') {
      setSelectedRole('officer')
      const opt = OFFICER_CATEGORIES.find((o) => o.id === (customOfficerType || officerType)) || OFFICER_CATEGORIES[0]
      setOfficerType(opt.id)
      setFormData({
        email: opt.email,
        password: 'orca123',
        fullName: opt.name,
        govtIdNumber: opt.sampleId,
        department: opt.dept,
        vesselName: '',
        regNumber: '',
        harborBase: 'Sagar Roads Station',
        isNewAccount: false
      })
      setCurrentStep('credentials')
    } else if (type === 'skipper') {
      setSelectedRole('skipper')
      setFormData({
        email: 'skipper@orca.gov.in',
        password: 'orca123',
        fullName: 'Capt. Rajesh Mondal',
        govtIdNumber: '',
        department: 'Bengal Coastal Fishermen Cooperative',
        vesselName: 'FB Maa Ganga (WB-24-M-104)',
        regNumber: 'IND-WB-24-00918',
        harborBase: 'Shankarpur Principal Fishing Harbour',
        isNewAccount: false
      })
      setCurrentStep('credentials')
    } else if (type === 'researcher') {
      setSelectedRole('researcher')
      setFormData({
        email: 'researcher@incois.res.in',
        password: 'orca123',
        fullName: 'Dr. Priya Sharma',
        govtIdNumber: 'NIO-RES-409',
        department: 'National Institute of Oceanography (CSIR-NIO)',
        vesselName: 'RV Sindhu Sadhana Observer',
        regNumber: 'NIO-RES-409',
        harborBase: 'Digha Marine Station',
        isNewAccount: false
      })
      setCurrentStep('credentials')
    } else if (type === 'port_crew') {
      setSelectedRole('port_crew')
      setFormData({
        email: 'portmaster@sagar.port.gov.in',
        password: 'orca123',
        fullName: 'Capt. B. K. Halder',
        govtIdNumber: 'PORT-SAGAR-01',
        department: 'Kolkata Port Trust & Sagar Anchorage Maritime Board',
        vesselName: 'Pilot Vessel Sagar Sandhya',
        regNumber: 'PORT-SAGAR-01',
        harborBase: 'Sagar Roads Anchorage',
        isNewAccount: false
      })
      setCurrentStep('credentials')
    }
  }

  // Handle Officer selection
  const handleSelectOfficerType = (typeId) => {
    setOfficerType(typeId)
    const opt = OFFICER_CATEGORIES.find((o) => o.id === typeId)
    if (opt) {
      setFormData((prev) => ({
        ...prev,
        department: opt.dept,
        govtIdNumber: prev.govtIdNumber || opt.sampleId
      }))
    }
  }

  // Submit Handler for Officer or Skipper/Researcher
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    setSubmitting(true)

    try {
      let verifiedUser = null

      if (selectedRole === 'officer') {
        // Step 1: Simulated Government Registry Verification
        setVerifyingGovtId(true)
        setVerificationStage('Validating Government Service ID with National Marine Registry…')
        await new Promise((r) => setTimeout(r, 600))
        setVerificationStage('Verifying Cadre Clearance & MoES Security Token…')
        await new Promise((r) => setTimeout(r, 600))

        // Step 2: Call backend officer-verify
        verifiedUser = await officerVerify({
          govt_id_number: formData.govtIdNumber || 'GOI-INCOIS-PFZ-02',
          officer_type: officerType,
          department: formData.department,
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName || undefined
        })
        setVerifyingGovtId(false)
      } else {
        // Skipper, Researcher or General
        if (formData.isNewAccount) {
          verifiedUser = await register({
            email: formData.email,
            password: formData.password,
            full_name: formData.fullName || 'Vessel Master',
            role: selectedRole,
            vessel_name: formData.vesselName,
            registration_number: formData.regNumber,
            harbor_base: formData.harborBase
          })
        } else {
          verifiedUser = await login(formData.email, formData.password)
        }
      }

      // Transition to Welcome Pass
      setClearancePass({
        user: verifiedUser,
        role: selectedRole,
        officerType: officerType,
        govtIdNumber: formData.govtIdNumber || verifiedUser.govt_id_number || verifiedUser.registration_number,
        timestamp: new Date().toLocaleTimeString('en-GB') + ' IST'
      })
      setCurrentStep('verified_welcome')
    } catch (err) {
      setVerifyingGovtId(false)
      setErrorMsg(err.message || 'Authentication and verification failed. Please check credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle SSO Login
  const handleSSOSelect = async (ssoPayload) => {
    setErrorMsg('')
    setSubmitting(true)
    try {
      const verifiedUser = await ssoLogin(ssoPayload)
      setClearancePass({
        user: verifiedUser,
        role: verifiedUser.role || selectedRole,
        officerType: verifiedUser.officer_type || officerType,
        govtIdNumber: verifiedUser.govt_id_number || verifiedUser.registration_number || 'SSO-VERIFIED',
        timestamp: new Date().toLocaleTimeString('en-GB') + ' IST'
      })
      setCurrentStep('verified_welcome')
    } catch (err) {
      setErrorMsg(err.message || 'Single Sign-On failed')
    } finally {
      setSubmitting(false)
    }
  }

  // Auto countdown to advisory deck after verification
  useEffect(() => {
    let timer = null
    if (currentStep === 'verified_welcome') {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            navigate('/advisory')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [currentStep, navigate])

  return (
    <div className="bg-[#EAF4F8] min-h-screen flex flex-col font-sans text-[#2D4454]">
      <PageMeta
        title="Sign In — ORCA Marine Portal"
        description="Authenticate with official marine credentials, demo personas, or single sign-on to access the ORCA maritime command console."
      />
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-24 pb-16 flex flex-col justify-center outline-none">
        
        {/* Quick Demo Credential Bar (SIH Evaluation Mode) */}
        <div className="bg-[#E2F0F5] border border-[#BCDCE6] p-3 rounded-lg mb-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2 font-bold text-[#0A1B27] shrink-0">
            <Sparkles size={15} className="text-[#007A78]" />
            <span>Fast-Track Demo Access:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {DEMO_USERS.map((demo) => (
              <button
                key={demo.id}
                type="button"
                disabled={!!authenticatingEmail}
                onClick={() => handleInstantDemoLogin(demo)}
                className={`bg-white hover:bg-slate-50 text-[#0A1B27] border border-[#CCE4EC] px-2.5 py-1 font-semibold rounded text-[11px] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50 hover:border-[#007A78]`}
                title={`1-Click Login as ${demo.name} (${demo.title})`}
              >
                {authenticatingEmail === demo.email ? (
                  <div className="w-3 h-3 border-2 border-[#007A78] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className={`w-2 h-2 rounded-full ${
                    demo.id === 'skipper' ? 'bg-emerald-500' :
                    demo.id === 'coast_guard' ? 'bg-orange-500' :
                    demo.id === 'incois_scientist' ? 'bg-teal-600' :
                    demo.id === 'researcher' ? 'bg-amber-500' :
                    demo.id === 'fisheries_officer' ? 'bg-blue-600' : 'bg-slate-600'
                  }`} />
                )}
                <span>{demo.badgeText}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Global Error Alert */}
        {errorMsg && currentStep === 'role_select' && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2.5 animate-fade-in">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: WHO ARE YOU? / DEMO ACCOUNTS */}
        {currentStep === 'role_select' && (
          <div className="bg-white border border-[#CCE4EC] shadow-md rounded-xl p-6 sm:p-8 animate-fade-in">
            
            {/* Mode Selector Tabs */}
            <div className="flex items-center justify-center p-1 bg-[#F0F7FA] border border-[#CCE4EC] rounded-xl mb-7">
              <button
                type="button"
                onClick={() => setLoginMode('demo')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold font-sans uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  loginMode === 'demo'
                    ? 'bg-[#007A78] text-white shadow-sm'
                    : 'text-[#5C7788] hover:text-[#0A1B27] hover:bg-white/60'
                }`}
              >
                <Sparkles size={14} />
                <span>1-Click Demo Accounts</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  loginMode === 'demo' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  6 Personas
                </span>
              </button>
              <button
                type="button"
                onClick={() => setLoginMode('manual')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold font-sans uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  loginMode === 'manual'
                    ? 'bg-[#007A78] text-white shadow-sm'
                    : 'text-[#5C7788] hover:text-[#0A1B27] hover:bg-white/60'
                }`}
              >
                <Lock size={13} />
                <span>Custom Role &amp; ID Verification</span>
              </button>
            </div>

            {/* TAB 1: 1-CLICK DEMO LOGIN GRID */}
            {loginMode === 'demo' && (
              <DemoLoginGrid
                onInstantLogin={handleInstantDemoLogin}
                onFillCredentials={handleFillCredentials}
                isAuthenticating={authenticatingEmail}
              />
            )}

            {/* TAB 2: MANUAL ROLE SELECTION */}
            {loginMode === 'manual' && (
              <div>
                <div className="text-center mb-8">
                  <span className="inline-flex items-center gap-1.5 bg-[#007A78]/10 text-[#007A78] text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2">
                    <BadgeCheck size={14} />
                    <span>Maritime Clearance &amp; Authentication</span>
                  </span>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A1B27] tracking-tight">
                    Select Your Maritime Authority
                  </h1>
                  <p className="text-xs sm:text-sm text-[#5C7788] mt-1.5 max-w-xl mx-auto">
                    ORCA tailors its multi-agent reasoning, command controls, and compliance tools specifically to your operational authority and role at sea.
                  </p>
                </div>

                {/* 4 Identity Selection Cards */}
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  
                  {/* Option 1: Government & Coastal Officer */}
                  <div
                    onClick={() => handleRoleSelect('officer')}
                    className={`p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      selectedRole === 'officer'
                        ? 'border-[#007A78] bg-[#E2F0F5]/40 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-lg bg-[#007A78]/10 text-[#007A78] border border-[#007A78]/20">
                          <ShieldCheck size={22} />
                        </div>
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedRole === 'officer' ? 'border-[#007A78] bg-[#007A78] text-white' : 'border-slate-300'
                        }`}>
                          {selectedRole === 'officer' && <Check size={11} strokeWidth={3} />}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-base text-[#0A1B27] mb-1">
                        Government / Marine Officer
                      </h3>
                      <p className="text-xs text-[#5C7788] leading-relaxed">
                        Official administrative, oceanographic, surveillance, or enforcement authority requiring validated Government Service ID.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] font-semibold text-[#007A78]">
                      Includes INCOIS, Coast Guard, Fisheries &amp; Port Master
                    </div>
                  </div>

                  {/* Option 2: Vessel Skipper / Commercial Fisherman */}
                  <div
                    onClick={() => handleRoleSelect('skipper')}
                    className={`p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      selectedRole === 'skipper'
                        ? 'border-[#007A78] bg-[#E2F0F5]/40 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Ship size={22} />
                        </div>
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedRole === 'skipper' ? 'border-[#007A78] bg-[#007A78] text-white' : 'border-slate-300'
                        }`}>
                          {selectedRole === 'skipper' && <Check size={11} strokeWidth={3} />}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-base text-[#0A1B27] mb-1">
                        Vessel Skipper / Fisherman
                      </h3>
                      <p className="text-xs text-[#5C7788] leading-relaxed">
                        Master mariner, mechanized trawler skipper, gillnetter, or artisanal boat captain seeking safe, fuel-efficient fishing coordinates.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] font-semibold text-emerald-700">
                      Wheelhouse Advisories &amp; Live Route Optimizations
                    </div>
                  </div>

                  {/* Option 3: Marine Researcher */}
                  <div
                    onClick={() => handleRoleSelect('researcher')}
                    className={`p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      selectedRole === 'researcher'
                        ? 'border-[#007A78] bg-[#E2F0F5]/40 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                          <Cpu size={22} />
                        </div>
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedRole === 'researcher' ? 'border-[#007A78] bg-[#007A78] text-white' : 'border-slate-300'
                        }`}>
                          {selectedRole === 'researcher' && <Check size={11} strokeWidth={3} />}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-base text-[#0A1B27] mb-1">
                        Marine Scientist / Oceanographer
                      </h3>
                      <p className="text-xs text-[#5C7788] leading-relaxed">
                        Academic scholar or environmental institute researcher inspecting thermal front dynamics and biomass conservation trends.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] font-semibold text-amber-700">
                      Raw INCOIS / OCM-3 Telemetry &amp; Multi-Agent Metrics
                    </div>
                  </div>

                  {/* Option 4: Port Operator / Public */}
                  <div
                    onClick={() => handleRoleSelect('port_crew')}
                    className={`p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      selectedRole === 'port_crew'
                        ? 'border-[#007A78] bg-[#E2F0F5]/40 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                          <Anchor size={22} />
                        </div>
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedRole === 'port_crew' ? 'border-[#007A78] bg-[#007A78] text-white' : 'border-slate-300'
                        }`}>
                          {selectedRole === 'port_crew' && <Check size={11} strokeWidth={3} />}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-base text-[#0A1B27] mb-1">
                        Port Operator / Public Trade
                      </h3>
                      <p className="text-xs text-[#5C7788] leading-relaxed">
                        Cold storage operator, fish trade logistics coordinator, or harbor debrief analyst monitoring daily quay-side landings.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] font-semibold text-slate-700">
                      Harbor Ledger Logs &amp; Seasonal Volume Trends
                    </div>
                  </div>

                </div>

                {/* Officer Category Selector if Officer Role is picked */}
                {selectedRole === 'officer' && (
                  <div className="bg-[#E2F0F5]/60 border border-[#BCDCE6] rounded-xl p-5 mb-6 animate-fade-in">
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 size={16} className="text-[#007A78]" />
                      <span className="font-serif font-bold text-sm text-[#0A1B27]">
                        Select Your Officer Department / Cadre:
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {OFFICER_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleSelectOfficerType(cat.id)}
                          className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                            officerType === cat.id
                              ? 'border-[#007A78] bg-white shadow-xs'
                              : 'border-[#CCE4EC] bg-white/70 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <strong className="text-xs text-[#0A1B27] font-bold block">{cat.title}</strong>
                            {officerType === cat.id && <Check size={13} className="text-[#007A78]" />}
                          </div>
                          <span className="text-[11px] text-[#5C7788] block mt-0.5">{cat.dept}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E0EEF3]">
                  <div className="text-xs text-[#5C7788]">
                    Step 1 of 2 · Maritime identity ensures compliance under MFRA &amp; MoES regulations.
                  </div>
                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <Link
                      to="/advisory"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 border border-[#CCE4EC] hover:border-[#007A78] text-[#2D4454] hover:text-[#007A78] bg-slate-50 hover:bg-white px-4 py-3 rounded-lg font-sans font-semibold text-xs uppercase tracking-wider transition-all"
                    >
                      <Compass size={14} className="text-[#007A78]" />
                      <span>Launch Advisory Directly</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setCurrentStep('credentials')}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#007A78] hover:bg-[#006361] text-white px-6 py-3 rounded-lg font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer active:scale-98"
                    >
                      <span>Proceed to Verification</span>
                      <ArrowRight size={14} className="text-white" />
                    </button>
                  </div>
                </div>

                {/* Social / National SSO options */}
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <SSOButtons
                    onSelectSSO={handleSSOSelect}
                    selectedRole={selectedRole}
                    officerType={officerType}
                  />
                </div>
              </div>
            )}

          </div>
        )}

        {/* STEP 2: ROLE-SPECIFIC VERIFICATION & CREDENTIALS FORM */}
        {currentStep === 'credentials' && (
          <div className="bg-white border border-[#CCE4EC] shadow-md rounded-xl p-6 sm:p-8 animate-fade-in">
            
            {/* Back Button & Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E0EEF3]">
              <button
                type="button"
                onClick={() => setCurrentStep('role_select')}
                className="inline-flex items-center gap-1.5 text-xs text-[#5C7788] hover:text-[#0A1B27] font-semibold cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>Change Role</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#5C7788]">Selected:</span>
                <span className="bg-[#E2F0F5] border border-[#BCDCE6] text-[#007A78] text-xs font-bold px-2.5 py-0.5 rounded-full capitalize">
                  {selectedRole === 'officer' ? (
                    OFFICER_CATEGORIES.find((o) => o.id === officerType)?.title || 'Marine Officer'
                  ) : selectedRole}
                </span>
              </div>
            </div>

            {/* Officer-Specific Government Verification Header */}
            {selectedRole === 'officer' && (
              <div className="bg-[#E2F0F5]/80 border border-[#BCDCE6] p-4 rounded-lg mb-6 flex items-start gap-3">
                <div className="p-2 bg-white rounded text-[#007A78] border border-[#BCDCE6] shrink-0 mt-0.5">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#0A1B27]">
                    Official Government Marine Officer Clearance Gateway
                  </h3>
                  <p className="text-xs text-[#2D4454] mt-0.5 leading-relaxed">
                    Officers must provide their official Government Service ID / Badge number. Credentials will be verified against the National Marine Operations directory.
                  </p>
                </div>
              </div>
            )}

            {/* Alerts */}
            {errorMsg && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2.5">
                <AlertCircle size={16} className="shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}
            {verifyingGovtId && (
              <div className="mb-5 p-3.5 bg-cyan-50 border border-cyan-200 text-[#007A78] text-xs rounded-lg flex items-center gap-2.5 animate-pulse">
                <BadgeCheck size={16} className="shrink-0 text-[#007A78]" />
                <span className="font-semibold">{verificationStage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* IF OFFICER: Government ID verification fields */}
              {selectedRole === 'officer' ? (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Govt Service ID / Badge */}
                    <div>
                      <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1.5">
                        Government Service ID / Badge Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.govtIdNumber}
                        onChange={(e) => setFormData({ ...formData, govtIdNumber: e.target.value })}
                        placeholder="e.g. GOI-INCOIS-PFZ-02, ICG-OFF-8821"
                        className="w-full bg-slate-50 border border-slate-300 focus:border-[#007A78] focus:bg-white text-xs px-3 py-2.5 rounded-lg outline-none transition-all font-mono font-bold text-[#0A1B27]"
                      />
                      <div className="text-[10px] text-[#5C7788] mt-1 flex items-center gap-1">
                        <span>Quick test badges:</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, govtIdNumber: 'GOI-INCOIS-PFZ-02' })}
                          className="text-[#007A78] underline hover:text-black"
                        >
                          INCOIS-02
                        </button>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, govtIdNumber: 'ICG-OFF-8821' })}
                          className="text-[#007A78] underline hover:text-black"
                        >
                          ICG-8821
                        </button>
                      </div>
                    </div>

                    {/* Officer Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1.5">
                        Officer Full Name &amp; Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Dr. Ananya Sen / Cmdr. Vikram Rathore"
                        className="w-full bg-slate-50 border border-slate-300 focus:border-[#007A78] focus:bg-white text-xs px-3 py-2.5 rounded-lg outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Ministry / Department */}
                  <div>
                    <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1.5">
                      Ministry / Department Cadre
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full bg-slate-100 border border-slate-300 text-xs px-3 py-2 rounded-lg text-[#2D4454] font-medium"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Official Govt Email */}
                    <div>
                      <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1.5">
                        Official Government Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. officer.incois@orca.gov.in"
                        className="w-full bg-slate-50 border border-slate-300 focus:border-[#007A78] focus:bg-white text-xs px-3 py-2.5 rounded-lg outline-none transition-all font-mono"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1.5">
                        Security Clearance Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-300 focus:border-[#007A78] focus:bg-white text-xs px-3 py-2.5 rounded-lg outline-none transition-all"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* IF SKIPPER / RESEARCHER / PORT CREW */
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1.5">
                        Full Name / Skipper Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Capt. Rajesh Mondal"
                        className="w-full bg-slate-50 border border-slate-300 focus:border-[#007A78] focus:bg-white text-xs px-3 py-2 rounded-lg outline-none transition-all"
                      />
                    </div>

                    {/* Email / Mobile */}
                    <div>
                      <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="skipper@orca.gov.in"
                        className="w-full bg-slate-50 border border-slate-300 focus:border-[#007A78] focus:bg-white text-xs px-3 py-2 rounded-lg outline-none transition-all font-mono"
                      />
                    </div>
                  </div>

                  {selectedRole === 'skipper' && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1.5">
                          Vessel Name
                        </label>
                        <input
                          type="text"
                          value={formData.vesselName}
                          onChange={(e) => setFormData({ ...formData, vesselName: e.target.value })}
                          placeholder="FB Maa Ganga"
                          className="w-full bg-slate-50 border border-slate-300 focus:border-[#007A78] focus:bg-white text-xs px-3 py-2 rounded-lg outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1.5">
                          Marine Registration ID
                        </label>
                        <input
                          type="text"
                          value={formData.regNumber}
                          onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                          placeholder="IND-WB-24-00918"
                          className="w-full bg-slate-50 border border-slate-300 focus:border-[#007A78] focus:bg-white text-xs px-3 py-2 rounded-lg outline-none transition-all font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-[#0A1B27] uppercase tracking-wider mb-1.5">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-300 focus:border-[#007A78] focus:bg-white text-xs px-3 py-2.5 rounded-lg outline-none transition-all"
                    />
                  </div>
                </>
              )}

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting || verifyingGovtId}
                  className="w-full bg-[#007A78] hover:bg-[#006361] text-white py-3 px-4 font-sans font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer active:scale-98"
                >
                  {submitting ? (
                    <span>Verifying Identity &amp; Establishing Session…</span>
                  ) : (
                    <>
                      {selectedRole === 'officer' ? (
                        <>
                          <BadgeCheck size={16} className="text-white" />
                          <span>Verify Govt ID &amp; Sign In</span>
                        </>
                      ) : (
                        <>
                          <span>Verify Credentials &amp; Enter Portal</span>
                          <ArrowRight size={14} className="text-white" />
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Branded Alternative Logins */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <SSOButtons
                onSelectSSO={handleSSOSelect}
                selectedRole={selectedRole}
                officerType={officerType}
              />
            </div>

          </div>
        )}

        {/* STEP 3: VERIFIED WELCOME & MARITIME CLEARANCE PASS */}
        {currentStep === 'verified_welcome' && clearancePass && (
          <div className="bg-white border-2 border-[#007A78] shadow-2xl rounded-2xl p-6 sm:p-8 text-center animate-scale-up relative overflow-hidden">
            {/* National Tricolor Ribbon */}
            <div className="tricolor-ribbon absolute top-0 left-0 right-0" />

            <div className="w-16 h-16 rounded-full bg-[#007A78]/10 text-[#007A78] border-2 border-[#007A78]/30 flex items-center justify-center mx-auto mb-4 mt-2">
              <CheckCircle2 size={36} className="text-[#007A78]" />
            </div>

            <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2 font-mono">
              VERIFICATION COMPLETE · CLEARANCE GRANTED
            </span>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A1B27] mb-1">
              Welcome to ORCA Marine Command
            </h2>
            <p className="text-xs sm:text-sm text-[#5C7788] max-w-md mx-auto mb-6">
              Your identity credentials and maritime authorizations have been validated successfully.
            </p>

            {/* Visual Maritime Clearance Pass Card */}
            <div className="bg-[#E2F0F5] text-[#0A1B27] p-5 rounded-xl border border-[#BCDCE6] text-left max-w-lg mx-auto mb-6 shadow-sm font-mono">
              <div className="flex items-center justify-between pb-3 border-b border-[#BCDCE6] text-xs">
                <div className="flex items-center gap-2 text-[#007A78] font-bold">
                  <ShieldCheck size={16} />
                  <span>MARITIME CLEARANCE PASS</span>
                </div>
                <span className="text-[10px] text-[#5C7788]">{clearancePass.timestamp}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#5C7788] block">AUTHENTICATED USER</span>
                  <strong className="text-[#0A1B27] text-sm font-serif block">{clearancePass.user?.full_name}</strong>
                  <span className="text-[11px] text-[#007A78]">{clearancePass.user?.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#5C7788] block">AUTHORITY / ROLE</span>
                  <strong className="text-[#007A78] uppercase text-xs block font-bold">
                    {clearancePass.user?.role === 'officer' ? (
                      OFFICER_CATEGORIES.find((o) => o.id === clearancePass.user?.officer_type)?.title || 'Marine Officer'
                    ) : (clearancePass.user?.role || 'Skipper')}
                  </strong>
                  <span className="text-[10px] text-emerald-700 font-semibold">Verified National Identity</span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-[#BCDCE6] grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[#5C7788]">Badge / Reg ID:</span>{' '}
                  <strong className="text-[#0A1B27]">{clearancePass.govtIdNumber}</strong>
                </div>
                <div>
                  <span className="text-[#5C7788]">Station / Port:</span>{' '}
                  <strong className="text-[#0A1B27]">{clearancePass.user?.harbor_base || 'Sagar Roads Station'}</strong>
                </div>
              </div>
            </div>

            {/* Countdown & Immediate Launch */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/advisory')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#007A78] hover:bg-[#006361] text-white px-6 py-3 rounded-lg font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer active:scale-98"
              >
                <span>Enter Operations Deck Now</span>
                <ArrowRight size={14} />
              </button>
              <div className="text-xs text-[#5C7788]">
                Forwarding automatically in <strong className="text-[#0A1B27]">{countdown}s</strong>…
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  )
}
