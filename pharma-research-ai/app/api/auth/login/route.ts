import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'api/auth/login GET route' });
}

export async function POST() {
  return NextResponse.json({ message: 'api/auth/login POST route' });
}