import { useState, useRef, useEffect } from 'react'
import { Languages, Check, ChevronDown } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function LanguageSelector({ compact = false }) {
  const { language, setLanguage, languages, currentLang } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close menu on Escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Menu Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`flex items-center gap-1.5 rounded border border-[#BCDCE6] bg-white hover:bg-[#F2F9FB] px-2.5 py-1.5 text-xs font-bold text-[#0A1B27] transition-all shadow-xs cursor-pointer ${
          isOpen ? 'ring-2 ring-[#007A78]/30 border-[#007A78]' : ''
        }`}
        title="Select Webpage Language / भाषा चुनें / ভাষা নির্বাচন"
      >
        <Languages size={14} className="text-[#007A78] shrink-0" />
        <span className="font-sans tracking-wide hidden sm:inline">
          {compact ? currentLang.short : currentLang.native}
        </span>
        <span className="font-sans tracking-wide sm:hidden text-[11px]">
          {currentLang.short}
        </span>
        <ChevronDown
          size={12}
          className={`text-[#5C7788] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[#007A78]' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 origin-top-right rounded-md border border-[#BCDCE6] bg-white shadow-lg ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-1.5 bg-[#E2F0F5] border-b border-[#BCDCE6] text-[10px] uppercase tracking-wider font-bold text-[#5C7788]">
            Select Language · भाषा
          </div>
          <div className="py-1">
            {languages.map((item) => {
              const isSelected = item.code === language
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setLanguage(item.code)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#E1F3F5] text-[#007A78] font-bold border-l-2 border-[#007A78]'
                      : 'text-[#0A1B27] hover:bg-[#F2F9FB] font-medium'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs leading-none">{item.native}</span>
                    <span className="text-[10px] text-[#5C7788] mt-0.5 leading-none">{item.label}</span>
                  </div>
                  {isSelected && (
                    <Check size={14} className="text-[#007A78] shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
