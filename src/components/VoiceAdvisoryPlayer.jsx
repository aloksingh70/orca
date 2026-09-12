import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX, Play, Square, Globe, Radio, Sparkles, MessageSquare } from 'lucide-react'

const AUDIO_LANGUAGES = [
  { code: 'bn', label: 'বাংলা (Bengali)', langTag: 'bn-IN' },
  { code: 'hi', label: 'हिंदी (Hindi)', langTag: 'hi-IN' },
  { code: 'en', label: 'English (Indian)', langTag: 'en-IN' },
  { code: 'or', label: 'ଓଡ଼ିଆ (Odia)', langTag: 'or-IN' }
]

export default function VoiceAdvisoryPlayer({ zone, role = 'skipper', compact = false }) {
  const [selectedLang, setSelectedLang] = useState('bn')
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  if (!zone) return null

  // Generate localized text based on zone state
  const isBan = zone.verdict === 'Seasonal Closure'
  const isUnsafe = zone.verdict === 'Unsafe Today'

  const getSpeechScript = (lang) => {
    const name = zone.zoneName || zone.name || 'Sector'
    const code = zone.sectorCode || zone.sector_code || 'WB'
    
    // Safely extract wind and wave from agents or base properties
    const weatherAgent = zone.agents?.find((a) => a.agent === 'weather')
    const wind = weatherAgent?.readouts?.[0]?.value || (zone.baseWind ? `${zone.baseWind} km/h` : '18 km/h')
    const wave = weatherAgent?.readouts?.[1]?.value || (zone.baseWave ? `${zone.baseWave}m` : '1.1m')

    if (lang === 'bn') {
      if (isBan) {
        return `জরুরি সতর্কতা। ${name} সেক্টরে সরকারি মাছ ধরার নিষেধাজ্ঞা চলছে। প্রজননকালীন নিষেধাজ্ঞা জারি রয়েছে। সমুদ্রে যাওয়া সম্পূর্ণ নিষিদ্ধ।`
      }
      if (isUnsafe) {
        return `ঝড়ো আবহাওয়া সতর্কতা। ${name} অঞ্চলে বাতাস ${wind} এবং ঢেউ ${wave} পৌঁছেছে। ছোট নৌকা নিয়ে সমুদ্রে যাওয়া বিপজ্জনক। বন্দরে নোঙর করে থাকুন।`
      }
      return `${name} আজকের জন্য সবচেয়ে নিরাপদ ও সেরা মাছ ধরার অঞ্চল। বাতাস ${wind} ও ঢেউ ${wave} শান্ত আছে। প্রচুর মাছের ঝাঁক সক্রিয় রয়েছে। শুভ সমুদ্র যাত্রা!`
    }

    if (lang === 'hi') {
      if (isBan) {
        return `महत्वपूर्ण सूचना। ${name} क्षेत्र में वार्षिक मत्स्य प्रजनन प्रतिबंध लागू है। आज समुद्र में नाव ले जाना पूर्णतः प्रतिबंधित है।`
      }
      if (isUnsafe) {
        return `सावधानी चेतावनी। ${name} में हवा की गति ${wind} और समुद्री लहरें ${wave} हैं। आज समुद्र में जाना खतरनाक है। कृपया बंदरगाह में ही रहें।`
      }
      return `${name} आज के लिए सबसे सुरक्षित और उत्तम मछली पकड़ने का क्षेत्र है। हवा ${wind} और लहरें ${wave} शांत हैं। आपकी समुद्री यात्रा शुभ हो!`
    }

    if (lang === 'or') {
      if (isBan) {
        return `ସୂଚନା! ${name} ଅଞ୍ଚଳରେ ବାର୍ଷିକ ମତ୍ସ୍ୟ ଶିକାର ନିଷେଧାଦେଶ ଲାଗୁ ଅଛି। ସମୁଦ୍ରକୁ ଯିବା ମନା।`
      }
      if (isUnsafe) {
        return `ସତର୍କତା! ${name} ରେ ପ୍ରବଳ ପବନ ଏବଂ ଉଚ୍ଚ ତରଙ୍ଗ ଅଛି। ବୋଟ୍ ନେଇ ସମୁଦ୍ରକୁ ଯାଆନ୍ତୁ ନାହିଁ। ବନ୍ଦରରେ ରୁହନ୍ତୁ।`
      }
      return `${name} ଆଜି ପାଇଁ ସବୁଠାରୁ ସୁରକ୍ଷିତ ମତ୍ସ୍ୟ ଶିକାର କ୍ଷେତ୍ର ଅଟେ। ପବନ ଏବଂ ତରଙ୍ଗ ଶାନ୍ତ ଅଛି। ଶୁଭ ଯାତ୍ରା!`
    }

    // Default English
    if (isBan) {
      return `Regulatory Notice. Sector ${name} is under mandatory seasonal breeding ban under MFRA section 4. Mechanized fishing is strictly prohibited.`
    }
    if (isUnsafe) {
      return `Marine Hazard Warning. Sector ${name} has high winds of ${wind} and waves of ${wave}. Unsafe for small crafts. Remain moored inside harbor.`
    }
    return `${name} Sector ${code} is your optimal and safest fishing destination today. Wind is calm at ${wind} with waves at ${wave}. Safe sailing voyage!`
  }

  const fallbackSpeechSynthesis = (textToSpeak, lang) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsPlaying(false)
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    const langObj = AUDIO_LANGUAGES.find((l) => l.code === lang)
    utterance.lang = langObj?.langTag || 'en-IN'
    utterance.rate = lang === 'en' ? 0.95 : 0.9

    const voices = window.speechSynthesis.getVoices()
    const matchingVoice =
      voices.find((v) => v.lang.startsWith(lang)) ||
      voices.find((v) => v.lang.includes('IN')) ||
      voices[0]

    if (matchingVoice) {
      utterance.voice = matchingVoice
    }

    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)

    window.speechSynthesis.speak(utterance)
  }

  const handlePlayVoice = () => {
    if (isPlaying) {
      handleStop()
      return
    }

    handleStop()

    const textToSpeak = getSpeechScript(selectedLang)
    const audioUrl = `/api/advisory/tts?text=${encodeURIComponent(textToSpeak)}&lang=${selectedLang}`

    try {
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onplay = () => setIsPlaying(true)
      audio.onended = () => {
        setIsPlaying(false)
        audioRef.current = null
      }
      audio.onerror = (e) => {
        console.warn('Streaming audio failed, attempting Web Speech API fallback:', e)
        fallbackSpeechSynthesis(textToSpeak, selectedLang)
      }

      audio.play().catch((err) => {
        console.warn('Audio play() error, falling back to Web Speech API:', err)
        fallbackSpeechSynthesis(textToSpeak, selectedLang)
      })
    } catch (err) {
      console.warn('Could not initialize Audio element, falling back to Web Speech API:', err)
      fallbackSpeechSynthesis(textToSpeak, selectedLang)
    }
  }

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(false)
  }

  const currentScript = getSpeechScript(selectedLang)

  // Compact Audio Trigger Button
  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <button
          type="button"
          onClick={handlePlayVoice}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs ${
            isPlaying
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-[#007A78] text-white hover:bg-[#006462]'
          }`}
          title="Listen to Voice Advisory Broadcast"
        >
          {isPlaying ? <Square size={12} className="fill-current" /> : <Volume2 size={13} />}
          <span>{isPlaying ? 'Stop Audio' : 'Listen (বাং)'}</span>
        </button>

        {isPlaying && (
          <div className="flex items-center gap-0.5 px-1.5 py-1">
            <span className="w-1 h-3 bg-[#007A78] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-4 bg-[#007A78] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-2 bg-[#007A78] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>
    )
  }

  // Full Audio Control Strip
  return (
    <div className="bg-gradient-to-r from-[#E2F0F5] to-emerald-50 border border-[#BCE1EA] rounded-xl p-3 sm:p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Indicator & Headline */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
              isPlaying
                ? 'bg-red-600 text-white border-red-700 animate-pulse'
                : 'bg-white text-[#007A78] border-[#CCE4EC]'
            }`}
          >
            {isPlaying ? <Radio size={18} className="animate-spin" /> : <Volume2 size={18} />}
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-[#007A78]">
              <Sparkles size={12} />
              <span>MULTILINGUAL VOICE BROADCAST · BHASHINI COMPLIANT</span>
            </div>
            <div className="font-serif font-bold text-sm text-[#0A1B27]">
              {isPlaying ? 'Broadcasting Sector Audio Advisory...' : `Listen to ${zone.zoneName || zone.name || 'Sector'} Advisory Aloud`}
            </div>
          </div>
        </div>

        {/* Right: Language Selector & Play Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Language Selector */}
          <select
            value={selectedLang}
            onChange={(e) => {
              handleStop()
              setSelectedLang(e.target.value)
            }}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 cursor-pointer shadow-2xs outline-none focus:border-[#007A78]"
          >
            {AUDIO_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>

          {/* Play / Stop Button */}
          <button
            type="button"
            onClick={handlePlayVoice}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
              isPlaying
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-[#007A78] hover:bg-[#006361] text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Square size={13} className="fill-current" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play size={13} className="fill-current" />
                <span>Play Advisory</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Audio Wave Visualizer when Active */}
      {isPlaying && (
        <div className="mt-2.5 pt-2 border-t border-[#BCE1EA]/80 flex items-center justify-between text-xs font-mono text-slate-700 animate-fade-in">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-3 bg-emerald-600 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-5 bg-[#007A78] animate-bounce" style={{ animationDelay: '100ms' }} />
            <span className="w-1.5 h-6 bg-teal-600 animate-bounce" style={{ animationDelay: '200ms' }} />
            <span className="w-1.5 h-4 bg-emerald-600 animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="w-1.5 h-2 bg-[#007A78] animate-bounce" style={{ animationDelay: '400ms' }} />
            <span className="text-[11px] text-[#007A78] font-bold ml-1.5">
              Playing {AUDIO_LANGUAGES.find((l) => l.code === selectedLang)?.label} Broadcast
            </span>
          </div>
          <span className="text-[10px] text-slate-500 hidden sm:inline">
            Hands-free audio guidance for wheelhouse navigation
          </span>
        </div>
      )}

      {/* Vernacular Broadcast Transcript Box */}
      <div className="mt-3 p-3 bg-white/90 border border-[#CCE4EC] rounded-lg shadow-2xs">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-[#007A78] flex items-center gap-1.5">
            <MessageSquare size={13} />
            <span>
              {selectedLang === 'bn'
                ? 'বাংলা সম্প্রচার লিপি (Bengali Voice Script):'
                : selectedLang === 'hi'
                ? 'हिंदी प्रसारण पाठ (Hindi Voice Script):'
                : selectedLang === 'or'
                ? 'ଓଡ଼ିଆ ପ୍ରସାରଣ (Odia Voice Script):'
                : 'English Broadcast Script:'}
            </span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Bhashini AI TTS</span>
        </div>
        <p className="text-xs sm:text-[13px] text-slate-800 leading-relaxed font-sans italic bg-[#F8FCFD] p-2 rounded border border-[#E2F0F5]">
          "{currentScript}"
        </p>
      </div>
    </div>
  )
}
