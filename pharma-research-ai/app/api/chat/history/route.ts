import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const conversations = await prisma.conversation.findMany({
    where: { userId: session.userId },
    orderBy: { updatedAt: 'desc' },
    take: 50,
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { citations: true },
      },
    },
  })

  return NextResponse.json({ conversations })
}
