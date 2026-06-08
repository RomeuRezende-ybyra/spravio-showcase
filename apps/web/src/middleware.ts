import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Allow public routes: landing, auth, login, portal
  if (
    pathname === '/' ||
    pathname.startsWith('/api/auth') ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/portal/')
  ) {
    // Authenticated user on landing page → go to dashboard
    if (token && pathname === '/') {
      return NextResponse.redirect(new URL('/portfolio', request.url))
    }
    // Authenticated user on login/register → go to dashboard
    if (token && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/portfolio', request.url))
    }
    return NextResponse.next()
  }

  // Unauthenticated → landing page
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
