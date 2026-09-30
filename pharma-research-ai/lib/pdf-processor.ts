import fs from 'fs'
import path from 'path'

export interface PageContent {
  pageNumber: number
  text: string
}

export interface Chunk {
  pageNumber: number
  content: string
}

/**
 * Extract text from a PDF file, grouped by page.
 * Uses pdf-parse — returns an array of { pageNumber, text } objects.
 */
export async function extractPdfPages(filePath: string): Promise<PageContent[]> {
  // Dynamic import to avoid issues with Next.js bundling
  const pdfParse = (await import('pdf-parse')).default
  const buffer = fs.readFileSync(filePath)

  const pages: PageContent[] = []
  let currentPage = 0

  await pdfParse(buffer, {
    pagerender: async (pageData: { getTextContent: () => Promise<{ items: Array<{ str: string }> }> }) => {
      currentPage++
      const textContent = await pageData.getTextContent()
      const text = textContent.items.map((item) => item.str).join(' ')
      pages.push({ pageNumber: currentPage, text: text.trim() })
      return text
    },
  })

  // Fallback: if pagerender didn't populate (some pdf-parse versions), use full text
  if (pages.length === 0) {
    const result = await pdfParse(buffer)
    const fullText = result.text
    const pageCount = result.numpages

    // Split text roughly by page count as a fallback
    const charsPerPage = Math.ceil(fullText.length / pageCount)
    for (let i = 0; i < pageCount; i++) {
      pages.push({
        pageNumber: i + 1,
        text: fullText.slice(i * charsPerPage, (i + 1) * charsPerPage).trim(),
      })
    }
  }

  return pages.filter((p) => p.text.length > 0)
}

/**
 * Get total page count from a PDF.
 */
export async function getPdfPageCount(filePath: string): Promise<number> {
  const pdfParse = (await import('pdf-parse')).default
  const buffer = fs.readFileSync(filePath)
  const result = await pdfParse(buffer)
  return result.numpages
}

/**
 * Split text into overlapping chunks by approximate token count.
 * 1 token ≈ 4 characters (rough approximation).
 */
export function chunkText(
  text: string,
  pageNumber: number,
  maxTokens = 512,
  overlapTokens = 50
): Chunk[] {
  const CHARS_PER_TOKEN = 4
  const maxChars = maxTokens * CHARS_PER_TOKEN
  const overlapChars = overlapTokens * CHARS_PER_TOKEN

  if (text.length <= maxChars) {
    return [{ pageNumber, content: text }]
  }

  const chunks: Chunk[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + maxChars, text.length)
    const chunk = text.slice(start, end).trim()

    if (chunk.length > 0) {
      chunks.push({ pageNumber, content: chunk })
    }

    if (end >= text.length) break
    start = end - overlapChars
  }

  return chunks
}

/**
 * Process all pages of a PDF into chunks.
 */
export function pagesIntoChunks(pages: PageContent[]): Chunk[] {
  const chunks: Chunk[] = []

  for (const page of pages) {
    if (page.text.trim().length < 20) continue // Skip near-empty pages
    const pageChunks = chunkText(page.text, page.pageNumber)
    chunks.push(...pageChunks)
  }

  return chunks
}

/**
 * Save an uploaded file buffer to disk and return the saved path.
 */
export async function saveUploadedFile(
  buffer: Buffer,
  originalName: string,
  uploadDir: string
): Promise<string> {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const timestamp = Date.now()
  const safeFilename = `${timestamp}-${originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const filePath = path.join(uploadDir, safeFilename)
  fs.writeFileSync(filePath, buffer)
  return filePath
}

/**
 * Delete a file from disk silently.
 */
export function deleteFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  } catch {
    // Ignore deletion errors
  }
}
