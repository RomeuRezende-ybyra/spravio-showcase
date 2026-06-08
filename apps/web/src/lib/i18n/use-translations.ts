'use client'

import { useContext } from 'react'
import { I18nContext } from './context'

export function useTranslations() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useTranslations must be used within I18nProvider')
  return ctx.t
}

export function useLocale() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useLocale must be used within I18nProvider')
  return { locale: ctx.locale, setLocale: ctx.setLocale }
}
