import { ReactNode } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { OrgRole } from '@spravio/types'
import { Shield, Lock } from 'lucide-react'

type RoleGuardProps = {
  children: ReactNode
  requiredRole: OrgRole | OrgRole[]
  showBanner?: boolean // Show banner instead of hiding content
  fallback?: ReactNode // Custom fallback content
}

const ROLE_HIERARCHY: Record<OrgRole, number> = {
  VIEWER: 1,
  PROJECT_MANAGER: 2,
  OWNER: 3,
}

export async function RoleGuard({
  children,
  requiredRole,
  showBanner = true,
  fallback,
}: RoleGuardProps): Promise<JSX.Element> {
  const session = await getServerSession(authOptions)

  if (!session) {
    return <>{fallback ?? null}</>
  }

  const userRole = session.orgRole as OrgRole
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]

  // Check if user has sufficient role
  const userLevel = ROLE_HIERARCHY[userRole]
  const hasAccess = requiredRoles.some(role => userLevel >= ROLE_HIERARCHY[role])

  if (hasAccess) {
    return <>{children}</>
  }

  // User doesn't have access
  if (fallback) {
    return <>{fallback}</>
  }

  if (showBanner) {
    const roleNames = requiredRoles.map(r => {
      if (r === 'OWNER') return 'Owner'
      if (r === 'PROJECT_MANAGER') return 'Project Manager'
      return 'Viewer'
    }).join(' or ')

    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warn/10 border-2 border-warn/20">
              <Shield className="h-8 w-8 text-warn" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-ink mb-2">Access Restricted</h2>
          <p className="text-sm text-ink-3 mb-6">
            This page requires <span className="font-semibold text-ink">{roleNames}</span> role to access.
            <br />
            Your current role is <span className="font-semibold text-ink">{userRole === 'PROJECT_MANAGER' ? 'Project Manager' : userRole === 'OWNER' ? 'Owner' : 'Viewer'}</span>.
          </p>
          <div className="bg-bg-el border border-rule rounded-sv p-4">
            <div className="flex items-start gap-3 text-left">
              <Lock className="h-4 w-4 text-ink-3 mt-0.5 shrink-0" />
              <div className="text-xs text-ink-3">
                <p className="mb-2">To request access to this feature, contact your organization owner.</p>
                <p>If you believe this is an error, please check your role settings or contact support.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <></>
}

// Client-side role check hook (for conditional rendering in client components)
export function useRequiresRole(userRole: OrgRole | undefined, requiredRole: OrgRole | OrgRole[]): boolean {
  if (!userRole) return false

  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  const userLevel = ROLE_HIERARCHY[userRole]

  return requiredRoles.some(role => userLevel >= ROLE_HIERARCHY[role])
}
