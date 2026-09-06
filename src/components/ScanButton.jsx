import { Compass, Loader2 } from 'lucide-react'

export default function ScanButton({ onScan, scanning, hasResults }) {
  return (
    <button
      onClick={onScan}
      disabled={scanning}
      style={{
        backgroundColor: scanning ? '#475569' : '#E86014',
        color: '#FFFFFF',
        borderColor: scanning ? '#334155' : '#C84F0C'
      }}
      className="inline-flex items-center justify-center gap-2 rounded px-4 py-2 font-sans text-xs font-bold tracking-wide transition-all shadow-sm active:scale-[0.98] border cursor-pointer hover:brightness-105"
    >
      {scanning ? (
        <>
          <Loader2 size={15} className="animate-spin shrink-0" style={{ color: '#FFFFFF' }} />
          <span style={{ color: '#FFFFFF' }} className="font-bold">
            Sounding Shelf Sectors…
          </span>
        </>
      ) : (
        <>
          <Compass size={15} className="shrink-0" style={{ color: '#FFFFFF' }} />
          <span style={{ color: '#FFFFFF' }} className="font-bold">
            {hasResults ? 'Re-scan 6 Coastal Sectors' : 'Scan 6 Coastal Sectors'}
          </span>
        </>
      )}
    </button>
  )
}
