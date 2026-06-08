'use client'

import { Badge } from '@/components/ui/badge'
import { X, CheckCircle, AlertCircle, Link2, Shield, Activity, RefreshCw } from 'lucide-react'

interface IntegrationModalProps {
  integration: {
    id: string
    name: string
    vendor: string
    status: 'connected' | 'disconnected' | 'error'
    lastSync: string | null
    eventsLast24h: number
    projectsConnected: number
    logo: string
    scopes: string[]
  }
  onClose: () => void
}

export function IntegrationModal({ integration, onClose }: IntegrationModalProps) {
  const isConnected = integration.status === 'connected'
  const hasError = integration.status === 'error'

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] bg-bg-el border border-rule rounded-sv shadow-2xl z-50">
        <div className="flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-rule bg-bg-el-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 border border-accent/20">
                <span className="text-lg font-bold text-accent">{integration.logo}</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-ink">{integration.name}</h2>
                <p className="text-xs text-ink-3">{integration.vendor}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-bg-el-3 rounded transition-colors"
            >
              <X className="h-5 w-5 text-ink-3" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Connection Status */}
            <div className="bg-bg-el-2 border border-rule rounded-sv p-4">
              <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
                <Link2 className="h-4 w-4 text-accent" />
                Connection Status
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  {isConnected && (
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-good" />
                      <Badge variant="success" className="text-xs">Connected</Badge>
                    </div>
                  )}
                  {hasError && (
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="h-4 w-4 text-bad" />
                      <Badge variant="danger" className="text-xs">Connection Error</Badge>
                    </div>
                  )}
                  {!isConnected && !hasError && (
                    <Badge variant="muted" className="text-xs">Not Connected</Badge>
                  )}
                  <p className="text-xs text-ink-3 mt-1">
                    {integration.lastSync
                      ? `Last synced: ${new Date(integration.lastSync).toLocaleString()}`
                      : 'Never synchronized'}
                  </p>
                </div>
                {isConnected && (
                  <button className="px-3 py-1.5 text-xs font-medium text-accent border border-accent rounded-sv hover:bg-accent/10 transition-colors flex items-center gap-1.5">
                    <RefreshCw className="h-3 w-3" />
                    Sync Now
                  </button>
                )}
              </div>
            </div>

            {/* Error Details */}
            {hasError && (
              <div className="bg-bad/10 border border-bad/20 rounded-sv p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-bad mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-bad mb-1">Authentication Failed</p>
                    <p className="text-xs text-ink-3">
                      The OAuth token has expired. Please reconnect to restore access.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Metrics */}
            <div className="bg-bg-el-2 border border-rule rounded-sv p-4">
              <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4 text-accent" />
                Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-ink-3 mb-1">Events (24h)</div>
                  <div className="text-2xl font-display text-ink">{integration.eventsLast24h}</div>
                </div>
                <div>
                  <div className="text-xs text-ink-3 mb-1">Projects Connected</div>
                  <div className="text-2xl font-display text-ink">{integration.projectsConnected}</div>
                </div>
              </div>
            </div>

            {/* Scopes */}
            {integration.scopes.length > 0 && (
              <div className="bg-bg-el-2 border border-rule rounded-sv p-4">
                <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-accent" />
                  Permissions
                </h3>
                <div className="space-y-2">
                  {integration.scopes.map((scope) => (
                    <div
                      key={scope}
                      className="flex items-center gap-2 py-1.5 px-2 bg-bg-el-3 border border-rule rounded text-xs"
                    >
                      <CheckCircle className="h-3 w-3 text-good" />
                      <span className="font-mono text-ink">{scope}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Configuration */}
            {isConnected && (
              <div className="bg-bg-el-2 border border-rule rounded-sv p-4">
                <h3 className="text-sm font-semibold text-ink mb-3">Configuration</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-ink-3 block mb-1">Sync Frequency</label>
                    <select className="w-full px-3 py-2 bg-bg-el border border-rule rounded text-sm text-ink">
                      <option>Every 15 minutes</option>
                      <option>Every 30 minutes</option>
                      <option>Every hour</option>
                      <option>Manual only</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded" />
                      Enable real-time webhooks
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded" />
                      Send notifications on sync errors
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 px-6 py-4 border-t border-rule bg-bg-el-2">
            {isConnected ? (
              <>
                <button className="flex-1 px-4 py-2 bg-accent text-white rounded-sv hover:bg-accent/90 transition-colors text-sm font-medium">
                  Save Changes
                </button>
                <button className="px-4 py-2 border border-bad text-bad rounded-sv hover:bg-bad/10 transition-colors text-sm font-medium">
                  Disconnect
                </button>
              </>
            ) : (
              <>
                <button className="flex-1 px-4 py-2 bg-accent text-white rounded-sv hover:bg-accent/90 transition-colors text-sm font-medium">
                  Connect {integration.name}
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-rule rounded-sv hover:bg-bg-el-3 transition-colors text-sm font-medium text-ink"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
