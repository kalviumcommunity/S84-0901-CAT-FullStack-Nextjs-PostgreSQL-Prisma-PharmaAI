import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'pharma_token'

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/documents', '/chat', '/viewer', '/history', '/settings']

// Routes that should redirect to dashboard if already logged in
const AUTH_ROUTES = ['/login', '/signup']

function decodeBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  const binary = atob(padded)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

async function verifyToken(token: string, secret: string): Promise<boolean> {
  const parts = token.split('.')
  if (parts.length !== 3) return false

  try {
    const [encodedHeader, encodedPayload, encodedSignature] = parts
    const header = JSON.parse(new TextDecoder().decode(decodeBase64Url(encodedHeader)))
    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(encodedPayload)))
    if (header.alg !== 'HS256' || typeof payload.exp !== 'number' || payload.exp <= Math.floor(Date.now() / 1000)) {
      return false
    }

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    )

    return crypto.subtle.verify(
      'HMAC',
      key,
      decodeBase64Url(encodedSignature),
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`),
    )
  } catch {
    return false
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(COOKIE_NAME)?.value

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  // Verify token using the same secret as lib/auth.ts
  let isValid = false
  if (token && process.env.JWT_SECRET) {
    isValid = await verifyToken(token, process.env.JWT_SECRET)
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
