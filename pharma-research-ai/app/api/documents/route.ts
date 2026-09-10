import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'api/documents GET route' });
}

export async function POST() {
  return NextResponse.json({ message: 'api/documents POST route' });
}