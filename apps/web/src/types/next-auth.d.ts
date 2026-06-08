import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    userId: string
    orgId: string
    orgRole: string
    apiToken: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string
    orgId: string
    orgRole: string
    apiToken: string
  }
}
