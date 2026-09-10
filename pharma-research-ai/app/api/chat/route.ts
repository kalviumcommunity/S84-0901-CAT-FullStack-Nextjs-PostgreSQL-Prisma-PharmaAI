import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'api/chat GET route' });
}

export async function POST() {
  return NextResponse.json({ message: 'api/chat POST route' });
}