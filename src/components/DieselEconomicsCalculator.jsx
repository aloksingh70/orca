import { useState } from 'react'
import { Fuel, IndianRupee, Leaf, TrendingDown, Gauge, Ship, Compass, Sparkles, ChevronRight } from 'lucide-react'

const VESSEL_PROFILES = [
  {
    id: 'nauka',
    label: 'Motorized Country Craft (OBM 9–15 HP)',
    short: 'Motorized Nauka',
    typicalBurn: 42, // Litres blind search
    orcaBurn: 22,    // Litres with ORCA PFZ
    avgCrew: '2–4 fishers',
    speed: '6–8 knots'
  },
  {
    id: 'trawler',
    label: 'Mechanized Gillnetter / Trawler (IBM 10–14m)',
    short: 'Mechanized Trawler',
    typicalBurn: 84, // Litres blind search
    orcaBurn: 44,    // Litres with ORCA PFZ
    avgCrew: '6–8 fishers',
    speed: '8–10 knots'
  },
  {
    id: 'deepsea',
    label: 'Deep-Sea Multi-Day Vessel (15–20m)',
    short: 'Deep-Sea Voyager',
    typicalBurn: 170, // Litres blind search
    orcaBurn: 92,     // Litres with ORCA PFZ
    avgCrew: '10–14 fishers',
    speed: '10–12 knots'
  }
]

