import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUser } from '@/lib/store';
import { signToken, cookieName } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    // Validate input
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = findUser(cleanEmail);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const userName = name?.trim() || cleanEmail.split('@')[0];
    const user = createUser(userName, cleanEmail, password);

    const token = await signToken({ userId: user.id, email: user.email });

    const response = NextResponse.json(
      { message: 'Account created', user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 }
    );

    response.cookies.set(cookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('[register]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
