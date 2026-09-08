import { useState } from 'react'
import { ShieldCheck, CheckCircle2, ChevronRight, X, Sparkles } from 'lucide-react'

// Authentic Google Multicolor SVG Logo
export function GoogleLogo({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  )
}

// Authentic DigiLocker / MeriPehchaan (National SSO) SVG Logo
export function DigiLockerLogo({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#0E3A75"/>
      <path d="M16 6L7 11V16C7 21.52 10.84 26.74 16 28C21.16 26.74 25 21.52 25 16V11L16 6Z" fill="#1B60B8"/>
      <path d="M16 8.5L9 12.5V16.5C9 20.8 12 24.8 16 25.8C20 24.8 23 20.8 23 16.5V12.5L16 8.5Z" fill="#2E86DE"/>
      <path d="M14 17.5L11.5 15L10 16.5L14 20.5L22 12.5L20.5 11L14 17.5Z" fill="#FFFFFF"/>
      <circle cx="16" cy="16" r="1.5" fill="#F39C12"/>
    </svg>
  )
}

// NavIC (ISRO Satellite Constellation) SVG Logo
export function NavICLogo({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#14213d"/>
      <circle cx="16" cy="16" r="12" stroke="#e86014" strokeWidth="1.5" strokeDasharray="2 3"/>
      <circle cx="16" cy="16" r="7" stroke="#00b4d8" strokeWidth="1.5"/>
      <circle cx="16" cy="16" r="3" fill="#fca311"/>
      <path d="M16 3V7M16 25V29M3 16H7M25 16H29" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export default function SSOButtons({ onSelectSSO, selectedRole, officerType }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [activeProvider, setActiveProvider] = useState(null)

  // Pre-configured official profiles for seamless 1-click SSO demo
  const sampleProfiles = {
    google: [
      {
        name: "Capt. Rajesh Mondal",
        email: "skipper.rajesh@gmail.com",
        role: "skipper",
        vessel: "FB Maa Ganga (WB-24-M-104)",
        reg: "IND-WB-24-00918",
        harbor: "Shankarpur Principal Fishing Harbour",
        avatar: "RM",
        label: "Master Skipper Profile"
      },
      {
        name: "Dr. Ananya Sen",
        email: "ananya.incois.scientist@gmail.com",
        role: "officer",
        officerType: "incois_scientist",
        badge: "GOI-INCOIS-PFZ-02",
        dept: "INCOIS Ocean Monitoring",
        avatar: "AS",
        label: "Scientist Profile"
      }
    ],
    digilocker: [
      {
        name: "Cmdr. Vikram Rathore",
        email: "vikram.rathore@gov.in",
        role: "officer",
        officerType: "coast_guard",
        badge: "ICG-OFF-8821",
        dept: "Indian Coast Guard (Ministry of Defence)",
        avatar: "VR",
        label: "DigiLocker Verified Govt ID"
      },
      {
        name: "Sunil Roy (Fisheries Officer)",
        email: "sunil.roy@wb.gov.in",
        role: "officer",
        officerType: "fisheries_officer",
        badge: "WB-FISH-7734",
        dept: "Directorate of Marine Fisheries",
        avatar: "SR",
        label: "State Marine Cadre ID"
      }
    ],
    navic: [
      {
        name: "Vessel FB Maa Ganga NavIC Hub",
        email: "navic.wb24.104@isro.navic.in",
        role: "skipper",
        vessel: "FB Maa Ganga (WB-24-M-104)",
        reg: "IND-WB-24-00918",
        harbor: "Shankarpur Principal Fishing Harbour",
        avatar: "NV",
        label: "ISRO NavIC Satellite Terminal ID"
      }
    ]
  }

  const handleProviderClick = (provider) => {
    setActiveProvider(provider)
    setModalOpen(true)
  }

  const handleConfirmProfile = (profile) => {
    setModalOpen(false)
    onSelectSSO({
      provider: activeProvider,
      email: profile.email,
      full_name: profile.name,
      role: profile.role || selectedRole || 'skipper',
      officer_type: profile.officerType || officerType,
      govt_id_number: profile.badge,
      department: profile.dept,
      vessel_name: profile.vessel,
      registration_number: profile.reg,
      harbor_base: profile.harbor
    })
  }

  return (
    <div className="space-y-2.5">
      <div className="relative flex items-center justify-center my-3">
        <div className="border-t border-[#CCE4EC] w-full" />
        <span className="bg-white px-3 text-[11px] font-bold text-[#5C7788] uppercase tracking-wider shrink-0">
          Or Continue With
        </span>
      </div>

      <div className="grid sm:grid-cols-3 gap-2.5">
        {/* Google SSO */}
        <button
          type="button"
          onClick={() => handleProviderClick('google')}
          className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#0A1B27] border border-[#CCE4EC] hover:border-[#007A78] px-3 py-2.5 rounded font-sans font-semibold text-xs transition-all shadow-2xs cursor-pointer group"
        >
          <GoogleLogo className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
          <span>Google</span>
        </button>

        {/* DigiLocker / MeriPehchaan */}
        <button
          type="button"
          onClick={() => handleProviderClick('digilocker')}
          className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#0A1B27] border border-[#CCE4EC] hover:border-[#0E3A75] px-3 py-2.5 rounded font-sans font-semibold text-xs transition-all shadow-2xs cursor-pointer group"
        >
          <DigiLockerLogo className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
          <span>DigiLocker SSO</span>
        </button>

        {/* NavIC / ISRO Marine */}
        <button
          type="button"
          onClick={() => handleProviderClick('navic')}
          className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#0A1B27] border border-[#CCE4EC] hover:border-[#e86014] px-3 py-2.5 rounded font-sans font-semibold text-xs transition-all shadow-2xs cursor-pointer group"
        >
          <NavICLogo className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
          <span>NavIC Marine</span>
        </button>
      </div>

      {/* Interactive Profile Selection Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#BCDCE6] shadow-2xl rounded-lg max-w-md w-full p-5 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0EEF3] mb-4">
              <div className="flex items-center gap-2">
                {activeProvider === 'google' && <GoogleLogo className="w-5 h-5" />}
                {activeProvider === 'digilocker' && <DigiLockerLogo className="w-5 h-5" />}
                {activeProvider === 'navic' && <NavICLogo className="w-5 h-5" />}
                <h3 className="font-serif font-bold text-[#0A1B27] text-sm">
                  {activeProvider === 'google' && 'Select Google Account'}
                  {activeProvider === 'digilocker' && 'DigiLocker / MeriPehchaan Verified Citizen ID'}
                  {activeProvider === 'navic' && 'ISRO NavIC Marine Identity Gateway'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-[#5C7788] hover:text-[#0A1B27] p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-[#5C7788] mb-3">
              Choose an authorized account to immediately verify credentials and issue your secure maritime session clearance:
            </p>

            <div className="space-y-2 mb-4">
              {(sampleProfiles[activeProvider] || []).map((prof) => (
                <button
                  key={prof.email}
                  type="button"
                  onClick={() => handleConfirmProfile(prof)}
                  className="w-full text-left p-3 rounded border border-[#CCE4EC] hover:border-[#007A78] hover:bg-[#E2F0F5]/50 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#007A78] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {prof.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#0A1B27]">{prof.name}</span>
                        <span className="text-[10px] bg-[#E1F3F5] text-[#007A78] px-1.5 py-0.5 font-bold rounded">
                          {prof.label}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#5C7788] font-mono">{prof.email}</div>
                      {prof.badge && (
                        <div className="text-[10px] text-[#E86014] font-semibold mt-0.5">
                          Govt Badge: {prof.badge}
                        </div>
                      )}
                      {prof.vessel && (
                        <div className="text-[10px] text-[#007A78] font-semibold mt-0.5">
                          Vessel: {prof.vessel}
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[#809BAA] group-hover:text-[#007A78] group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E0EEF3] flex items-center justify-between text-[11px] text-[#5C7788]">
              <span className="flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>256-bit Encrypted Government Marine Gateway</span>
              </span>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-xs font-semibold text-[#0A1B27] hover:underline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
