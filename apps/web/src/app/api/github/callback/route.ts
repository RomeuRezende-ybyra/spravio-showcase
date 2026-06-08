import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3010'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/settings/integrations?github=error&message=${encodeURIComponent(error)}`, request.url)
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/settings/integrations?github=error&message=missing_params', request.url)
    )
  }

  // Validate state against cookie
  const cookieStore = await cookies()
  const storedState = cookieStore.get('github_oauth_state')?.value
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      new URL('/settings/integrations?github=error&message=state_mismatch', request.url)
    )
  }

  // Clear state cookie
  cookieStore.delete('github_oauth_state')

  // Decode state to get orgId
  let orgId: string
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString()) as { orgId: string }
    orgId = decoded.orgId
  } catch {
    return NextResponse.redirect(
      new URL('/settings/integrations?github=error&message=invalid_state', request.url)
    )
  }

  // Verify orgId matches session
  if (orgId !== session.orgId) {
    return NextResponse.redirect(
      new URL('/settings/integrations?github=error&message=org_mismatch', request.url)
    )
  }

  // Exchange code for access token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  })

  const tokenData = await tokenRes.json() as { access_token?: string; error?: string }
  if (!tokenRes.ok || !tokenData.access_token) {
    return NextResponse.redirect(
      new URL(`/settings/integrations?github=error&message=${encodeURIComponent(tokenData.error ?? 'token_exchange_failed')}`, request.url)
    )
  }

  // Send token to Fastify API to store encrypted
  const connectRes = await fetch(`${API_URL}/organizations/github/connect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.apiToken}`,
    },
    body: JSON.stringify({ accessToken: tokenData.access_token }),
  })

  if (!connectRes.ok) {
    const err = await connectRes.json().catch(() => ({ error: { message: 'unknown' } })) as { error?: { message?: string } }
    return NextResponse.redirect(
      new URL(`/settings/integrations?github=error&message=${encodeURIComponent(err.error?.message ?? 'connect_failed')}`, request.url)
    )
  }

  return NextResponse.redirect(new URL('/settings/integrations?github=connected', request.url))
}
