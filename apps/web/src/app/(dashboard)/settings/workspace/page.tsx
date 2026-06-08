'use client'

import { Settings, Building } from 'lucide-react'

export default function WorkspaceSettingsPage() {
  // TODO: Replace with real API call to load org settings
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Workspace Settings</h1>
        <p className="text-sm text-ink-3">Manage your organization details and defaults</p>
      </div>

      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
          <Building className="h-4 w-4 text-accent" />
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
            Organization Details
          </span>
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-ink-3 block mb-1">Organization Name</label>
            <input
              type="text"
              defaultValue=""
              placeholder="Your organization name"
              className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="text-xs text-ink-3 block mb-1">Domain</label>
            <input
              type="text"
              defaultValue=""
              placeholder="your-org.spravio.io"
              className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent"
            />
            <p className="text-xs text-ink-3 mt-1">Your unique workspace URL</p>
          </div>

          <div>
            <label className="text-xs text-ink-3 block mb-1">Industry</label>
            <select className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded text-sm text-ink" defaultValue="">
              <option value="" disabled>Select an industry</option>
              <option>Software Development</option>
              <option>Consulting</option>
              <option>Agency</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-ink-3 block mb-1">Company Size</label>
            <select className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded text-sm text-ink" defaultValue="">
              <option value="" disabled>Select company size</option>
              <option>1-10 employees</option>
              <option>11-50 employees</option>
              <option>51-200 employees</option>
              <option>200+ employees</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
          <Settings className="h-4 w-4 text-accent" />
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
            Default Settings
          </span>
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-ink-3 block mb-1">Default Currency</label>
            <select className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded text-sm text-ink" defaultValue="">
              <option value="" disabled>Select a currency</option>
              <option>USD ($)</option>
              <option>BRL (R$)</option>
              <option>EUR (€)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-ink-3 block mb-1">Default Issue Tracker</label>
            <select className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded text-sm text-ink" defaultValue="">
              <option value="" disabled>Select issue tracker</option>
              <option>Jira</option>
              <option>Azure DevOps</option>
              <option>Linear</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
              <input type="checkbox" className="rounded" />
              Enable project templates
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
              <input type="checkbox" className="rounded" />
              Require time tracking for all projects
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="px-6 py-2 bg-accent text-white rounded-sv hover:bg-accent/90 transition-colors text-sm font-medium">
          Save Changes
        </button>
        <button className="px-6 py-2 border border-rule rounded-sv hover:bg-bg-el-2 transition-colors text-sm font-medium text-ink">
          Cancel
        </button>
      </div>
    </div>
  )
}
