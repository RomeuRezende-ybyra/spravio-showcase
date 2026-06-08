import { ReactNode } from 'react'
import { RoleGuard } from '@/components/guards/role-guard'

export default function WorkspaceSettingsLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard requiredRole="OWNER">
      {children}
    </RoleGuard>
  )
}
