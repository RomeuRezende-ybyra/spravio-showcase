import { NextRequest, NextResponse } from 'next/server'
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

    const res = await fetch(`${API_URL}/projects/mine`, {
      headers: {
        Authorization: `Bearer ${session.apiToken}`,
      },
      cache: 'no-store',
    })

    const json = await res.json()

    return NextResponse.json(json, { status: res.status })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list projects' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.apiToken) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const body = await request.json()

    const res = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.apiToken}`,
      },
      body: JSON.stringify(body),
    })

    const json = await res.json()

    return NextResponse.json(json, { status: res.status })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create project' } },
      { status: 500 }
    )
  }
}
