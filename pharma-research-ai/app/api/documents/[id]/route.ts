import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteFile } from '@/lib/pdf-processor'
import path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      chunks: {
        orderBy: [{ pageNumber: 'asc' }, { createdAt: 'asc' }],
        select: { id: true, pageNumber: true, content: true },
      },
    },
  })

  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  if (document.userId !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({ document })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const document = await prisma.document.findUnique({ where: { id } })

  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  if (document.userId !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Delete from DB (cascades to chunks)
  await prisma.document.delete({ where: { id } })

  // Delete file from disk
  const filePath = path.join(UPLOAD_DIR, document.filename)
  deleteFile(filePath)

  return NextResponse.json({ message: 'Document deleted' })
}
