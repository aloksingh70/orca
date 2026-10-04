import { useNavigate } from 'react-router-dom'
import { Compass, Loader2 } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function ScanButton({ onScan, scanning, hasResults }) {
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault()
      navigate('/login', { state: { from: '/advisory', reason: 'action_required' } })
      return
    }
    if (onScan) onScan(e)
  }

  return (
    <button
      onClick={handleClick}
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
            {t('advisory', 'scanning')}
          </span>
        </>
      ) : (
        <>
          <Compass size={15} className="shrink-0" style={{ color: '#FFFFFF' }} />
          <span style={{ color: '#FFFFFF' }} className="font-bold">
            {hasResults ? t('advisory', 'rescanBtn') : t('advisory', 'scanBtn')}
          </span>
        </>
      )}
    </button>
  )
}