export default function DieselEconomicsCalculator({ selectedZone = null, compact = false }) {
  const [selectedVessel, setSelectedVessel] = useState('trawler')
  const [dieselPrice, setDieselPrice] = useState(94) // INR per litre (Bengal coastal avg)
  const [customDays, setCustomDays] = useState(140)  // Typical fishing season days

  const vessel = VESSEL_PROFILES.find((v) => v.id === selectedVessel) || VESSEL_PROFILES[1]

  // Distance multiplier based on selected zone (8 km Digha up to 22 km Kakdwip)
  const distKm = selectedZone?.soundingDepth ? Math.max(8, selectedZone.soundingDepth * 0.9) : 14
  const distFactor = Math.max(0.85, Math.min(1.25, distKm / 14))

  const blindLitres = Math.round(vessel.typicalBurn * distFactor)
  const orcaLitres = Math.round(vessel.orcaBurn * distFactor)
  const savedLitres = blindLitres - orcaLitres
  const pctSaved = Math.round((savedLitres / blindLitres) * 100)

  const costBlind = blindLitres * dieselPrice
  const costOrca = orcaLitres * dieselPrice
  const costSavedTrip = costBlind - costOrca
  const costSavedAnnual = costSavedTrip * customDays

  // Carbon factor: 2.68 kg CO2 per litre of diesel
  const co2SavedTripKg = Math.round(savedLitres * 2.68)
  const co2SavedAnnualTonnes = ((co2SavedTripKg * customDays) / 1000).toFixed(1)

  if (compact) {
    return (
      <div className="bg-emerald-50/80 border border-emerald-300 rounded-lg p-3 text-xs">
        <div className="flex items-center justify-between font-serif font-bold text-emerald-950 mb-1.5">
          <div className="flex items-center gap-1.5">
            <Fuel size={14} className="text-emerald-700" />
            <span>Route Fuel Economics</span>
          </div>
          <span className="text-emerald-700 font-mono">~{pctSaved}% Diesel Saved</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div className="bg-white p-1.5 rounded border border-emerald-200">
            <span className="text-[10px] text-slate-500 block">Fuel Saved</span>
            <strong className="text-emerald-800 text-xs">~{savedLitres} Litres</strong>
          </div>
          <div className="bg-white p-1.5 rounded border border-emerald-200">
            <span className="text-[10px] text-slate-500 block">Cost Saved</span>
            <strong className="text-emerald-800 text-xs">₹{costSavedTrip.toLocaleString()}</strong>
          </div>
          <div className="bg-white p-1.5 rounded border border-emerald-200">
            <span className="text-[10px] text-slate-500 block">CO₂ Reduced</span>
            <strong className="text-emerald-800 text-xs">~{co2SavedTripKg} kg</strong>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#CCE4EC] rounded-xl p-4 sm:p-6 shadow-sm w-full max-w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <Fuel size={15} />
            <span>Voyage Economics &amp; Green Fleet Optimization</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0A1B27]">
            Diesel &amp; Expenditure Savings Calculator
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Compare wasteful "blind searching" voyages with ORCA's direct hydrodynamic navigation to verified fish aggregations.
          </p>
        </div>

        {/* Diesel Price Pill */}
        <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg self-start sm:self-auto">
          <span className="text-slate-500">Diesel Tariff:</span>
          <strong className="text-slate-900">₹{dieselPrice}/L</strong>
        </div>
      </div>

      {/* Vessel Type Selector Tabs */}
      <div className="mt-4">
        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
          Select Vessel Class:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {VESSEL_PROFILES.map((v) => {
            const isSelected = selectedVessel === v.id
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVessel(v.id)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-xs font-serif font-bold text-slate-900 block truncate">{v.short}</strong>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>{v.avgCrew}</span>
                  <span className="font-mono">{v.speed}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Visual Fuel Comparison Bar */}
      <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-serif font-bold text-slate-900">Cruise Voyage Comparison</span>
          <span className="font-mono font-bold text-emerald-700 text-xs bg-emerald-100 px-2 py-0.5 rounded">
            {pctSaved}% Fuel Reduction
          </span>
        </div>

        {/* Blind search bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
            <span>Blind Search Voyage (No Satellite Guidance)</span>
            <strong className="text-red-700 font-bold">{blindLitres} Litres · ₹{costBlind.toLocaleString()}</strong>
          </div>
          <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* ORCA PFZ Directed bar */}
        <div>
          <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
            <span className="text-emerald-800 font-bold flex items-center gap-1">
              <Sparkles size={12} className="text-emerald-600" />
              <span>ORCA Direct Route to {selectedZone?.zoneName || 'Sector'}</span>
            </span>
            <strong className="text-emerald-700 font-bold">{orcaLitres} Litres · ₹{costOrca.toLocaleString()}</strong>
          </div>
          <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all"
              style={{ width: `${100 - pctSaved}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3 Impact Stat Boxes */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Stat 1: Fuel Saved */}
        <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-800 text-xs mb-1 font-semibold">
            <span>Fuel Saved / Trip</span>
            <Fuel size={15} className="text-emerald-700" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-emerald-950 font-mono">
            {savedLitres} <span className="text-xs font-sans text-emerald-700 font-normal">Litres</span>
          </div>
          <span className="text-[10px] text-emerald-800/80 mt-1 font-mono">
            Cut cruising time by ~4 hours
          </span>
        </div>

        {/* Stat 2: Rupees Saved */}
        <div className="p-3.5 rounded-xl border border-teal-300 bg-teal-50/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-teal-800 text-xs mb-1 font-semibold">
            <span>Cash Saved / Trip</span>
            <IndianRupee size={15} className="text-teal-700" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-teal-950 font-mono">
            ₹{costSavedTrip.toLocaleString()}
          </div>
          <span className="text-[10px] text-teal-800/80 mt-1 font-mono">
            Annual projection: ₹{(costSavedAnnual / 100000).toFixed(2)} Lakhs
          </span>
        </div>

        {/* Stat 3: Carbon Offset */}
        <div className="p-3.5 rounded-xl border border-blue-300 bg-blue-50/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-800 text-xs mb-1 font-semibold">
            <span>Carbon Prevented</span>
            <Leaf size={15} className="text-blue-700" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-blue-950 font-mono">
            {co2SavedTripKg} <span className="text-xs font-sans text-blue-700 font-normal">kg CO₂</span>
          </div>
          <span className="text-[10px] text-blue-800/80 mt-1 font-mono">
            ~{co2SavedAnnualTonnes} Metric Tonnes CO₂ / yr
          </span>
        </div>
      </div>
    </div>
  )
}
