import { prisma } from './prisma'
import { generateEmbedding } from './embeddings'

export interface SearchResult {
  id: string
  documentId: string
  documentName: string
  pageNumber: number
  content: string
  similarity: number
}

/**
 * Search for the most relevant document chunks using cosine similarity.
 * Uses pgvector's <=> operator (cosine distance).
 *
 * @param query - The user's question
 * @param userId - Restrict search to this user's documents
 * @param documentIds - Optional filter to specific documents
 * @param topK - Number of results to return
 */
export async function searchChunks(
  query: string,
  userId: string,
  documentIds?: string[],
  topK = 5
): Promise<SearchResult[]> {
  const embedding = await generateEmbedding(query)
  const embeddingStr = `[${embedding.join(',')}]`

  // Build the WHERE clause
  let whereClause = `dc."userId" = '${userId}'`
  if (documentIds && documentIds.length > 0) {
    const ids = documentIds.map((id) => `'${id}'`).join(',')
    whereClause += ` AND dc."documentId" IN (${ids})`
  }

  // Raw SQL for pgvector cosine distance search
  const results = await prisma.$queryRawUnsafe<
    Array<{
      id: string
      documentId: string
      documentName: string
      pageNumber: number
      content: string
      similarity: number
    }>
  >(`
    SELECT
      dc.id,
      dc."documentId",
      d."originalName" AS "documentName",
      dc."pageNumber",
      dc.content,
      1 - (dc.embedding <=> '${embeddingStr}'::vector) AS similarity
    FROM document_chunks dc
    JOIN documents d ON d.id = dc."documentId"
    WHERE ${whereClause}
      AND dc.embedding IS NOT NULL
    ORDER BY dc.embedding <=> '${embeddingStr}'::vector
    LIMIT ${topK}
  `)

  return results
}

/**
 * Store a chunk's embedding in the database using a raw SQL update.
 */
export async function storeEmbedding(chunkId: string, embedding: number[]): Promise<void> {
  const embeddingStr = `[${embedding.join(',')}]`
  await prisma.$executeRawUnsafe(
    `UPDATE document_chunks SET embedding = '${embeddingStr}'::vector WHERE id = '${chunkId}'`
  )
}
