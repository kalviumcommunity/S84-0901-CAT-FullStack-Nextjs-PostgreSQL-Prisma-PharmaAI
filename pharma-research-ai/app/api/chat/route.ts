import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { searchChunks } from '@/lib/vector-search'
import { generateAnswer } from '@/lib/groq'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { question, documentIds, conversationId } = body

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    // Search for relevant chunks
    const chunks = await searchChunks(
      question.trim(),
      session.userId,
      documentIds?.length > 0 ? documentIds : undefined,
      5
    )

    // Generate answer via Groq
    let answer: string
    try {
      answer = await generateAnswer(question.trim(), chunks)
    } catch (err) {
      console.error('[chat] Groq error:', err)
      return NextResponse.json(
        { error: 'AI service unavailable. Please try again.' },
        { status: 502 }
      )
    }

    // Build citations from retrieved chunks
    const citations = chunks.map((chunk) => ({
      documentName: chunk.documentName,
      pageNumber: chunk.pageNumber,
      passage: chunk.content.slice(0, 300), // Truncate for display
      similarity: Math.round(chunk.similarity * 100) / 100,
    }))

    // Persist conversation + messages
    let convId = conversationId
    if (!convId) {
      const conversation = await prisma.conversation.create({
        data: {
          userId: session.userId,
          title: question.trim().slice(0, 80),
        },
      })
      convId = conversation.id
    }

    // Save user message
    const userMsg = await prisma.message.create({
      data: {
        conversationId: convId,
        role: 'USER',
        content: question.trim(),
      },
    })

    // Save assistant message with citations
    const assistantMsg = await prisma.message.create({
      data: {
        conversationId: convId,
        role: 'ASSISTANT',
        content: answer,
        citations: {
          create: citations.map((c) => ({
            documentName: c.documentName,
            pageNumber: c.pageNumber,
            passage: c.passage,
            similarity: c.similarity,
          })),
        },
      },
      include: { citations: true },
    })

    return NextResponse.json({
      answer,
      citations: assistantMsg.citations,
      conversationId: convId,
      messageId: assistantMsg.id,
    })
  } catch (err) {
    console.error('[chat]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
