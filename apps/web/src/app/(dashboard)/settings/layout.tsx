'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Settings, User, Users, CreditCard, Key, Webhook, Bell, Shield } from 'lucide-react'

const SETTINGS_SECTIONS = [
  { key: 'profile', label: 'Profile', icon: User, href: '/settings' },
  { key: 'workspace', label: 'Workspace', icon: Settings, href: '/settings/workspace' },
  { key: 'members', label: 'Team Members', icon: Users, href: '/settings/members' },
  { key: 'billing', label: 'Billing', icon: CreditCard, href: '/settings/billing' },
  { key: 'api', label: 'API Keys', icon: Key, href: '/settings/api' },
  { key: 'webhooks', label: 'Webhooks', icon: Webhook, href: '/settings/webhooks' },
  { key: 'notifications', label: 'Notifications', icon: Bell, href: '/settings/notifications' },
  { key: 'security', label: 'Security', icon: Shield, href: '/settings/security' },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-64 shrink-0">
        <div className="bg-bg-el border border-rule rounded-sv p-4">
          <h2 className="text-xs font-mono uppercase tracking-wider text-ink-3 mb-3 px-2">
            Settings
          </h2>
          <nav className="space-y-1">
            {SETTINGS_SECTIONS.map((section) => {
              const Icon = section.icon
              const isActive = pathname === section.href

              return (
                <Link
                  key={section.key}
                  href={section.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-sv text-sm transition-colors ${
                    isActive
                      ? 'bg-accent/10 text-accent border border-accent/20'
                      : 'text-ink-3 hover:text-ink hover:bg-bg-el-2'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">{children}</div>
    </div>
  )
}
