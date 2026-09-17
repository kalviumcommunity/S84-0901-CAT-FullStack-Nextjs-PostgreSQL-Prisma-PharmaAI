import { NextResponse } from 'next/server';
import { addDocument, listDocuments } from '@/lib/store';

export async function GET() {
  return NextResponse.json({ documents: listDocuments() });
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File) || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Please upload a PDF file.' }, { status: 400 });
    }
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'PDFs must be smaller than 25 MB.' }, { status: 400 });
    }
    return NextResponse.json({ document: addDocument(file.name, file.size) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to process document upload.' }, { status: 500 });
  }
}