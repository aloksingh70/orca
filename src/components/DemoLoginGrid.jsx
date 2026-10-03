import { useState } from 'react'
import {
  Ship,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Anchor,
  Waves,
  ArrowRight,
  Sparkles,
  Check,
  Lock,
  Copy,
  CheckCircle2,
  Radio,
  FileText,
  Compass
} from 'lucide-react'
import { DEMO_USERS } from '../lib/demoUsers.js'

export default function DemoLoginGrid({ onInstantLogin, onFillCredentials, isAuthenticating }) {
  const [copiedEmail, setCopiedEmail] = useState(null)

  const handleCopy = (email, e) => {
    e.stopPropagation()
    navigator.clipboard?.writeText(email)
    setCopiedEmail(email)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  const getRoleIcon = (role, officerType) => {
    if (role === 'public') return <Compass size={20} className="text-sky-600" />
    if (role === 'skipper') return <Ship size={20} className="text-emerald-700" />
    if (role === 'researcher') return <Cpu size={20} className="text-amber-700" />
    if (role === 'port_crew') return <Anchor size={20} className="text-slate-700" />
    if (officerType === 'coast_guard') return <Radio size={20} className="text-orange-600" />
    if (officerType === 'fisheries_officer') return <ShieldCheck size={20} className="text-blue-700" />
    return <Waves size={20} className="text-[#007A78]" />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-[#CCE4EC]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#007A78]/10 text-[#007A78]">
              <Sparkles size={16} />
            </span>
            <h2 className="font-serif font-bold text-lg text-[#0A1B27]">
              Demo Accounts &amp; 1-Click Fast Track
            </h2>
          </div>
          <p className="text-xs text-[#5C7788] mt-0.5">
            Click <span className="font-semibold text-[#007A78]">Instant Access</span> on any role to log in immediately with pre-configured maritime credentials.
          </p>
        </div>
        <div className="text-[11px] font-mono bg-[#E2F0F5] border border-[#BCDCE6] px-2.5 py-1 rounded text-[#0A1B27]">
          Default Demo Password: <strong className="text-[#007A78]">orca123</strong>
        </div>
      </div>

      {/* 6 Persona Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {DEMO_USERS.map((user) => {
          const isCurrentLoading = isAuthenticating === user.email

          return (
            <div
              key={user.id}
              className={`bg-white border-2 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between shadow-2xs hover:shadow-md ${
                user.id === 'visitor'
                  ? 'border-sky-200 hover:border-sky-500'
                  : user.id === 'skipper'
                  ? 'border-emerald-200 hover:border-emerald-500'
                  : user.id === 'coast_guard'
                  ? 'border-orange-200 hover:border-orange-500'
                  : user.id === 'incois_scientist'
                  ? 'border-teal-200 hover:border-teal-600'
                  : user.id === 'researcher'
                  ? 'border-amber-200 hover:border-amber-500'
                  : user.id === 'fisheries_officer'
                  ? 'border-blue-200 hover:border-blue-500'
                  : 'border-slate-200 hover:border-slate-500'
              }`}
            >
              <div>
                {/* Card Header: Icon + Badge */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    {getRoleIcon(user.role, user.officerType)}
                  </div>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${user.badgeClass}`}>
                    {user.badgeText}
                  </span>
                </div>

                {/* Name & Title */}
                <h3 className="font-serif font-bold text-sm text-[#0A1B27] leading-snug">
                  {user.name}
                </h3>
                <div className="text-[11px] font-semibold text-[#007A78] mt-0.5">
                  {user.title}
                </div>
                <div className="text-[10px] text-[#5C7788] line-clamp-1 mt-0.5" title={user.vesselOrStation}>
                  {user.vesselOrStation}
                </div>

                {/* Credentials Pill */}
                <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded-md font-mono text-[10px] flex items-center justify-between text-[#2D4454]">
                  <span className="truncate max-w-[165px]" title={user.email}>
                    {user.email}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleCopy(user.email, e)}
                    title="Copy Email"
                    className="text-[#5C7788] hover:text-[#007A78] p-0.5 cursor-pointer"
                  >
                    {copiedEmail === user.email ? (
                      <Check size={12} className="text-emerald-600" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>

                {/* Key Capabilities */}
                <div className="mt-3">
                  <span className="text-[10px] font-bold text-[#5C7788] uppercase tracking-wider block mb-1">
                    Authorized Deck:
                  </span>
                  <div className="text-[11px] font-semibold text-[#0A1B27] mb-1.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#007A78]" />
                    <span>{user.deckName}</span>
                  </div>
                  <ul className="space-y-1 text-[10px] text-[#5C7788]">
                    {user.keyCapabilities.slice(0, 2).map((cap, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 size={11} className="shrink-0 text-[#007A78] mt-0.5" />
                        <span className="line-clamp-1">{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  disabled={!!isAuthenticating}
                  onClick={() => onInstantLogin(user)}
                  className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold font-sans uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-98 disabled:opacity-50 ${user.btnClass}`}
                >
                  {isCurrentLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-[11px]">Entering…</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} />
                      <span className="text-[11px]">Instant Access</span>
                    </>
                  )}
                </button>

                {onFillCredentials && (
                  <button
                    type="button"
                    disabled={!!isAuthenticating}
                    onClick={() => onFillCredentials(user)}
                    title="Pre-fill form to inspect credentials or test manual sign in"
                    className="p-2 border border-slate-300 hover:border-[#007A78] text-[#5C7788] hover:text-[#007A78] bg-white rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    <FileText size={14} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
