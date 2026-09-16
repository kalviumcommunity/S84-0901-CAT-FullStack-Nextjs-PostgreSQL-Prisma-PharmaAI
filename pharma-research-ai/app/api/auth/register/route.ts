import { NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';
import { createUser, findUser } from '@/lib/store';

export async function POST(request: Request) {
  const { name, email, password } = await request.json();
  if (!name || !email || !password || password.length < 8) return NextResponse.json({ error: 'Name, email, and an 8-character password are required.' }, { status: 400 });
  if (findUser(email)) return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 });
  const user = createUser(name, email, password);
  const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
  response.cookies.set('pharma_session', createSession(user.id), { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
  return response;
}import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'api/auth/register GET route' });
}

export async function POST() {
  return NextResponse.json({ message: 'api/auth/register POST route' });
}