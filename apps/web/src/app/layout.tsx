import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthSessionProvider } from '@/components/providers/session-provider'
import { ToastProvider } from '@/components/ui/toast'
import { I18nProvider } from '@/lib/i18n/context'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Spravio',
  description: 'Track your software projects in real time',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="light" data-density="medium">
      <head>
        {/* Prevent FOUC - set lang immediately */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const saved = localStorage.getItem('spravio.lang');
                const lang = saved || (navigator.language.toLowerCase().startsWith('pt') ? 'pt' : 'en');
                document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <AuthSessionProvider>
          <I18nProvider>
            <ToastProvider>{children}</ToastProvider>
          </I18nProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
