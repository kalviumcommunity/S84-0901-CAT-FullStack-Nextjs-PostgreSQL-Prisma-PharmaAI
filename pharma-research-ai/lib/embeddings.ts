/**
 * Embeddings via Google Gemini API — gemini-embedding-001
 *
 * - Free tier on Google AI Studio: https://aistudio.google.com/apikey
 * - Output dimensions: 3072
 * - Uses X-goog-api-key header
 *
 * Set GEMINI_API_KEY in .env.local
 */

const EMBED_MODEL = 'gemini-embedding-001'
const EMBED_DIMS = 3072
const MAX_CHARS = 8000

export const EMBEDDING_DIMENSIONS = EMBED_DIMS

export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set in environment variables.')

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      model: `models/${EMBED_MODEL}`,
      content: {
        parts: [{ text: text.slice(0, MAX_CHARS) }],
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini embedding error: ${response.status} — ${error}`)
  }

  const data = await response.json()
  return data.embedding.values as number[]
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  // Process in batches of 10 to stay within rate limits
  const BATCH_SIZE = 10
  const results: number[][] = []

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)
    const embeddings = await Promise.all(batch.map(generateEmbedding))
    results.push(...embeddings)

    // Small delay between batches to avoid 429s
    if (i + BATCH_SIZE < texts.length) {
      await new Promise((r) => setTimeout(r, 200))
    }
  }

  return results
}
