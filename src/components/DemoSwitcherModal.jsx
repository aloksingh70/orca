import { useState } from 'react'
import {
  X,
  Sparkles,
  Ship,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Anchor,
  Waves,
  Radio,
  Check,
  ArrowRight
} from 'lucide-react'
import { DEMO_USERS } from '../lib/demoUsers.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function DemoSwitcherModal({ isOpen, onClose }) {
  const { user: currentUser, login } = useAuth()
  const [switchingEmail, setSwitchingEmail] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handleSelectUser = async (demoUser) => {
    if (currentUser?.email === demoUser.email) {
      onClose()
      return
    }

    setSwitchingEmail(demoUser.email)
    setErrorMsg('')
    try {
      await login(demoUser.email, demoUser.password)
      onClose()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to switch demo account')
    } finally {
      setSwitchingEmail(null)
    }
  }

  const getRoleIcon = (role, officerType) => {
    if (role === 'skipper') return <Ship size={18} className="text-emerald-700" />
    if (role === 'researcher') return <Cpu size={18} className="text-amber-700" />
    if (role === 'port_crew') return <Anchor size={18} className="text-slate-700" />
    if (officerType === 'coast_guard') return <Radio size={18} className="text-orange-600" />
    if (officerType === 'fisheries_officer') return <ShieldCheck size={18} className="text-blue-700" />
    return <Waves size={18} className="text-[#007A78]" />
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-[#BCDCE6] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#E2F0F5] border-b border-[#BCDCE6] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#007A78] text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#0A1B27]">
                Switch Demo User Persona
              </h3>
              <p className="text-xs text-[#5C7788]">
                Instantly toggle between stakeholder decks to evaluate role-specific features.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5C7788] hover:text-[#0A1B27] hover:bg-white/80 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {errorMsg}
          </div>
        )}

        {/* User Options List */}
        <div className="p-5 overflow-y-auto space-y-2.5 flex-1">
          {DEMO_USERS.map((demo) => {
            const isActive = currentUser?.email === demo.email
            const isSwitching = switchingEmail === demo.email

            return (
              <div
                key={demo.id}
                onClick={() => handleSelectUser(demo)}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isActive
                    ? 'border-[#007A78] bg-[#E2F0F5]/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 shrink-0">
                    {getRoleIcon(demo.role, demo.officerType)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-xs font-serif font-bold text-[#0A1B27]">
                        {demo.name}
                      </strong>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${demo.badgeClass}`}>
                        {demo.badgeText}
                      </span>
                      {isActive && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-1 font-mono">
                          <Check size={10} /> Active Now
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#007A78] truncate">
                      {demo.title}
                    </div>
                    <div className="text-[10px] text-[#5C7788] truncate">
                      {demo.deckName} · <span className="font-mono">{demo.email}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isSwitching ? (
                    <div className="w-5 h-5 border-2 border-[#007A78] border-t-transparent rounded-full animate-spin" />
                  ) : isActive ? (
                    <span className="text-xs font-bold text-[#007A78] font-mono">CURRENT</span>
                  ) : (
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#007A78] text-white hover:bg-[#006361] transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Switch</span>
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-[11px] text-[#5C7788]">
          <span>Password for all accounts: <strong className="text-[#0A1B27] font-mono">orca123</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#007A78] font-bold hover:underline cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
