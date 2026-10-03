import { useEffect, useRef, useState } from 'react'
import { X, Download, Copy, Check, Share2, Sparkles } from 'lucide-react'

export default function ShareableResultCard({ zone, isOpen, onClose }) {
  const canvasRef = useRef(null)
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (!isOpen || !zone || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions (high resolution: 1200 x 630 standard social ratio)
    canvas.width = 1200
    canvas.height = 630

    // 1. Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 1200, 630)
    bgGradient.addColorStop(0, '#061624')
    bgGradient.addColorStop(1, '#0C263B')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, 1200, 630)

    // Top Indian tricolor accent line
    const saffron = '#FF9933'
    const white = '#FFFFFF'
    const green = '#138808'
    ctx.fillStyle = saffron
    ctx.fillRect(0, 0, 400, 8)
    ctx.fillStyle = white
    ctx.fillRect(400, 0, 400, 8)
    ctx.fillStyle = green
    ctx.fillRect(800, 0, 400, 8)

    // 2. Header Brand
    ctx.fillStyle = '#00D1CD'
    ctx.font = 'bold 24px monospace'
    ctx.fillText('ORCA · OCEAN REASONING & CATCH ADVISORY', 60, 65)

    ctx.fillStyle = '#8AAABF'
    ctx.font = '16px sans-serif'
    ctx.fillText(`SIH26176 Prototype · Bay of Bengal Coastal Shelf · ${zone.date || 'Today'}`, 60, 95)

    // 3. Zone Main Title
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 52px serif'
    ctx.fillText(`${zone.zoneName} (${zone.sectorCode})`, 60, 170)

    ctx.fillStyle = '#A0C0D4'
    ctx.font = '20px sans-serif'
    ctx.fillText(`${zone.distanceOffshore} Offshore · ${zone.soundingDepth}m Sounding Depth · ${zone.coastalDistrict}`, 60, 205)

    // 4. Large Verdict Badge
    const isBan = zone.verdict === 'Seasonal Closure'
    const isUnsafe = zone.verdict === 'Unsafe Today'
    const isRec = zone.verdict === 'Recommended'

    let badgeBg = '#007A78'
    let badgeText = `RECOMMENDED · SCORE ${zone.combinedScore}/100`
    if (isBan) {
      badgeBg = '#BE123C'
      badgeText = 'SEASONAL CLOSURE (BAN ACTIVE)'
    } else if (isUnsafe) {
      badgeBg = '#C2410C'
      badgeText = 'UNSAFE SEA CONDITIONS'
    } else if (!isRec) {
      badgeBg = '#D97706'
      badgeText = `MARGINAL CONDITIONS · ${zone.combinedScore}/100`
    }

    ctx.fillStyle = badgeBg
    ctx.beginPath()
    ctx.roundRect(60, 235, 450, 52, 10)
    ctx.fill()

    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 20px monospace'
    ctx.fillText(badgeText, 85, 268)

    // 5. 4-Agent Score Grid (Cards)
    const ocean = zone.agents?.find((a) => a.agent === 'ocean')
    const weather = zone.agents?.find((a) => a.agent === 'weather')
    const history = zone.agents?.find((a) => a.agent === 'history')
    const sustain = zone.agents?.find((a) => a.agent === 'sustain')

    const agents = [
      {
        title: 'Ocean Agent',
        val: `${ocean?.score || 0}/100`,
        sub: ocean?.readouts?.[0]?.value || '28.5°C'
      },
      {
        title: 'Weather Agent',
        val: weather?.unsafe ? 'VETO' : `${weather?.score || 0}/100`,
        sub: weather?.readouts?.[0]?.value || '18 km/h'
      },
      {
        title: 'History Agent',
        val: `${history?.score || 0}/100`,
        sub: history?.readouts?.[0]?.value || '450 kg'
      },
      {
        title: 'Sustainability',
        val: sustain?.closed ? 'BAN' : `${sustain?.score || 0}/100`,
        sub: sustain?.closed ? 'Breeding Ban' : 'Open'
      }
    ]

    agents.forEach((ag, idx) => {
      const x = 60 + idx * 270
      const y = 320
      ctx.fillStyle = '#0F2C44'
      ctx.strokeStyle = '#1D4566'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.roundRect(x, y, 250, 110, 10)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#7E9EB3'
      ctx.font = '14px sans-serif'
      ctx.fillText(ag.title, x + 18, y + 32)

      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 30px monospace'
      ctx.fillText(ag.val, x + 18, y + 72)

      ctx.fillStyle = '#4ADEDE'
      ctx.font = '13px sans-serif'
      ctx.fillText(ag.sub, x + 18, y + 95)
    })

    // 6. Synthesis / Note
    ctx.fillStyle = '#E2F0F5'
    ctx.font = '16px sans-serif'
    const noteText = zone.orchestratorNote || 'Multi-agent evaluation completed for this sector.'
    // Wrap text if needed
    ctx.fillText(`Note: ${noteText.slice(0, 120)}…`, 60, 480)

    // 7. Footer Disclosure
    ctx.strokeStyle = '#1D4566'
    ctx.beginPath()
    ctx.moveTo(60, 525)
    ctx.lineTo(1140, 525)
    ctx.stroke()

    ctx.fillStyle = '#6F8C9F'
    ctx.font = '13px sans-serif'
    ctx.fillText('Demonstration Prototype · Simulated parameters standing in for INCOIS, IMD, and CMFRI telemetry', 60, 565)
    ctx.fillText('Built for Smart India Hackathon · Problem Statement SIH26176', 60, 588)

    ctx.fillStyle = '#00D1CD'
    ctx.font = 'bold 15px monospace'
    ctx.fillText('orca.in', 1060, 575)

  }, [isOpen, zone])

  if (!isOpen || !zone) return null

  const handleDownload = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `orca_${zone.zoneId}_${zone.date || 'advisory'}.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  const handleCopySummary = async () => {
    const ocean = zone.agents?.find((a) => a.agent === 'ocean')
    const weather = zone.agents?.find((a) => a.agent === 'weather')
    const history = zone.agents?.find((a) => a.agent === 'history')
    const sustain = zone.agents?.find((a) => a.agent === 'sustain')

    const summary = [
      `🌊 ORCA Marine Advisory: ${zone.zoneName} (${zone.sectorCode})`,
      `📅 Date: ${zone.date || 'Today'} | Status: ${zone.verdict} (${zone.combinedScore}/100)`,
      `📍 Distance: ${zone.distanceOffshore} offshore | Sounding: ${zone.soundingDepth}m`,
      `• Ocean Score: ${ocean?.score}/100 (${ocean?.readouts?.[0]?.value || ''})`,
      `• Weather: ${weather?.unsafe ? 'SQUALL VETO' : `${weather?.score}/100`} (${weather?.readouts?.[0]?.value || ''})`,
      `• CMFRI History: ${history?.score}/100 (${history?.readouts?.[0]?.value || ''})`,
      `• Sustainability: ${sustain?.closed ? 'BREEDING BAN VETO' : 'Open'}`,
      `💡 Synthesis: ${zone.orchestratorNote}`,
      `-- Simulated SIH26176 prototype advisory (ORCA)`
    ].join('\n')

    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-3xl overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#E2F0F5] border-b border-[#BCDCE6] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#007A78] text-white">
              <Share2 size={16} />
            </span>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-[#0A1B27]">
                Share Sector Recommendation Card
              </h3>
              <p className="text-[11px] text-[#5C7788]">
                Export a high-resolution summary graphic or copy plain-text advisory notes.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white/80 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Canvas Graphic Preview */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col items-center bg-slate-900/5">
          <div className="w-full rounded-xl overflow-hidden shadow-lg border border-slate-300 bg-slate-900">
            <canvas
              ref={canvasRef}
              className="w-full h-auto block"
              style={{ maxHeight: '420px', objectFit: 'contain' }}
            />
          </div>
          <p className="text-[11px] text-slate-500 text-center mt-2.5">
            Client-side rendered graphic (1200 × 630 PNG) · Zero backend storage required
          </p>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[#5C7788]">
            Sector: <strong className="text-[#0A1B27] font-mono">{zone.zoneName} ({zone.sectorCode})</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 rounded-lg bg-[#007A78] hover:bg-[#006361] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            >
              <Download size={14} />
              <span>Download Graphic (.PNG)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
