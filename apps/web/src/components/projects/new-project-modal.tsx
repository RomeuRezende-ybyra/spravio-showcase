'use client'

import { useState } from 'react'
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react'

interface NewProjectModalProps {
  open: boolean
  onClose: () => void
  onCreate?: (project: any) => Promise<void>
  data?: {
    clients?: Array<{ id: string; name: string }>
    pms?: Array<{ id: string; name: string }>
    devs?: Array<{ id: string; name: string; avatar: string }>
  }
}

export function NewProjectModal({ open, onClose, onCreate, data = {} }: NewProjectModalProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Identity
    name: '',
    key: '',
    client: '',
    description: '',
    tags: [] as string[],

    // Step 2: Contract
    contractType: 'fixed' as 'fixed' | 'tm' | 'retainer',
    budget: '',
    hours: '',
    startDate: '',
    deadline: '',

    // Step 3: Team
    pm: '',
    devs: [] as string[],
    allocations: {} as Record<string, number>,

    // Step 4: Review (no fields, just display)
  })

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await onCreate?.(formData)
      onClose()
      setStep(1)
      setFormData({
        name: '',
        key: '',
        client: '',
        description: '',
        tags: [],
        contractType: 'fixed',
        budget: '',
        hours: '',
        startDate: '',
        deadline: '',
        pm: '',
        devs: [],
        allocations: {},
      })
    } catch (error) {
      console.error('Error creating project:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  const steps = [
    { number: 1, label: 'Identity' },
    { number: 2, label: 'Contract' },
    { number: 3, label: 'Team' },
    { number: 4, label: 'Review' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-bg-el border border-rule rounded-sv shadow-sv overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-rule">
          <div>
            <h2 className="text-xl font-semibold text-ink">New Project</h2>
            <p className="text-sm text-ink-3 mt-0.5">Step {step} of 4: {steps[step - 1]?.label}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-sv hover:bg-bg-el-2 transition-colors text-ink-3 hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between px-8 py-4 bg-bg-el-2">
          {steps.map((s, idx) => (
            <div key={s.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step > s.number
                      ? 'bg-good text-white'
                      : step === s.number
                      ? 'bg-accent text-white'
                      : 'bg-bg-el-3 text-ink-3 border border-rule'
                  }`}
                >
                  {step > s.number ? <Check className="h-4 w-4" /> : s.number}
                </div>
                <span
                  className={`mt-1 text-xs ${
                    step === s.number ? 'text-ink font-medium' : 'text-ink-3'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mb-5 mx-2 ${
                    step > s.number ? 'bg-good' : 'bg-rule'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 min-h-[400px]">
          {/* Step 1: Identity */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    updateField('name', e.target.value)
                    // Auto-generate key
                    const key = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, '')
                      .slice(0, 4)
                    updateField('key', key || '')
                  }}
                  placeholder="e.g., Portal Administrativo"
                  className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded-sv text-ink placeholder:text-ink-3 focus:outline-none focus:border-rule-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Project Key *
                </label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => updateField('key', e.target.value.toUpperCase())}
                  placeholder="AUTO"
                  maxLength={6}
                  className="w-32 px-3 py-2 bg-bg-el-2 border border-rule rounded-sv text-ink font-mono placeholder:text-ink-3 focus:outline-none focus:border-rule-2"
                />
                <p className="text-xs text-ink-3 mt-1">Auto-generated from name, editable</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Client
                </label>
                <select
                  value={formData.client}
                  onChange={(e) => updateField('client', e.target.value)}
                  className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded-sv text-ink focus:outline-none focus:border-rule-2"
                >
                  <option value="">Select client...</option>
                  {data?.clients?.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Brief project description..."
                  rows={4}
                  className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded-sv text-ink placeholder:text-ink-3 focus:outline-none focus:border-rule-2 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Tags</label>
                <input
                  type="text"
                  placeholder="react, nextjs, api (comma-separated)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault()
                      const value = e.currentTarget.value.trim()
                      if (value && !formData.tags.includes(value)) {
                        updateField('tags', [...formData.tags, value])
                        e.currentTarget.value = ''
                      }
                    }
                  }}
                  className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded-sv text-ink placeholder:text-ink-3 focus:outline-none focus:border-rule-2"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-bg-el-3 border border-rule rounded-sv-sm text-xs text-ink-2"
                    >
                      {tag}
                      <button
                        onClick={() =>
                          updateField(
                            'tags',
                            formData.tags.filter((t) => t !== tag)
                          )
                        }
                        className="hover:text-ink"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contract */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Contract Type *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'fixed', label: 'Fixed Price', desc: 'Scope and budget defined' },
                    { value: 'tm', label: 'T&M', desc: 'Time and materials' },
                    { value: 'retainer', label: 'Retainer', desc: 'Monthly commitment' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => updateField('contractType', type.value)}
                      className={`p-3 border rounded-sv text-left transition-colors ${
                        formData.contractType === type.value
                          ? 'border-accent bg-accent/10 text-ink'
                          : 'border-rule bg-bg-el-2 text-ink-2 hover:border-rule-2'
                      }`}
                    >
                      <div className="font-medium text-sm">{type.label}</div>
                      <div className="text-xs text-ink-3 mt-0.5">{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">
                    Budget (R$) *
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => updateField('budget', e.target.value)}
                    placeholder="150000"
                    className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded-sv text-ink font-mono placeholder:text-ink-3 focus:outline-none focus:border-rule-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    value={formData.hours}
                    onChange={(e) => updateField('hours', e.target.value)}
                    placeholder="1000"
                    className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded-sv text-ink font-mono placeholder:text-ink-3 focus:outline-none focus:border-rule-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => updateField('startDate', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded-sv text-ink focus:outline-none focus:border-rule-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => updateField('deadline', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded-sv text-ink focus:outline-none focus:border-rule-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Team */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Project Manager *
                </label>
                <select
                  value={formData.pm}
                  onChange={(e) => updateField('pm', e.target.value)}
                  className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded-sv text-ink focus:outline-none focus:border-rule-2"
                >
                  <option value="">Select PM...</option>
                  {data?.pms?.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Team Members
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {data?.devs?.map((dev) => {
                    const isSelected = formData.devs.includes(dev.id)
                    return (
                      <label
                        key={dev.id}
                        className="flex items-center gap-3 p-2 rounded-sv hover:bg-bg-el-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateField('devs', [...formData.devs, dev.id])
                              updateField('allocations', { ...formData.allocations, [dev.id]: 50 })
                            } else {
                              updateField(
                                'devs',
                                formData.devs.filter((id) => id !== dev.id)
                              )
                              const { [dev.id]: _, ...rest } = formData.allocations
                              updateField('allocations', rest)
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <div className="flex-1 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-mono text-accent">
                            {dev.avatar}
                          </div>
                          <span className="text-sm text-ink">{dev.name}</span>
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={formData.allocations[dev.id] || 50}
                              onChange={(e) =>
                                updateField('allocations', {
                                  ...formData.allocations,
                                  [dev.id]: Number(e.target.value),
                                })
                              }
                              min="0"
                              max="100"
                              className="w-16 px-2 py-1 bg-bg-el-3 border border-rule rounded-sv-sm text-sm text-ink text-right focus:outline-none focus:border-rule-2"
                            />
                            <span className="text-xs text-ink-3">%</span>
                          </div>
                        )}
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-bg-el-2 border border-rule rounded-sv p-4">
                <h3 className="text-sm font-semibold text-ink mb-3">Project Summary</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink-3">Name:</dt>
                    <dd className="text-ink font-medium">{formData.name || '—'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-3">Key:</dt>
                    <dd className="text-ink font-mono">{formData.key || '—'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-3">Contract:</dt>
                    <dd className="text-ink">{formData.contractType.toUpperCase()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-3">Budget:</dt>
                    <dd className="text-ink font-mono">
                      R$ {Number(formData.budget).toLocaleString('pt-BR') || '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-3">Team:</dt>
                    <dd className="text-ink">{formData.devs.length} members</dd>
                  </div>
                </dl>
              </div>

              <p className="text-sm text-ink-3">
                Review the information above. Click "Create Project" to confirm.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-rule">
          <button
            onClick={step === 1 ? onClose : handleBack}
            className="flex items-center gap-2 px-4 py-2 rounded-sv border border-rule text-ink-2 hover:border-rule-2 hover:text-ink transition-colors"
            disabled={loading}
          >
            {step === 1 ? (
              <>
                <X className="h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <ArrowLeft className="h-4 w-4" />
                Back
              </>
            )}
          </button>

          <button
            onClick={step === 4 ? handleSubmit : handleNext}
            disabled={loading || (step === 1 && !formData.name)}
            className="flex items-center gap-2 px-4 py-2 rounded-sv bg-accent hover:bg-accent-deep text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              'Creating...'
            ) : step === 4 ? (
              <>
                <Check className="h-4 w-4" />
                Create Project
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
