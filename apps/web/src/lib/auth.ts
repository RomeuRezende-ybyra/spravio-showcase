import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GitHubProvider from 'next-auth/providers/github'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3010'

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
      authorization: { params: { scope: 'read:user user:email' } },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        })

        const json = await res.json()

        if (!res.ok || !json.success) return null

        const { token, user } = json.data
        return {
          id: user.userId,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          userId: user.userId,
          orgId: user.orgId,
          orgRole: user.orgRole,
          apiToken: token,
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github' && profile) {
        try {
          const ghProfile = profile as { id?: number; login?: string; avatar_url?: string; email?: string; name?: string }
          const res = await fetch(`${API_URL}/auth/oauth/github`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              githubId: String(ghProfile.id),
              email: ghProfile.email ?? user.email,
              name: ghProfile.name ?? ghProfile.login ?? user.name ?? 'GitHub User',
              avatarUrl: ghProfile.avatar_url ?? user.image,
              accessToken: account.access_token,
            }),
          })

          const json = await res.json()
          if (!res.ok || !json.success) return false

          // Stash API response on the user object so jwt callback can read it
          const u = user as unknown as Record<string, unknown>
          u.userId = json.data.user.userId
          u.orgId = json.data.user.orgId
          u.orgRole = json.data.user.orgRole
          u.apiToken = json.data.token
          return true
        } catch {
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        const u = user as unknown as { userId: string; orgId: string; orgRole: string; apiToken: string }
        token.userId = u.userId
        token.orgId = u.orgId
        token.orgRole = u.orgRole
        token.apiToken = u.apiToken
      }
      // On initial GitHub sign-in, account is present but user fields already set above
      if (account?.provider === 'github' && !token.apiToken) {
        // Fallback — shouldn't reach here if signIn callback succeeded
        return token
      }
      return token
    },
    async session({ session, token }) {
      session.userId = token.userId as string
      session.orgId = token.orgId as string
      session.orgRole = token.orgRole as string
      session.apiToken = token.apiToken as string
      return session
    },
  },
}
