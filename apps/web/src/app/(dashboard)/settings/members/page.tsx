'use client'

import { Badge } from '@/components/ui/badge'
import { Users, UserPlus, Mail, MoreVertical } from 'lucide-react'

export default function MembersSettingsPage() {
  // TODO: Replace with real API call
  const members: any[] = []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Team Members</h1>
          <p className="text-sm text-ink-3">Manage your team and their permissions</p>
        </div>
        <button className="px-4 py-2 bg-accent text-white rounded-sv hover:bg-accent/90 transition-colors text-sm font-medium flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </button>
      </div>

      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
            <Users className="h-4 w-4 text-accent" />
            <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
              Active Members ({members.filter(m => m.status === 'active').length})
            </span>
          </h2>
        </div>

        {members.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="h-12 w-12 text-ink-3 mx-auto mb-3" />
            <p className="text-sm text-ink-2 mb-1">No members yet</p>
            <p className="text-xs text-ink-3">Invite team members to collaborate on projects.</p>
          </div>
        ) : (
          <div className="bg-bg-el-2 border border-rule rounded-sv overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_200px_120px_120px_80px] gap-4 px-4 py-3 bg-bg-el-3 border-b border-rule">
              {['Member', 'Email', 'Role', 'Status', ''].map((h) => (
                <div key={h} className="text-xs font-mono uppercase tracking-wider text-ink-3">
                  {h}
                </div>
              ))}
            </div>

            {/* Rows */}
            {members.map((member: any, index: number) => (
              <div
                key={member.id}
                className={`grid grid-cols-[1fr_200px_120px_120px_80px] gap-4 items-center px-4 py-3 ${
                  index !== members.length - 1 ? 'border-b border-rule' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-xs font-mono text-accent border border-accent/20">
                    {member.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-ink">{member.name}</div>
                    <div className="text-xs text-ink-3">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-ink-2">
                  <Mail className="h-3 w-3" />
                  {member.email}
                </div>

                <div>
                  <Badge
                    variant={
                      member.role === 'OWNER' ? 'default' :
                      member.role === 'PROJECT_MANAGER' ? 'info' : 'muted'
                    }
                    className="text-xs"
                  >
                    {member.role === 'OWNER' ? 'Owner' :
                     member.role === 'PROJECT_MANAGER' ? 'Project Manager' : 'Viewer'}
                  </Badge>
                </div>

                <div>
                  <Badge
                    variant={member.status === 'active' ? 'success' : 'warning'}
                    className="text-xs"
                  >
                    {member.status === 'active' ? 'Active' : 'Invited'}
                  </Badge>
                </div>

                <button className="p-2 hover:bg-bg-el-3 rounded transition-colors">
                  <MoreVertical className="h-4 w-4 text-ink-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Form */}
      <div className="bg-bg-el border border-rule rounded-sv p-5">
        <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-accent" />
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
            Invite New Member
          </span>
        </h2>

        <div className="grid grid-cols-[1fr_200px_120px] gap-3">
          <input
            type="email"
            placeholder="email@example.com"
            className="px-3 py-2 bg-bg-el-2 border border-rule rounded text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent"
          />
          <select className="px-3 py-2 bg-bg-el-2 border border-rule rounded text-sm text-ink" defaultValue="">
            <option value="" disabled>Select role</option>
            <option>Viewer</option>
            <option>Project Manager</option>
            <option>Owner</option>
          </select>
          <button className="px-4 py-2 bg-accent text-white rounded-sv hover:bg-accent/90 transition-colors text-sm font-medium">
            Send Invite
          </button>
        </div>
      </div>
    </div>
  )
}
