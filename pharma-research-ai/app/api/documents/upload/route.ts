import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  saveUploadedFile,
  extractPdfPages,
  getPdfPageCount,
  pagesIntoChunks,
  deleteFile,
} from '@/lib/pdf-processor'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let savedFilePath: string | null = null

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are accepted' }, { status: 415 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 20 MB limit' }, { status: 413 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    savedFilePath = await saveUploadedFile(buffer, file.name, UPLOAD_DIR)

    // Create document record
    const document = await prisma.document.create({
      data: {
        userId: session.userId,
        filename: path.basename(savedFilePath),
        originalName: file.name,
        fileSize: file.size,
        status: 'PROCESSING',
      },
    })

    // Process PDF in background — extract text and store chunks (no embeddings)
    processPdfAsync(savedFilePath, document.id, session.userId, file.name).catch((err) => {
      console.error(`[upload] Background processing failed for ${document.id}:`, err)
    })

    return NextResponse.json(
      {
        message: 'Document uploaded and processing started',
        document: {
          id: document.id,
          originalName: document.originalName,
          status: document.status,
          createdAt: document.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('[upload]', err)
    if (savedFilePath) deleteFile(savedFilePath)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

async function processPdfAsync(
  filePath: string,
  documentId: string,
  userId: string,
  originalName: string
): Promise<void> {
  try {
    const pages = await extractPdfPages(filePath)
    const pageCount = await getPdfPageCount(filePath)
    const chunks = pagesIntoChunks(pages)

    if (chunks.length === 0) {
      await prisma.document.update({
        where: { id: documentId },
        data: { status: 'FAILED', pageCount },
      })
      return
    }

    // Store chunks (text only — no embeddings)
    await Promise.all(
      chunks.map((chunk) =>
        prisma.documentChunk.create({
          data: {
            documentId,
            userId,
            pageNumber: chunk.pageNumber,
            content: chunk.content,
          },
        })
      )
    )

    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'READY', pageCount, chunkCount: chunks.length },
    })

    console.log(`[upload] ${originalName}: ${chunks.length} chunks, ${pageCount} pages`)
  } catch (err) {
    console.error(`[processPdf] Error:`, err)
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'FAILED' },
    }).catch(() => {})
  }
}
