import { ReactNode } from 'react'
import { RoleGuard } from '@/components/guards/role-guard'

export default function BillingSettingsLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard requiredRole="OWNER">
      {children}
    </RoleGuard>
  )
}
