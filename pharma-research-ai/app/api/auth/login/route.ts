import { NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';
import { findUser, hashPassword } from '@/lib/store';

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const user = findUser(email ?? '');
  if (!user || user.passwordHash !== hashPassword(password ?? '')) return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
  const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
  response.cookies.set('pharma_session', createSession(user.id), { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
  return response;
}import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'api/auth/login GET route' });
}

export async function POST() {
  return NextResponse.json({ message: 'api/auth/login POST route' });
}