'use client'

import { Badge } from '@/components/ui/badge'
import { Shield, Smartphone, Monitor, Chrome, FileText, Lock, Key, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  getSessions,
  getAuditLog,
  revokeSession,
  revokeAllSessions,
  changePassword,
  type UserSession as ApiUserSession,
  type AuditLogEntry as ApiAuditLogEntry,
} from '@/lib/api/security'

export default function SecuritySettingsPage() {
  const [sessions, setSessions] = useState<ApiUserSession[]>([])
  const [auditLog, setAuditLog] = useState<ApiAuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  })
  const [changingPassword, setChangingPassword] = useState(false)

  const is2FAEnabled = false // TODO: Implement 2FA feature
  const backupCodesRemaining = 0 // TODO: Implement backup codes

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [sessionsData, auditLogData] = await Promise.all([
        getSessions(),
        getAuditLog(20, 0),
      ])

      setSessions(sessionsData.sessions)
      setAuditLog(auditLogData.logs)
    } catch (error) {
      console.error('Failed to load security data:', error)
      alert('Failed to load security settings')
    } finally {
      setLoading(false)
    }
  }

  async function handleRevokeSession(sessionId: string) {
    if (!confirm('Are you sure you want to revoke this session?')) return

    try {
      await revokeSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    } catch (error) {
      console.error('Failed to revoke session:', error)
      alert('Failed to revoke session')
    }
  }

  async function handleRevokeAllSessions() {
    if (!confirm('Are you sure you want to revoke all other sessions?')) return

    try {
      const result = await revokeAllSessions()
      alert(`${result.revokedCount} session(s) revoked`)
      await loadData()
    } catch (error) {
      console.error('Failed to revoke all sessions:', error)
      alert('Failed to revoke sessions')
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()

    if (passwords.new !== passwords.confirm) {
      alert('New passwords do not match')
      return
    }

    if (passwords.new.length < 8) {
      alert('Password must be at least 8 characters')
      return
    }

    setChangingPassword(true)
    try {
      await changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
      })

      alert('Password changed successfully')
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (error) {
      console.error('Failed to change password:', error)
      alert('Failed to change password. Please check your current password.')
    } finally {
      setChangingPassword(false)
    }
  }

  const getRelativeTime = (timestamp: string) => {
    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now.getTime() - then.getTime()
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const getDeviceIcon = (device: string | null) => {
    if (!device) return Chrome
    if (device.includes('iPhone') || device.includes('Android')) return Smartphone
    if (device.includes('macOS') || device.includes('Mac')) return Monitor
    return Chrome
  }

  const formatEventName = (event: string) => {
    return event
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Security</h1>
        <p className="text-sm text-ink-3">Manage your account security and authentication settings</p>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
            <Shield className="h-4 w-4 text-accent" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
              Two-Factor Authentication
            </span>
          </h2>
          {is2FAEnabled && <Badge variant="success" className="text-xs">Enabled</Badge>}
        </div>

        <div className="space-y-4">
          <div className="bg-bg-el-2 border border-rule rounded-sv p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-ink mb-1">Authenticator App</h3>
                  <p className="text-xs text-ink-3">Use an authenticator app (Google Authenticator, Authy, etc.)</p>
                  {is2FAEnabled ? (
                    <Badge variant="success" className="text-xs mt-2">Active</Badge>
                  ) : (
                    <button className="px-3 py-1.5 text-xs font-medium text-accent border border-accent rounded-sv hover:bg-accent/10 transition-colors mt-2">
                      Enable
                    </button>
                  )}
                </div>
              </div>
              {is2FAEnabled && (
                <button className="px-3 py-1.5 text-xs font-medium text-bad hover:bg-bad/10 border border-rule rounded-sv transition-colors">
                  Disable
                </button>
              )}
            </div>
          </div>

          <div className="bg-bg-el-2 border border-rule rounded-sv p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Key className="h-5 w-5 text-ink-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-ink mb-1">Backup Codes</h3>
                  <p className="text-xs text-ink-3">Use backup codes if you lose access to your authenticator</p>
                  {backupCodesRemaining > 0 && (
                    <p className="text-xs text-warn mt-1">{backupCodesRemaining} codes remaining</p>
                  )}
                </div>
              </div>
              {backupCodesRemaining > 0 && (
                <button className="px-3 py-1.5 text-xs font-medium text-accent border border-accent rounded-sv hover:bg-accent/10 transition-colors">
                  View Codes
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Password */}
      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
          <Lock className="h-4 w-4 text-accent" />
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
            Password
          </span>
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="text-xs text-ink-3 block mb-1">Current Password</label>
            <input
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
              required
              className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded text-sm text-ink focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="text-xs text-ink-3 block mb-1">New Password</label>
            <input
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords((p) => ({ ...p, new: e.target.value }))}
              required
              minLength={8}
              className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded text-sm text-ink focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="text-xs text-ink-3 block mb-1">Confirm New Password</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
              required
              minLength={8}
              className="w-full px-3 py-2 bg-bg-el-2 border border-rule rounded text-sm text-ink focus:outline-none focus:border-accent"
            />
          </div>

          <button
            type="submit"
            disabled={changingPassword}
            className="px-6 py-2 bg-accent text-white rounded-sv hover:bg-accent/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {changingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
            Update Password
          </button>
        </form>
      </div>

      {/* Active Sessions */}
      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
            <Monitor className="h-4 w-4 text-accent" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
              Active Sessions ({sessions.length})
            </span>
          </h2>
          {sessions.length > 1 && (
            <button
              onClick={handleRevokeAllSessions}
              className="px-3 py-1.5 text-xs font-medium text-bad border border-bad rounded-sv hover:bg-bad/10 transition-colors"
            >
              Revoke All Sessions
            </button>
          )}
        </div>

        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-ink-3 text-sm">
              No active sessions found
            </div>
          ) : (
            sessions.map((session) => {
              const Icon = getDeviceIcon(session.device)
              return (
                <div
                  key={session.id}
                  className="bg-bg-el-2 border border-rule rounded-sv p-4 flex items-start justify-between"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-accent mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-ink">
                          {session.device || 'Unknown Device'}
                        </h3>
                        {session.isCurrent && (
                          <Badge variant="success" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-ink-3 mb-1">
                        {session.location || 'Unknown Location'}
                      </p>
                      <p className="text-xs text-ink-3 font-mono">
                        IP: {session.ipAddress || 'N/A'} · Last active{' '}
                        {getRelativeTime(session.lastActive)}
                      </p>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <button
                      onClick={() => handleRevokeSession(session.id)}
                      className="px-3 py-1.5 text-xs font-medium text-bad hover:bg-bad/10 border border-rule rounded-sv transition-colors"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-accent" />
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
            Security Audit Log (Last 20)
          </span>
        </h2>

        <div className="bg-bg-el-2 border border-rule rounded-sv overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_180px_150px] gap-4 px-4 py-3 bg-bg-el-3 border-b border-rule">
            {['Event', 'Timestamp', 'IP Address'].map((h) => (
              <div key={h} className="text-xs font-mono uppercase tracking-wider text-ink-3">
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {auditLog.length === 0 ? (
            <div className="text-center py-8 text-ink-3 text-sm">
              No audit log entries found
            </div>
          ) : (
            auditLog.map((log, index) => (
              <div
                key={log.id}
                className={`grid grid-cols-[1fr_180px_150px] gap-4 items-center px-4 py-3 ${
                  index !== auditLog.length - 1 ? 'border-b border-rule' : ''
                }`}
              >
                <div>
                  <div className="text-sm font-medium text-ink">
                    {formatEventName(log.event)}
                  </div>
                  {log.details && <div className="text-xs text-ink-3">{log.details}</div>}
                </div>
                <div className="text-xs text-ink-2">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
                <div className="text-xs font-mono text-ink-2">
                  {log.ipAddress || 'N/A'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
