import { createContext, useContext, useState } from 'react'
import { TRANSLATIONS } from '../lib/translations.js'

const LanguageContext = createContext()

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', short: 'EN' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', short: 'हि' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', short: 'বাং' }
]

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem('orca_lang') || 'en'
    } catch {
      return 'en'
    }
  })

  const setLanguage = (langCode) => {
    setLanguageState(langCode)
    try {
      localStorage.setItem('orca_lang', langCode)
    } catch (e) {
      console.warn('Could not save language preference:', e)
    }
  }

  const t = (section, key) => {
    return TRANSLATIONS[language]?.[section]?.[key] 
      || TRANSLATIONS['en']?.[section]?.[key] 
      || key
  }

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0]

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES, currentLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
