import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3010'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.apiToken) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const res = await fetch(`${API_URL}/sprints`, {
      headers: { Authorization: `Bearer ${session.apiToken}` },
      cache: 'no-store',
    })

    const json = await res.json()
    return NextResponse.json(json, { status: res.status })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch sprints' } },
      { status: 500 }
    )
  }
}
