import { ReactNode } from 'react'
import { RoleGuard } from '@/components/guards/role-guard'

export default function MembersSettingsLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard requiredRole="OWNER">
      {children}
    </RoleGuard>
  )
}
