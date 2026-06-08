'use client'

import { createContext, useState, useEffect, ReactNode } from 'react'
import { translations, type Locale, type TranslationKey } from './translations'

type I18nContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load from localStorage, fallback to browser language, default to EN
    const saved = localStorage.getItem('spravio.lang') as Locale | null
    const browserLang = navigator.language.toLowerCase()
    const detected = saved || (browserLang.startsWith('pt') ? 'pt' : 'en')
    setLocaleState(detected)
    document.documentElement.lang = detected === 'pt' ? 'pt-BR' : 'en'
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('spravio.lang', newLocale)
    document.documentElement.lang = newLocale === 'pt' ? 'pt-BR' : 'en'
  }

  const t = (key: TranslationKey) => translations[locale][key]

  // Prevent hydration mismatch by rendering children only after mount
  if (!mounted) return null

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}
