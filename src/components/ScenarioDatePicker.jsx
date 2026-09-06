import { Calendar, Anchor, AlertOctagon, CloudLightning } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function ScenarioDatePicker({ date, onChange }) {
  const { t } = useLanguage()

  const presets = [
    { 
      key: 'open',
      label: t('advisory', 'presetOpen'), 
      date: `${new Date().getFullYear()}-03-24`, 
      icon: Anchor,
      activeClass: 'bg-emerald-700 text-white border-emerald-800 shadow-xs ring-2 ring-emerald-500/40 font-bold',
      inactiveClass: 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100 font-semibold',
      iconActiveColor: 'text-white',
      iconInactiveColor: 'text-emerald-700'
    },
    { 
      key: 'ban',
      label: t('advisory', 'presetBan'), 
      date: `${new Date().getFullYear()}-05-18`, 
      icon: AlertOctagon,
      activeClass: 'bg-rose-700 text-white border-rose-800 shadow-xs ring-2 ring-rose-500/40 font-bold',
      inactiveClass: 'bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100 font-semibold',
      iconActiveColor: 'text-white',
      iconInactiveColor: 'text-rose-700'
    },
    { 
      key: 'squall',
      label: t('advisory', 'presetSquall'), 
      date: `${new Date().getFullYear()}-07-10`, 
      icon: CloudLightning,
      activeClass: 'bg-amber-600 text-white border-amber-700 shadow-xs ring-2 ring-amber-500/40 font-bold',
      inactiveClass: 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100 font-semibold',
      iconActiveColor: 'text-white',
      iconInactiveColor: 'text-amber-800'
    }
  ]

  return (
    <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-lg border border-slate-300 shadow-xs">
      {/* Date Input Box */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded border border-slate-300 text-xs">
        <Calendar size={14} className="text-slate-700 shrink-0" />
        <label htmlFor="scenario-date" className="text-xs text-slate-800 uppercase font-bold tracking-wide">
          {t('advisory', 'voyageDate')}
        </label>
        <input
          id="scenario-date"
          type="date"
          value={date}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent font-sans text-xs text-slate-900 font-bold outline-none tabular-nums [color-scheme:light] cursor-pointer"
        />
      </div>

      {/* Quick Scenario Triggers */}
      <div className="flex flex-wrap items-center gap-1.5">
        {presets.map((p) => {
          const Icon = p.icon
          const isActive = date === p.date
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => onChange(p.date)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs tabular-nums transition-all border cursor-pointer ${
                isActive ? p.activeClass : p.inactiveClass
              }`}
            >
              <Icon size={13} className={`shrink-0 ${isActive ? p.iconActiveColor : p.iconInactiveColor}`} />
              <span>{p.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

