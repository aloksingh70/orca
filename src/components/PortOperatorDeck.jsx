import { useState, useEffect } from 'react'
import {
  Anchor,
  Fish,
  Calendar,
  Clock,
  TrendingUp,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Building,
  Layers,
  ChevronDown,
  ChevronUp,
  FileCheck2
} from 'lucide-react'
import { simulateSpeciesMix, simulateWeeklyVolume } from '../lib/derived.js'
import { submitLandingLog, fetchLandingLogs } from '../lib/api.js'
import { zones } from '../lib/zones.js'

export default function PortOperatorDeck({
  results = [],
  scanDate,
  selectedZone
}) {
  const [showLogModal, setShowLogModal] = useState(false)
  const [landingLogs, setLandingLogs] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [backendOffline, setBackendOffline] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  // Landing form state
  const [landingDate, setLandingDate] = useState(scanDate)
  const [actualKg, setActualKg] = useState('')
  const [species, setSpecies] = useState('Hilsa (Tenualosa ilisha)')
  const [notes, setNotes] = useState('')

  // 1. Species Mix for Selected Zone
  const hist = selectedZone?.agents?.find((a) => a.agent === 'history')
  const catchMatch = hist?.readouts?.[0]?.value?.match(/(\d+)/)
  const estimatedCatchKg = catchMatch ? parseInt(catchMatch[1], 10) : 450
  const speciesMix = simulateSpeciesMix(selectedZone?.zoneId || 'digha', scanDate, estimatedCatchKg)

  // 2. Weekly 7-Day Inflow Forecast
  const weeklyForecast = simulateWeeklyVolume(zones, scanDate)

  // 3. Multi-Port Comparative Intake
  const portHubs = [
    {
      harbor: 'Digha Mohana Jetty',
      sectorCode: 'WB-01',
      zoneId: 'digha',
      distance: '8 km',
      berths: '18 mechanized berths',
      coldChain: '400 MT ice plant'
    },
    {
      harbor: 'Shankarpur Principal Fishing Harbour',
      sectorCode: 'WB-02',
      zoneId: 'shankarpur',
      distance: '11 km',
      berths: '42 trawler berths',
      coldChain: '850 MT export hub'
    },
    {
      harbor: 'Frazerganj Fishing Harbour',
      sectorCode: 'WB-05',
      zoneId: 'frazerganj',
      distance: '18 km',
      berths: '24 motorized berths',
      coldChain: '250 MT flake ice'
    },
    {
      harbor: 'Sagar Roads Anchorage',
      sectorCode: 'WB-04',
      zoneId: 'sagar-island',
      distance: '22 km',
      berths: 'Offshore mooring',
      coldChain: 'Direct reefer barge'
    }
  ]

  // Quayside Delivery Countdown ETA (8 knots average return cruise)
  const calculateETA = (distanceStr) => {
    const km = parseFloat(distanceStr) || 12
    const nm = km * 0.539957
    const returnHours = nm / 8
    const totalMinutes = Math.round(returnHours * 60)
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    return { hours, mins, totalMinutes, text: `${hours}h ${mins}m` }
  }

  const selectedEta = calculateETA(selectedZone?.distanceOffshore)

  // Load landing logs from API
  const loadLandings = async () => {
    try {
      const logs = await fetchLandingLogs(selectedZone?.zoneId)
      setLandingLogs(logs)
    } catch (err) {
      console.warn('Could not load landing logs:', err)
    }
  }

  useEffect(() => {
    loadLandings()
  }, [selectedZone?.zoneId])

  const validateForm = () => {
    const errs = {}
    if (!landingDate || !landingDate.trim()) {
      errs.landingDate = 'Landing date is required'
    } else if (isNaN(Date.parse(landingDate))) {
      errs.landingDate = 'Please enter a valid date'
    }

    const kg = parseFloat(actualKg)
    if (!actualKg || isNaN(kg)) {
      errs.actualKg = 'Landed weight is required'
    } else if (kg <= 0) {
      errs.actualKg = 'Weight must be greater than 0 kg'
    } else if (kg > 50000) {
      errs.actualKg = 'Weight exceeds single-trip maximum (50,000 kg)'
    }

    if (!species || !species.trim()) {
      errs.species = 'Dominant species is required'
    }

    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleLandingSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    setSubmitStatus(null)
    setErrorMessage('')

    try {
      const res = await submitLandingLog({
        zone_id: selectedZone?.zoneId || 'digha',
        zone_name: selectedZone?.zoneName || 'Digha',
        landing_date: landingDate,
        actual_kg: parseFloat(actualKg),
        species,
        notes: notes || 'Quayside verification logged from ORCA Port Console'
      })

      if (res && res.isLive === false) {
        setBackendOffline(true)
        setSubmitStatus('error')
        setErrorMessage(res.error || 'Backend offline: Server unreachable on port 8000. Recording disabled until connection is restored.')
      } else if (res && res.error) {
        setSubmitStatus('error')
        setErrorMessage(res.error)
      } else {
        setSubmitStatus('success')
        setFormErrors({})
        setActualKg('')
        setNotes('')
        await loadLandings()
        setTimeout(() => setSubmitStatus(null), 5000)
      }
    } catch (err) {
      console.error('Error logging landing:', err)
      setSubmitStatus('error')
      setErrorMessage(err.message || 'Network error communicating with port backend')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Top Port Logistics Control Bar */}
      <div className="bg-white border border-[#CCE4EC] p-3.5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-serif font-bold text-[#0A1B27] flex items-center gap-1.5">
            <Anchor size={16} className="text-[#007A78]" />
            <span>Port Quayside Logistics &amp; Cold Storage Planner</span>
          </span>

          <span className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded font-mono font-medium">
            Active Hub: {selectedZone?.harborName || 'Digha Mohana'}
          </span>
        </div>

        {/* Quayside ETA & Log Intake Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            <Clock size={12} className="text-[#007A78]" />
            <span>Returning Fleet ETA: <strong>~{selectedEta.text}</strong> from {selectedZone?.zoneName}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowLogModal(!showLogModal)}
            className="bg-[#007A78] hover:bg-[#006361] text-white px-3.5 py-1.5 rounded-md font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <PlusCircle size={13} />
            <span>Log Actual Intake</span>
          </button>
        </div>
      </div>

      {/* Grid: Species Mix & Weekly 7-Day Inflow Trend */}
      <div className="grid md:grid-cols-12 gap-4">
        
        {/* Left (6 cols): Projected Species-Mix Composition */}
        <div className="md:col-span-6 bg-white border border-[#CCE4EC] p-4 sm:p-5 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="font-serif font-bold text-[#0A1B27] text-sm flex items-center gap-1.5">
                <Fish size={15} className="text-[#007A78]" />
                <span>Species-Mix Composition Forecast</span>
              </h4>
              <span className="text-[11px] font-mono text-slate-500">
                {selectedZone?.zoneName || 'Sector'}
              </span>
            </div>
            <p className="text-[11px] text-[#5C7788] mb-4">
              Estimated landing proportion based on CMFRI historical gillnetting &amp; trawler seasonal abundance models.
            </p>

            {/* Stacked Percentage Bar */}
            <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-200 mb-3 shadow-inner">
              {speciesMix.map((sp, idx) => {
                const colors = ['bg-emerald-600', 'bg-[#007A78]', 'bg-amber-500', 'bg-indigo-500', 'bg-slate-500']
                return (
                  <div
                    key={sp.species}
                    className={`${colors[idx % colors.length]} transition-all`}
                    style={{ width: `${sp.percentage}%` }}
                    title={`${sp.species}: ${sp.percentage}% (~${sp.estimatedKg} kg)`}
                  />
                )
              })}
            </div>

            {/* Species Table Breakdown */}
            <div className="divide-y divide-slate-100 text-xs">
              {speciesMix.map((sp, idx) => {
                const dotColors = ['bg-emerald-600', 'bg-[#007A78]', 'bg-amber-500', 'bg-indigo-500', 'bg-slate-500']
                const speciesName = sp.species || sp.shortName || sp.name
                const speciesKg = sp.estimatedKg ?? sp.kg ?? 0
                return (
                  <div key={speciesName} className="py-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${dotColors[idx % dotColors.length]}`} />
                      <span className="font-medium text-slate-800">{speciesName}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="font-bold text-slate-900">{sp.percentage}%</span>
                      <span className="text-slate-500 w-16 text-right">{speciesKg} kg</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Projected Zone Volume:</span>
            <strong className="text-slate-900 font-bold">{estimatedCatchKg} kg / trip</strong>
          </div>
        </div>

        {/* Right (6 cols): 7-Day Inflow Volume Trend */}
        <div className="md:col-span-6 bg-white border border-[#CCE4EC] p-4 sm:p-5 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="font-serif font-bold text-[#0A1B27] text-sm flex items-center gap-1.5">
                <TrendingUp size={15} className="text-[#007A78]" />
                <span>7-Day Harbor Inflow Projection</span>
              </h4>
              <span className="text-[11px] font-mono text-slate-500">All Sectors Total</span>
            </div>
            <p className="text-[11px] text-[#5C7788] mb-3">
              Projected daily aggregate biomass arrivals across West Bengal terminals for cold-storage ice planning.
            </p>

            {/* Weekly Bar Chart */}
            <div className="grid grid-cols-7 gap-1.5 h-36 items-end pt-4 font-mono text-center">
              {weeklyForecast.map((day, idx) => {
                const maxVol = 3500
                const vol = day.totalBiomassKg ?? day.totalKg ?? 0
                const heightPct = Math.max(15, Math.min(100, (vol / maxVol) * 100))
                const isToday = idx === 0

                return (
                  <div key={day.date} className="flex flex-col items-center justify-end h-full group">
                    <span className="text-[9px] text-slate-600 font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(vol / 1000).toFixed(1)}t
                    </span>
                    <div className="w-full bg-slate-100 rounded-t h-24 flex items-end p-0.5">
                      <div
                        className={`w-full rounded-t transition-all ${
                          isToday ? 'bg-[#007A78]' : 'bg-slate-400 group-hover:bg-[#007A78]'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className={`text-[10px] mt-1.5 ${isToday ? 'font-bold text-[#007A78]' : 'text-slate-500'}`}>
                      {day.dayName || day.dayLabel}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>7-Day Total Cumulative Intake:</span>
            <strong className="text-slate-900 font-bold">
              {((weeklyForecast.reduce((acc, d) => acc + (d.totalBiomassKg ?? d.totalKg ?? 0), 0)) / 1000).toFixed(2)} Metric Tonnes
            </strong>
          </div>
        </div>

      </div>

      {/* Multi-Port Harbor Comparison Ledger */}
      <div className="bg-white border border-[#CCE4EC] p-4 sm:p-5 rounded-xl shadow-xs">
        <h4 className="font-serif font-bold text-[#0A1B27] text-sm flex items-center gap-1.5 mb-2">
          <Building size={15} className="text-[#007A78]" />
          <span>Regional Harbor Terminal Capacity &amp; Cold-Chain Comparison</span>
        </h4>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs mt-3">
          {portHubs.map((hub) => {
            const zRes = results.find((r) => r.zoneId === hub.zoneId)
            const isClosed = zRes?.verdict === 'Seasonal Closure' || zRes?.verdict === 'Unsafe Today'

            return (
              <div
                key={hub.harbor}
                className={`p-3 rounded-lg border flex flex-col justify-between gap-2 ${
                  isClosed ? 'bg-red-50/50 border-red-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 mb-1">
                    <span>{hub.sectorCode}</span>
                    <span className={isClosed ? 'text-red-700 font-bold' : 'text-emerald-700 font-bold'}>
                      {isClosed ? 'Moorings Closed' : 'Berths Open'}
                    </span>
                  </div>
                  <strong className="font-serif font-bold text-slate-900 text-xs block truncate" title={hub.harbor}>
                    {hub.harbor}
                  </strong>
                  <div className="text-[11px] text-slate-600 mt-1">
                    {hub.berths} · {hub.coldChain}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 font-mono text-[11px] flex items-center justify-between">
                  <span className="text-slate-500">Intake Today:</span>
                  <strong className={isClosed ? 'text-red-700' : 'text-slate-900 font-bold'}>
                    {isClosed ? '0 kg' : `${zRes?.agents?.find(a => a.agent === 'history')?.readouts?.[0]?.value?.match(/(\d+)/)?.[1] || 400} kg`}
                  </strong>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Log Actual Landings Form & History Accordion */}
      {showLogModal && (
        <div className="bg-white border border-[#CCE4EC] p-4 sm:p-5 rounded-xl shadow-xs animate-fade-in">
          <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <FileCheck2 size={16} className="text-[#007A78]" />
              <h4 className="font-serif font-bold text-[#0A1B27] text-sm">
                Quayside Actual Landings Entry &amp; Forecast Reconciliation
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setShowLogModal(false)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          <form onSubmit={handleLandingSubmit} className="bg-[#EAF4F8] border border-[#BCDCE6] p-4 rounded-lg mb-4">
            {backendOffline && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs flex items-center gap-2 mb-3">
                <AlertCircle size={16} className="text-amber-700 shrink-0" />
                <span>
                  <strong>Backend Offline:</strong> FastAPI telemetry server is unreachable on port 8000. New quayside submissions are temporarily disabled.
                </span>
              </div>
            )}

            <div className="grid sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Landing Date</label>
                <input
                  type="date"
                  value={landingDate}
                  onChange={(e) => {
                    setLandingDate(e.target.value)
                    if (formErrors.landingDate) setFormErrors(prev => ({ ...prev, landingDate: null }))
                  }}
                  className={`w-full bg-white border rounded px-2.5 py-1.5 text-slate-800 ${
                    formErrors.landingDate ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                  }`}
                />
                {formErrors.landingDate && (
                  <span className="text-red-600 text-[11px] font-semibold mt-1 block">{formErrors.landingDate}</span>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Actual Landed Catch (kg)</label>
                <input
                  type="number"
                  min="1"
                  max="50000"
                  placeholder="e.g. 520"
                  value={actualKg}
                  onChange={(e) => {
                    setActualKg(e.target.value)
                    if (formErrors.actualKg) setFormErrors(prev => ({ ...prev, actualKg: null }))
                  }}
                  className={`w-full bg-white border rounded px-2.5 py-1.5 text-slate-800 font-mono ${
                    formErrors.actualKg ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                  }`}
                />
                {formErrors.actualKg && (
                  <span className="text-red-600 text-[11px] font-semibold mt-1 block">{formErrors.actualKg}</span>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Dominant Species</label>
                <select
                  value={species}
                  onChange={(e) => {
                    setSpecies(e.target.value)
                    if (formErrors.species) setFormErrors(prev => ({ ...prev, species: null }))
                  }}
                  className={`w-full bg-white border rounded px-2.5 py-1.5 text-slate-800 ${
                    formErrors.species ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="Hilsa (Tenualosa ilisha)">Hilsa (Tenualosa ilisha)</option>
                  <option value="Silver Pomfret (Pampus argenteus)">Silver Pomfret (Pampus argenteus)</option>
                  <option value="Tiger Prawn (Penaeus monodon)">Tiger Prawn (Penaeus monodon)</option>
                  <option value="Bombay Duck (Harpadon nehereus)">Bombay Duck (Harpadon nehereus)</option>
                  <option value="Mixed Marine Pelagics">Mixed Marine Pelagics</option>
                </select>
                {formErrors.species && (
                  <span className="text-red-600 text-[11px] font-semibold mt-1 block">{formErrors.species}</span>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Harbor Intake Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Ice supplied, auction done"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800"
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-slate-600">
                Logged to compare forecast variance against actual wholesale scale weights.
              </span>
              <button
                type="submit"
                disabled={submitting || backendOffline}
                className={`px-4 py-1.5 rounded font-bold text-xs shadow-xs transition-colors cursor-pointer ${
                  backendOffline
                    ? 'bg-slate-400 text-slate-200 cursor-not-allowed'
                    : 'bg-[#007A78] hover:bg-[#006361] text-white'
                }`}
              >
                {submitting ? 'Recording...' : backendOffline ? 'Server Offline' : 'Submit Quayside Record'}
              </button>
            </div>

            {submitStatus === 'success' && (
              <div className="mt-2.5 p-2 bg-emerald-50 border border-emerald-300 rounded text-emerald-800 text-xs flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Actual landing verified and recorded in ORCA logistics ledger!</span>
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="mt-2.5 p-2 bg-red-50 border border-red-300 rounded text-red-800 text-xs flex items-center gap-1.5">
                <AlertCircle size={14} className="text-red-600" />
                <span>{errorMessage || 'Could not connect to backend server. Record preserved in local cache.'}</span>
              </div>
            )}
          </form>

          {/* Historical Landings Table */}
          <div>
            <div className="font-serif font-bold text-[#0A1B27] text-xs mb-2">
              Recent Quayside Landings &amp; Verification ({landingLogs.length})
            </div>

            {landingLogs.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded text-center text-xs text-slate-500">
                No quayside landings logged yet. Record arrival weight above.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Terminal / Sector</th>
                      <th className="p-2.5">Actual Landed (kg)</th>
                      <th className="p-2.5">Primary Species</th>
                      <th className="p-2.5">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white font-mono">
                    {landingLogs.slice(0, 5).map((l) => (
                      <tr key={l.id || l.landing_date + l.actual_kg} className="hover:bg-slate-50">
                        <td className="p-2.5 text-slate-700">{l.landing_date}</td>
                        <td className="p-2.5 font-sans font-bold text-slate-900">{l.zone_name}</td>
                        <td className="p-2.5 font-bold text-emerald-800">{l.actual_kg} kg</td>
                        <td className="p-2.5 font-sans text-slate-700">{l.species}</td>
                        <td className="p-2.5 font-sans text-slate-500 truncate max-w-xs">{l.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
