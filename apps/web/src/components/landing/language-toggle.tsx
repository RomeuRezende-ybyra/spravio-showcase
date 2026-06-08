'use client'

import { useLocale } from '@/lib/i18n/use-translations'

export function LanguageToggle() {
  const { locale, setLocale } = useLocale()

  return (
    <div className="lang-toggle">
      <button
        className={locale === 'en' ? 'on' : ''}
        onClick={() => setLocale('en')}
        aria-label="Switch to English"
        aria-current={locale === 'en' ? 'true' : 'false'}
      >
        EN
      </button>
      <button
        className={locale === 'pt' ? 'on' : ''}
        onClick={() => setLocale('pt')}
        aria-label="Mudar para Português"
        aria-current={locale === 'pt' ? 'true' : 'false'}
      >
        PT
      </button>
    </div>
  )
}
