import { ReactNode } from 'react'
import { RoleGuard } from '@/components/guards/role-guard'

export default function WebhooksSettingsLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard requiredRole={['OWNER', 'PROJECT_MANAGER']}>
      {children}
    </RoleGuard>
  )
}
