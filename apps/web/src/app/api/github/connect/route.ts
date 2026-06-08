import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: 'GitHub OAuth not configured' }, { status: 500 })
  }

  // Generate CSRF nonce
  const nonce = randomBytes(16).toString('hex')
  const state = JSON.stringify({ orgId: session.orgId, nonce })
  const encodedState = Buffer.from(state).toString('base64url')

  // Store nonce in cookie for validation on callback
  const cookieStore = await cookies()
  cookieStore.set('github_oauth_state', encodedState, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  })

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/github/callback`,
    scope: 'repo read:org read:user',
    state: encodedState,
  })

  const githubUrl = `https://github.com/login/oauth/authorize?${params.toString()}`

  return NextResponse.redirect(githubUrl)
}
