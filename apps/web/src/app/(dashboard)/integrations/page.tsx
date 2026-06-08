'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { IntegrationCard } from '@/components/integrations/integration-card'
import { IntegrationModal } from '@/components/integrations/integration-modal'
import { Link2, Activity, AlertCircle, Clock, Search } from 'lucide-react'

type FilterType = 'all' | 'connected' | 'available' | 'errors'

interface Integration {
  id: string
  name: string
  vendor: string
  category: string
  status: 'connected' | 'disconnected' | 'error'
  lastSync: string | null
  eventsLast24h: number
  projectsConnected: number
  logo: string
  scopes: string[]
}

// Available integrations catalog — status will come from API once connected
const INTEGRATIONS: Integration[] = [
  // Issue Tracking
  { id: '1', name: 'Jira', vendor: 'Atlassian', category: 'Issue Tracking', status: 'disconnected', lastSync: null, eventsLast24h: 0, projectsConnected: 0, logo: 'JI', scopes: [] },
  { id: '2', name: 'Azure DevOps', vendor: 'Microsoft', category: 'Issue Tracking', status: 'disconnected', lastSync: null, eventsLast24h: 0, projectsConnected: 0, logo: 'AZ', scopes: [] },
  { id: '3', name: 'Linear', vendor: 'Linear', category: 'Issue Tracking', status: 'disconnected', lastSync: null, eventsLast24h: 0, projectsConnected: 0, logo: 'LI', scopes: [] },

  // Code
  { id: '4', name: 'GitHub', vendor: 'Microsoft', category: 'Code', status: 'disconnected', lastSync: null, eventsLast24h: 0, projectsConnected: 0, logo: 'GH', scopes: [] },
  { id: '5', name: 'GitLab', vendor: 'GitLab', category: 'Code', status: 'disconnected', lastSync: null, eventsLast24h: 0, projectsConnected: 0, logo: 'GL', scopes: [] },
  { id: '6', name: 'Bitbucket', vendor: 'Atlassian', category: 'Code', status: 'disconnected', lastSync: null, eventsLast24h: 0, projectsConnected: 0, logo: 'BB', scopes: [] },

  // Communication
  { id: '7', name: 'Slack', vendor: 'Salesforce', category: 'Communication', status: 'disconnected', lastSync: null, eventsLast24h: 0, projectsConnected: 0, logo: 'SL', scopes: [] },
  { id: '8', name: 'Microsoft Teams', vendor: 'Microsoft', category: 'Communication', status: 'disconnected', lastSync: null, eventsLast24h: 0, projectsConnected: 0, logo: 'MT', scopes: [] },
  { id: '9', name: 'Discord', vendor: 'Discord', category: 'Communication', status: 'disconnected', lastSync: null, eventsLast24h: 0, projectsConnected: 0, logo: 'DC', scopes: [] },

  // Financial
  { id: '10', name: 'Stripe', vendor: 'Stripe', category: 'Financial', status: 'disconnected', lastSync: null, eventsLast24h: 0, projectsConnected: 0, logo: 'ST', scopes: [] },
  { id: '11', name: 'QuickBooks', vendor: 'Intuit', category: 'Financial', status: 'disconnected', lastSync: null, eventsLast24h: 0, projectsConnected: 0, logo: 'QB', scopes: [] },

  // Time Tracking
  { id: '12', name: 'Tempo', vendor: 'Tempo', category: 'Time Tracking', status: 'disconnected', lastSync: null, eventsLast24h: 0, projectsConnected: 0, logo: 'TE', scopes: [] },
  { id: '13', name: 'Clockify', vendor: 'CAKE.com', category: 'Time Tracking', status: 'disconnected', lastSync: null, eventsLast24h: 0, projectsConnected: 0, logo: 'CL', scopes: [] },
]

