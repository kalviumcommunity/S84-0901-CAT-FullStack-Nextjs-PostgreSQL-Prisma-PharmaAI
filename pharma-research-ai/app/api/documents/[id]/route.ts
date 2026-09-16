import { NextResponse } from 'next/server';
import { deleteDocument } from '@/lib/store';

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) { deleteDocument((await params).id); return NextResponse.json({ ok: true }); }import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'api/documents/[id] GET route' });
}

export async function POST() {
  return NextResponse.json({ message: 'api/documents/[id] POST route' });
}