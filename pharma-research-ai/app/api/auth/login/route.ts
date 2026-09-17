import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'api/auth/login endpoint ready' });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

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
    const derivedName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'Researcher';

    const user = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: derivedName,
      email: cleanEmail,
      role: 'Clinical Research Analyst',
      avatarLetter: derivedName.charAt(0).toUpperCase(),
      loggedInAt: new Date().toISOString(),
    };

    const token = 'pharma_token_' + Buffer.from(cleanEmail).toString('base64');

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user,
      token,
    });

    response.cookies.set({
      name: 'pharma_ai_auth_user',
      value: JSON.stringify(user),
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during login.' },
      { status: 500 }
    );
  }
}