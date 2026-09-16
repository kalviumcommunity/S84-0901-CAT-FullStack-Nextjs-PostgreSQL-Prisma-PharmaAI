import { NextResponse } from 'next/server';
import { answerQuestion } from '@/lib/store';

export async function POST(request: Request) {
  const { conversationId = 'default', question } = await request.json();
  if (!question?.trim()) return NextResponse.json({ error: 'Ask a question to search your evidence.' }, { status: 400 });
  return NextResponse.json({ message: answerQuestion(conversationId, question.trim()) });
}import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'api/chat GET route' });
}

export async function POST() {
  return NextResponse.json({ message: 'api/chat POST route' });
}