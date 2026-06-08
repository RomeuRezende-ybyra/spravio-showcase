'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { User, Mail, Globe, Clock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'

interface UserProfile {
  id: string
  name: string | null
  email: string
  avatarUrl: string | null
  language: string | null
  timezone: string | null
  dateFormat: string | null
  theme: string | null
}

export default function ProfileSettingsPage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [language, setLanguage] = useState('')
  const [timezone, setTimezone] = useState('')
  const [dateFormat, setDateFormat] = useState('')
  const [theme, setTheme] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await api.get<UserProfile>('/users/me')
      setProfile(data)

      // Populate form
      setName(data.name || '')
      setEmail(data.email)
      setAvatarUrl(data.avatarUrl || '')
      setLanguage(data.language || 'en')
      setTimezone(data.timezone || 'America/Sao_Paulo')
      setDateFormat(data.dateFormat || 'DD/MM/YYYY')
      setTheme(data.theme || 'dark')
    } catch (error: any) {
      console.error('Failed to load profile:', error)
      const detail = error?.message || 'Unknown error'
      setMessage({ type: 'error', text: `Failed to load profile: ${detail}` })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)

      // Validate password fields
      if (newPassword || confirmPassword) {
        if (!currentPassword) {
          setMessage({ type: 'error', text: 'Current password is required to change password' })
          return
        }
        if (newPassword !== confirmPassword) {
          setMessage({ type: 'error', text: 'New passwords do not match' })
          return
        }
        if (newPassword.length < 8) {
          setMessage({ type: 'error', text: 'New password must be at least 8 characters' })
          return
        }
      }

      // Prepare update payload
      const payload: any = {
        name: name || null,
        email,
        language,
        timezone,
        dateFormat,
        theme,
        avatarUrl: avatarUrl || null,
      }

      if (newPassword) {
        payload.currentPassword = currentPassword
        payload.newPassword = newPassword
      }

      await api.put('/users/me', payload)

      setMessage({ type: 'success', text: 'Profile updated successfully!' })

      // Clear password fields
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      // Reload profile
      await loadProfile()
    } catch (error: any) {
      console.error('Failed to save profile:', error)
      const errorMessage = error?.message || 'Failed to save changes'
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setName(profile.name || '')
      setEmail(profile.email)
      setAvatarUrl(profile.avatarUrl || '')
      setLanguage(profile.language || 'en')
      setTimezone(profile.timezone || 'America/Sao_Paulo')
      setDateFormat(profile.dateFormat || 'DD/MM/YYYY')
      setTheme(profile.theme || 'dark')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setMessage(null)
    }
  }

  const getInitials = () => {
    if (!name) return 'U'
    const parts = name.split(' ').filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink">Profile Settings</h1>
        <p className="text-sm text-ink-3">Manage your personal information and preferences</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-sv border ${
          message.type === 'success'
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Profile Information */}
      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
          <User className="h-4 w-4 text-accent" />
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
            Personal Information
          </span>
        </h2>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name || 'User'}
                className="h-20 w-20 rounded-full object-cover border-2 border-accent/20"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 text-2xl font-mono text-accent border-2 border-accent/20">
                {getInitials()}
              </div>
            )}
            <div className="flex-1">
              <label className="text-xs text-ink-3 block mb-1">Avatar URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded text-sm text-ink focus:outline-none focus:border-accent"
              />
              <p className="text-xs text-ink-3 mt-1">Enter a URL to your profile picture</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-ink-3 block mb-1">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded text-sm text-ink focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs text-ink-3 block mb-1">Email Address *</label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-ink-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 px-3 py-2 bg-bg-el-2 border border-rule rounded text-sm text-ink focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
            Change Password
          </span>
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-ink-3 block mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded text-sm text-ink focus:outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-ink-3 block mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded text-sm text-ink focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs text-ink-3 block mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded text-sm text-ink focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <p className="text-xs text-ink-3">Password must be at least 8 characters long</p>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4 text-accent" />
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
            Preferences
          </span>
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-ink-3 block mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded text-sm text-ink"
            >
              <option value="en">English (US)</option>
              <option value="pt-BR">Português (BR)</option>
              <option value="es">Español</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-ink-3 block mb-1">Timezone</label>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-ink-3" />
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="flex-1 px-3 py-2 bg-bg-el-2 border border-rule rounded text-sm text-ink"
              >
                <option value="America/Sao_Paulo">America/Sao_Paulo (GMT-3)</option>
                <option value="America/New_York">America/New_York (GMT-5)</option>
                <option value="Europe/London">Europe/London (GMT+0)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-ink-3 block mb-1">Date Format</label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded text-sm text-ink"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-ink-3 block mb-1">Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded text-sm text-ink"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-accent text-white rounded-sv hover:bg-accent/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={handleCancel}
          disabled={saving}
          className="px-6 py-2 border border-rule rounded-sv hover:bg-bg-el-2 transition-colors text-sm font-medium text-ink disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
