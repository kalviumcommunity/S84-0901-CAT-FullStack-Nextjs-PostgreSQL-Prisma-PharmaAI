import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { chat, type GeminiMessage } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { question, conversationId } = body

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    const trimmed = question.trim()

    // Load existing conversation history so the AI remembers context
    let convId: string = conversationId ?? ''
    let history: GeminiMessage[] = []

    if (convId) {
      const existing = await prisma.conversation.findUnique({
        where: { id: convId },
        include: {
          messages: { orderBy: { createdAt: 'asc' }, take: 20 },
        },
      })
      // Only use this conversation if it belongs to the current user
      if (existing && existing.userId === session.userId) {
        history = existing.messages.map((m) => ({
          role: m.role === 'USER' ? 'user' : 'model',
          parts: [{ text: m.content }],
        }))
      } else {
        convId = ''
      }
    }

    // Call Gemini
    let answer: string
    try {
      answer = await chat(history, trimmed)
    } catch (err) {
      console.error('[chat] Gemini error:', err)
      return NextResponse.json(
        { error: 'AI service unavailable. Please try again.' },
        { status: 502 }
      )
    }

    // Create conversation on first message
    if (!convId) {
      const conversation = await prisma.conversation.create({
        data: {
          userId: session.userId,
          title: trimmed.slice(0, 80),
        },
      })
      convId = conversation.id
    }

    // Persist user + assistant messages
    await prisma.message.create({
      data: { conversationId: convId, role: 'USER', content: trimmed },
    })

    const assistantMsg = await prisma.message.create({
      data: { conversationId: convId, role: 'ASSISTANT', content: answer },
    })

    return NextResponse.json({
      answer,
      conversationId: convId,
      messageId: assistantMsg.id,
    })
  } catch (err) {
    console.error('[chat]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
