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
  return NextResponse.json({ message: 'api/auth/register endpoint ready' });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { name, email, password } = body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || !password.trim()) {
      return NextResponse.json(
        { error: 'Please provide a password.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (typeof name === 'string' && name.trim())
      ? name.trim()
      : cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'Researcher';

    const user = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: cleanName,
      email: cleanEmail,
      role: 'Clinical Research Analyst',
      avatarLetter: cleanName.charAt(0).toUpperCase(),
      loggedInAt: new Date().toISOString(),
    };

    const token = 'pharma_token_' + Buffer.from(cleanEmail).toString('base64');

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user,
      token,
    }, { status: 201 });

    response.cookies.set({
      name: 'pharma_ai_auth_user',
      value: JSON.stringify(user),
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration.' },
      { status: 500 }
    );
  }
}