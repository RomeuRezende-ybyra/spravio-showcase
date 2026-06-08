import { Metadata } from 'next'
import { headers } from 'next/headers'
import LandingPage from '@/components/landing/landing-page'
import { translations } from '@/lib/i18n/translations'

export async function generateMetadata(): Promise<Metadata> {
  // Detect locale from Accept-Language header (best we can do server-side)
  // Client-side will use localStorage which may differ, but this is for SEO/initial load
  const headersList = await headers()
  const acceptLang = headersList.get('accept-language')
  const locale = acceptLang?.toLowerCase().startsWith('pt') ? 'pt' : 'en'

  const title =
    locale === 'pt'
      ? 'Spravio — Veja o que seu time realmente entregou.'
      : 'Spravio — See what your team actually shipped.'

  const description = translations[locale]['hero.sub']

  return {
    title,
    description,
    alternates: {
      languages: {
        en: 'https://spravio.io',
        'pt-BR': 'https://spravio.io',
      },
    },
    openGraph: {
      title: translations[locale]['hero.h1'].replace(/<\/?em>/g, ''),
      description,
      locale: locale === 'pt' ? 'pt_BR' : 'en_US',
      type: 'website',
      siteName: 'Spravio',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default function RootPage() {
  return <LandingPage />
}
