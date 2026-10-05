import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'pharma_token'

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/documents', '/chat', '/viewer', '/history', '/settings']

// Routes that should redirect to dashboard if already logged in
const AUTH_ROUTES = ['/login', '/signup']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(COOKIE_NAME)?.value

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  // Verify token using the same secret as lib/auth.ts
  let isValid = false
  if (token && process.env.JWT_SECRET) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      await jwtVerify(token, secret)
      isValid = true
    } catch {
      isValid = false
    }
  }

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !isValid) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from login/signup
  if (isAuthRoute && isValid) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg).*)',
  ],
}
