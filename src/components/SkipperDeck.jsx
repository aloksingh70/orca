import { useState, useEffect } from 'react'
import {
  Ship,
  TrendingUp,
  Clock,
  Fuel,
  Calendar,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sliders,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { simulateOutlook, calculateTripBudget } from '../lib/derived.js'
import { submitCatchLog, fetchCatchLogs } from '../lib/api.js'

export default function SkipperDeck({
  selectedZone,
  scanDate,
  boatSpeed,
  onBoatSpeedChange,
  showUsualOnly,
  onToggleUsualOnly,
  usualCount = 0
}) {
  const [outlook, setOutlook] = useState([])
  const [showLogForm, setShowLogForm] = useState(false)
  const [catchLogs, setCatchLogs] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [backendOffline, setBackendOffline] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  // Catch log form state
  const [logTripDate, setLogTripDate] = useState(scanDate)
  const [logKg, setLogKg] = useState('')
  const [logSpecies, setLogSpecies] = useState('Hilsa (Tenualosa ilisha)')
  const [logNotes, setLogNotes] = useState('')

  // Calculate 3-day outlook when selectedZone or date changes
  useEffect(() => {
    if (selectedZone) {
      const forecast = simulateOutlook(selectedZone, scanDate, 3)
      setOutlook(forecast)
    }
  }, [selectedZone, scanDate])

  // Load existing catch logs
  const loadLogs = async () => {
    try {
      const res = await submitCatchLog ? await fetchCatchLogs(selectedZone?.zoneId) : []
      setCatchLogs(res || [])
    } catch (err) {
      console.warn('Could not load catch logs:', err)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [selectedZone?.zoneId])

  const validateForm = () => {
    const errs = {}
    if (!logTripDate || !logTripDate.trim()) {
      errs.tripDate = 'Trip date is required'
    } else if (isNaN(Date.parse(logTripDate))) {
      errs.tripDate = 'Please enter a valid date'
    }

    const kg = parseFloat(logKg)
    if (!logKg || isNaN(kg)) {
      errs.kg = 'Catch weight is required'
    } else if (kg <= 0) {
      errs.kg = 'Catch weight must be greater than 0 kg'
    } else if (kg > 50000) {
      errs.kg = 'Catch weight exceeds single-voyage limit (50,000 kg)'
    }

    if (!logSpecies || !logSpecies.trim()) {
      errs.species = 'Species is required'
    }

    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleCatchSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    setSubmitStatus(null)
    setErrorMessage('')

    try {
      const res = await submitCatchLog({
        zone_id: selectedZone?.zoneId || 'digha',
        zone_name: selectedZone?.zoneName || 'Digha',
        trip_date: logTripDate,
        estimated_kg: parseFloat(logKg),
        species: logSpecies,
        notes: logNotes || 'Logged from ORCA Skipper Deck'
      })

      if (res && res.isLive === false) {
        setBackendOffline(true)
        setSubmitStatus('error')
        setErrorMessage(res.error || 'Backend offline: Server unreachable on port 8000. Logging disabled until connection is restored.')
      } else if (res && res.error) {
        setSubmitStatus('error')
        setErrorMessage(res.error)
      } else {
        setSubmitStatus('success')
        setFormErrors({})
        setLogKg('')
        setLogNotes('')
        await loadLogs()
        setTimeout(() => setSubmitStatus(null), 5000)
      }
    } catch (err) {
      console.error('Error logging catch:', err)
      setSubmitStatus('error')
      setErrorMessage(err.message || 'Network error communicating with maritime backend server')
    } finally {
      setSubmitting(false)
    }
  }

  const tripBudget = calculateTripBudget(selectedZone?.distanceOffshore || '10 km', boatSpeed, 14)

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Top Filter & Boat Controls Bar */}
      <div className="bg-white border border-[#CCE4EC] p-3.5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-serif font-bold text-[#0A1B27] flex items-center gap-1.5">
            <Ship size={15} className="text-[#007A78]" />
            <span>Vessel Skipper Controls</span>
          </span>

          {/* Usual Zones Filter Button */}
          <button
            type="button"
            onClick={onToggleUsualOnly}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              showUsualOnly
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <span>⭐ My Usual Zones Shortlist ({usualCount})</span>
            {showUsualOnly && <span className="text-[10px] bg-white/20 px-1.5 rounded">Filter Active</span>}
          </button>
        </div>

        {/* Speed Adjustment Slider */}
        <div className="flex items-center gap-2.5 font-mono text-[11px] bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
          <Sliders size={13} className="text-slate-500" />
          <span className="text-slate-600">Cruising Speed:</span>
          <strong className="text-[#007A78] text-xs font-bold">{boatSpeed} knots</strong>
          <input
            type="range"
            min="6"
            max="14"
            step="1"
            value={boatSpeed}
            onChange={(e) => onBoatSpeedChange(parseInt(e.target.value, 10))}
            className="w-20 accent-[#007A78] cursor-pointer"
            title="Adjust vessel cruising speed to update fuel burn & return time"
          />
        </div>
      </div>

      {/* 3-Day Outlook Strip for Selected Sector */}
      {selectedZone && outlook.length > 0 && (
        <div className="bg-white border border-[#CCE4EC] p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0A1B27]">
              <TrendingUp size={15} className="text-[#007A78]" />
              <span>3-Day Fishing Outlook · {selectedZone.zoneName} (Sector {selectedZone.sectorCode})</span>
            </div>
            <span className="text-[11px] text-[#5C7788] font-mono">Simulated ECMWF / INCOIS Model</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {outlook.map((day) => {
              const isRecommended = day.verdict === 'Recommended'
              const isClosed = day.verdict === 'Seasonal Closure' || day.verdict === 'Unsafe Today'

              return (
                <div
                  key={day.date}
                  className={`p-3 rounded-lg border text-xs flex flex-col justify-between gap-2 ${
                    isClosed
                      ? 'bg-red-50/70 border-red-200'
                      : isRecommended
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 font-serif">{day.date}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                        isClosed
                          ? 'bg-red-100 text-red-800'
                          : isRecommended
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {day.verdict}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-700 font-mono">
                    <div>Wind: <strong>{typeof day.windSpeed === 'number' ? `${day.windSpeed} km/h` : (day.windSpeed || day.wind || '--')}</strong></div>
                    <div>Wave: <strong>{typeof day.waveHeight === 'number' ? `${day.waveHeight}m` : (day.waveHeight || day.wave || '--')}</strong></div>
                    <div>SST: <strong>{typeof day.sst === 'number' ? `${day.sst}°C` : (day.sst ? `${day.sst}°C` : '--')}</strong></div>
                    <div>Score: <strong className="text-slate-900">{day.combinedScore ?? day.score ?? '--'}/100</strong></div>
                  </div>

                  <div className="text-[10px] text-slate-600 italic border-t border-slate-200/60 pt-1.5">
                    {day.trend === 'Improving' ? '📈 Sea conditions improving' : day.trend === 'Deteriorating' ? '📉 Winds picking up' : '⚖ Steady conditions expected'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Catch Log Submission & Recent Logged Catches Accordion */}
      <div className="bg-white border border-[#CCE4EC] rounded-xl overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowLogForm(!showLogForm)}
          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-[#0A1B27] cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-[#007A78]" />
            <span>Vessel Catch Log &amp; Verification ({catchLogs.length} logged voyages)</span>
          </div>
          <span className="flex items-center gap-1 text-[#007A78]">
            <span>{showLogForm ? 'Hide Log Panel' : 'Log Actual Catch / View Records'}</span>
            {showLogForm ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </button>

        {showLogForm && (
          <div className="p-4 sm:p-5 border-t border-[#CCE4EC] flex flex-col gap-5">
            {/* Catch Log Input Form */}
            <form onSubmit={handleCatchSubmit} className="bg-[#EAF4F8] border border-[#BCDCE6] p-4 rounded-lg">
              <div className="flex items-center gap-2 text-xs font-bold text-[#007A78] uppercase tracking-wider mb-2">
                <PlusCircle size={14} />
                <span>Record Trip Landings for {selectedZone?.zoneName || 'Selected Sector'}</span>
              </div>

              {/* Offline Backend Notice */}
              {backendOffline && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs flex items-center gap-2 mb-3">
                  <AlertCircle size={16} className="text-amber-700 shrink-0" />
                  <span>
                    <strong>Backend Offline:</strong> FastAPI telemetry server is unreachable on port 8000. New catch submissions are temporarily disabled.
                  </span>
                </div>
              )}

              <div className="grid sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Trip Date</label>
                  <input
                    type="date"
                    value={logTripDate}
                    onChange={(e) => {
                      setLogTripDate(e.target.value)
                      if (formErrors.tripDate) setFormErrors(prev => ({ ...prev, tripDate: null }))
                    }}
                    className={`w-full bg-white border rounded px-2.5 py-1.5 text-slate-800 ${
                      formErrors.tripDate ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.tripDate && (
                    <span className="text-red-600 text-[11px] font-semibold mt-1 block">{formErrors.tripDate}</span>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Catch Weight (kg)</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="50000"
                    placeholder="e.g. 420"
                    value={logKg}
                    onChange={(e) => {
                      setLogKg(e.target.value)
                      if (formErrors.kg) setFormErrors(prev => ({ ...prev, kg: null }))
                    }}
                    className={`w-full bg-white border rounded px-2.5 py-1.5 text-slate-800 font-mono ${
                      formErrors.kg ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.kg && (
                    <span className="text-red-600 text-[11px] font-semibold mt-1 block">{formErrors.kg}</span>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Primary Species</label>
                  <select
                    value={logSpecies}
                    onChange={(e) => {
                      setLogSpecies(e.target.value)
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
                    <option value="Ribbonfish (Trichiurus lepturus)">Ribbonfish (Trichiurus lepturus)</option>
                    <option value="Mixed Marine Pelagics">Mixed Marine Pelagics</option>
                  </select>
                  {formErrors.species && (
                    <span className="text-red-600 text-[11px] font-semibold mt-1 block">{formErrors.species}</span>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Trip Notes / Sea Observations</label>
                  <input
                    type="text"
                    placeholder="e.g. strong front 6nm out"
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800"
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-[11px] text-slate-600">
                  Logs are stored in the ORCA maritime database to calibrate future CMFRI yield forecasts.
                </div>
                <button
                  type="submit"
                  disabled={submitting || backendOffline}
                  className={`px-4 py-1.5 rounded font-bold text-xs shadow-xs transition-colors cursor-pointer ${
                    backendOffline
                      ? 'bg-slate-400 text-slate-200 cursor-not-allowed'
                      : 'bg-[#007A78] hover:bg-[#006361] text-white'
                  }`}
                >
                  {submitting ? 'Submitting...' : backendOffline ? 'Server Offline' : 'Save Catch Record'}
                </button>
              </div>

              {submitStatus === 'success' && (
                <div className="mt-2.5 p-2 bg-emerald-50 border border-emerald-300 rounded text-emerald-800 text-xs flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>Catch record successfully synchronized to ORCA fleet log!</span>
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="mt-2.5 p-2 bg-red-50 border border-red-300 rounded text-red-800 text-xs flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-red-600" />
                  <span>{errorMessage || 'Could not connect to backend server. Record preserved in local cache.'}</span>
                </div>
              )}
            </form>

            {/* Logged Catches Table */}
            <div>
              <div className="font-serif font-bold text-[#0A1B27] text-xs mb-2">
                Your Logged Voyages &amp; Landings ({catchLogs.length})
              </div>

              {catchLogs.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded text-center text-xs text-slate-500">
                  No catch logs submitted yet for this sector. Complete a voyage and log your haul above!
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Sector</th>
                        <th className="p-2.5">Catch (kg)</th>
                        <th className="p-2.5">Species</th>
                        <th className="p-2.5">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {catchLogs.slice(0, 5).map((log) => (
                        <tr key={log.id || log.trip_date + log.estimated_kg} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono text-slate-800">{log.trip_date}</td>
                          <td className="p-2.5 font-semibold text-slate-900">{log.zone_name}</td>
                          <td className="p-2.5 font-mono font-bold text-emerald-800">{log.estimated_kg} kg</td>
                          <td className="p-2.5 text-slate-700">{log.species}</td>
                          <td className="p-2.5 text-slate-500 truncate max-w-xs">{log.notes || '—'}</td>
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
    </div>
  )
}
