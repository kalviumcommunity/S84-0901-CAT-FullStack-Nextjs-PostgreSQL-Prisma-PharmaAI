import { NextResponse } from 'next/server'
import { cookieName } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' })
  response.cookies.set(cookieName(), '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  })
  return response
}
