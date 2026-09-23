import { NextResponse } from 'next/server';
import { deleteDocument, getDocument } from '@/lib/store';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const document = getDocument(id);
  if (!document) return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  return NextResponse.json({ document });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    deleteDocument(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}