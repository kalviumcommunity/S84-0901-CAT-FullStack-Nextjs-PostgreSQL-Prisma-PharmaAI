import { NextResponse } from 'next/server';
import { answerQuestion } from '@/lib/store';

export async function GET() {
  return NextResponse.json({ message: 'api/chat endpoint ready' });
}

export async function POST(request: Request) {
  try {
    const { conversationId = 'default', question } = await request.json();
    if (!question?.trim()) {
      return NextResponse.json({ error: 'Ask a question to search your evidence.' }, { status: 400 });
    }
    return NextResponse.json({ message: answerQuestion(conversationId, question.trim()) });
  } catch {
    return NextResponse.json({ error: 'Failed to process chat message.' }, { status: 500 });
  }
}