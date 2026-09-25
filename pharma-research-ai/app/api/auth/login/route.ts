import { NextRequest, NextResponse } from 'next/server';
import { findUser, hashPassword } from '@/lib/store';
import { signToken, cookieName } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = findUser(cleanEmail);

    if (!user) {
      // For development/demo friendliness: create default user if not found or reject
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const hashed = hashPassword(password);
    if (user.passwordHash !== hashed) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await signToken({ userId: user.id, email: user.email });

    const response = NextResponse.json({
      message: 'Logged in',
      user: { id: user.id, email: user.email, name: user.name },
    });

    response.cookies.set(cookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('[login]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
