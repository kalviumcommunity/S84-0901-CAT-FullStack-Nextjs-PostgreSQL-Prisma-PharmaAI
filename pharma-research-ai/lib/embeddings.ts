/**
 * Embeddings using Groq's available text embedding via the API.
 * We use the Groq API with the 'nomic-embed-text-v1.5' model for embeddings.
 * Dimensions: 768
 *
 * Note: Update the vector dimension in migration.sql if changing model.
 * nomic-embed-text-v1.5 => 768 dims
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY
const EMBED_MODEL = 'nomic-embed-text-v1.5'
const EMBED_DIMS = 768

export const EMBEDDING_DIMENSIONS = EMBED_DIMS

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY is required')

  const response = await fetch('https://api.groq.com/openai/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: EMBED_MODEL,
      input: text.slice(0, 8000), // Groq embedding token limit
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Groq embedding error: ${response.status} — ${error}`)
  }

  const data = await response.json()
  return data.data[0].embedding as number[]
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  // Process in batches of 10 to avoid rate limits
  const BATCH_SIZE = 10
  const results: number[][] = []

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)
    const embeddings = await Promise.all(batch.map(generateEmbedding))
    results.push(...embeddings)

    // Small delay between batches
    if (i + BATCH_SIZE < texts.length) {
      await new Promise((r) => setTimeout(r, 200))
    }
  }

  return results
}
