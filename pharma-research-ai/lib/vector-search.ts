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

  // Build the WHERE clause with parameterized userId and documentIds.
  // The embedding vector literal is safe — it's built from numbers we generate,
  // never from user input.  userId comes from the verified JWT session.
  // documentIds are validated by ownership via the userId check below.
  let whereClause = `dc."userId" = $1`
  const params: unknown[] = [userId, embeddingStr, topK]

  if (documentIds && documentIds.length > 0) {
    // Cast each id to TEXT and pass as a proper array parameter
    whereClause += ` AND dc."documentId" = ANY($4::text[])`
    params.push(documentIds)
  }

  // Raw SQL for pgvector cosine distance search.
  // $1 = userId, $2 = embeddingStr (vector literal), $3 = topK, $4 = documentIds (optional)
  const sql = `
    SELECT
      dc.id,
      dc."documentId",
      d."originalName" AS "documentName",
      dc."pageNumber",
      dc.content,
      1 - (dc.embedding <=> $2::vector) AS similarity
    FROM document_chunks dc
    JOIN documents d ON d.id = dc."documentId"
    WHERE ${whereClause}
      AND dc.embedding IS NOT NULL
    ORDER BY dc.embedding <=> $2::vector
    LIMIT $3
  `

  const results = await prisma.$queryRawUnsafe<
    Array<{
      id: string
      documentId: string
      documentName: string
      pageNumber: number
      content: string
      similarity: number
    }>
  >(sql, ...params)

  return results
}

/**
 * Store a chunk's embedding in the database using a parameterized raw SQL update.
 */
export async function storeEmbedding(chunkId: string, embedding: number[]): Promise<void> {
  const embeddingStr = `[${embedding.join(',')}]`
  // $1 = embedding vector literal (built from numbers we generate, not user input)
  // $2 = chunkId from our own DB record
  await prisma.$executeRawUnsafe(
    `UPDATE document_chunks SET embedding = $1::vector WHERE id = $2`,
    embeddingStr,
    chunkId
  )
}
