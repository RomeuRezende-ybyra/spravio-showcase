'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Copy, Check } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3010'

interface SharePortalButtonProps {
  projectId: string
}

export function SharePortalButton({ projectId }: SharePortalButtonProps) {
  const [open, setOpen] = useState(false)
  const [portalUrl, setPortalUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  async function generateLink(expiryDays: number | null) {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/projects/${projectId}/portal-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ expiryDays }),
      })
      const json = await res.json()
      if (json.success) {
        setPortalUrl(`${window.location.origin}/portal/${json.data.token}`)
      }
    } catch {
      // Handle error silently
    } finally {
      setLoading(false)
    }
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(portalUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setOpen(true)}>
        <Share2 className="h-3.5 w-3.5" />
        Share with Client
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {!portalUrl ? (
        <>
          <span className="text-xs text-gray-500">Expiry:</span>
          {[
            { label: '7 days', days: 7 },
            { label: '30 days', days: 30 },
            { label: 'Never', days: null },
          ].map((opt) => (
            <Button
              key={opt.label}
              size="sm"
              variant="outline"
              disabled={loading}
              onClick={() => generateLink(opt.days)}
            >
              {opt.label}
            </Button>
          ))}
        </>
      ) : (
        <>
          <input
            readOnly
            value={portalUrl}
            className="h-8 w-64 rounded-lg border border-gray-200 px-2 text-xs text-gray-700"
          />
          <Button size="sm" variant="outline" onClick={copyToClipboard}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </>
      )}
    </div>
  )
}
