import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [documentCount, questionCount, recentDocuments, recentQuestions] = await Promise.all([
    prisma.document.count({ where: { userId: session.userId } }),
    prisma.message.count({
      where: {
        role: 'USER',
        conversation: { userId: session.userId },
      },
    }),
    prisma.document.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        originalName: true,
        pageCount: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.message.findMany({
      where: {
        role: 'USER',
        conversation: { userId: session.userId },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        content: true,
        createdAt: true,
        conversationId: true,
      },
    }),
  ])

  return NextResponse.json({
    stats: {
      documentCount,
      questionCount,
    },
    recentDocuments,
    recentQuestions,
  })
}