export default function IntegrationsPage() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)

  // Filter integrations
  const filteredIntegrations = INTEGRATIONS.filter((integration) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'connected' && integration.status === 'connected') ||
      (filter === 'available' && integration.status === 'disconnected') ||
      (filter === 'errors' && integration.status === 'error')

    const matchesSearch =
      searchQuery === '' ||
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.vendor.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesFilter && matchesSearch
  })

  // Group by category
  const categories = [...new Set(INTEGRATIONS.map((i) => i.category))]
  const groupedIntegrations = categories.map((category) => ({
    name: category,
    integrations: filteredIntegrations.filter((i) => i.category === category),
  }))

  // Counts
  const counts = {
    all: INTEGRATIONS.length,
    connected: INTEGRATIONS.filter((i) => i.status === 'connected').length,
    available: INTEGRATIONS.filter((i) => i.status === 'disconnected').length,
    errors: INTEGRATIONS.filter((i) => i.status === 'error').length,
  }

  const totalEvents = INTEGRATIONS.reduce((acc, i) => acc + i.eventsLast24h, 0)
  const lastSync = INTEGRATIONS.filter((i) => i.lastSync)
    .sort((a, b) => new Date(b.lastSync!).getTime() - new Date(a.lastSync!).getTime())[0]?.lastSync

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Integrations</h1>
          <p className="text-sm text-ink-3">Connect and manage external services</p>
        </div>

        {/* Search */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-3" />
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bg-el border border-rule rounded-sv text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-sv transition-colors ${
            filter === 'all'
              ? 'bg-accent text-white'
              : 'bg-bg-el border border-rule text-ink-3 hover:text-ink'
          }`}
        >
          All ({counts.all})
        </button>
        <button
          onClick={() => setFilter('connected')}
          className={`px-3 py-1.5 text-xs font-medium rounded-sv transition-colors ${
            filter === 'connected'
              ? 'bg-good text-white'
              : 'bg-bg-el border border-rule text-ink-3 hover:text-ink'
          }`}
        >
          Connected ({counts.connected})
        </button>
        <button
          onClick={() => setFilter('available')}
          className={`px-3 py-1.5 text-xs font-medium rounded-sv transition-colors ${
            filter === 'available'
              ? 'bg-ink-3 text-white'
              : 'bg-bg-el border border-rule text-ink-3 hover:text-ink'
          }`}
        >
          Available ({counts.available})
        </button>
        <button
          onClick={() => setFilter('errors')}
          className={`px-3 py-1.5 text-xs font-medium rounded-sv transition-colors ${
            filter === 'errors'
              ? 'bg-bad text-white'
              : 'bg-bg-el border border-rule text-ink-3 hover:text-ink'
          }`}
        >
          Errors ({counts.errors})
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-bg-el border border-rule rounded-sv p-4">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="h-4 w-4 text-good" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Connected</span>
          </div>
          <div className="font-display text-3xl text-good">{counts.connected}</div>
          <div className="text-xs text-ink-3 mt-1">Active integrations</div>
        </div>

        <div className="bg-bg-el border border-rule rounded-sv p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-accent" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Events</span>
          </div>
          <div className="font-display text-3xl text-accent">{totalEvents}</div>
          <div className="text-xs text-ink-3 mt-1">Last 24 hours</div>
        </div>

        <div className="bg-bg-el border border-rule rounded-sv p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-bad" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Errors</span>
          </div>
          <div className="font-display text-3xl text-bad">{counts.errors}</div>
          <div className="text-xs text-ink-3 mt-1">Need attention</div>
        </div>

        <div className="bg-bg-el border border-rule rounded-sv p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-ink-3" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Last Sync</span>
          </div>
          <div className="font-display text-xl text-ink">
            {lastSync ? new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
          </div>
          <div className="text-xs text-ink-3 mt-1">
            {lastSync ? new Date(lastSync).toLocaleDateString() : 'Never'}
          </div>
        </div>
      </div>

      {/* Integration Groups */}
      <div className="space-y-6">
        {groupedIntegrations.map((group) => {
          if (group.integrations.length === 0) return null

          return (
            <div key={group.name}>
              <h2 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
                  {group.name}
                </span>
                <Badge variant="muted">{group.integrations.length}</Badge>
              </h2>

              <div className="grid grid-cols-3 gap-4">
                {group.integrations.map((integration) => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    onClick={() => setSelectedIntegration(integration)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {selectedIntegration && (
        <IntegrationModal
          integration={selectedIntegration}
          onClose={() => setSelectedIntegration(null)}
        />
      )}
    </div>
  )
}
