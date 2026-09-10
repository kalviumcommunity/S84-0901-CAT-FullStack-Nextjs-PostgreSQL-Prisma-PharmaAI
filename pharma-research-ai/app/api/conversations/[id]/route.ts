import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'api/conversations/[id] GET route' });
}

export async function POST() {
  return NextResponse.json({ message: 'api/conversations/[id] POST route' });
}