import { NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';
import { findUser, createUser } from '@/lib/store';

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

    let storedUser = findUser(cleanEmail);
    if (!storedUser) {
      storedUser = createUser(cleanName, cleanEmail, password);
    }

    const user = {
      id: storedUser.id,
      name: storedUser.name,
      email: storedUser.email,
      role: 'Clinical Research Analyst',
      avatarLetter: storedUser.name.charAt(0).toUpperCase() || 'R',
      loggedInAt: new Date().toISOString(),
    };

    const token = 'pharma_token_' + Buffer.from(cleanEmail).toString('base64');
    const sessionId = createSession(user.id);

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

    response.cookies.set({
      name: 'pharma_session',
      value: sessionId,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      httpOnly: true,
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