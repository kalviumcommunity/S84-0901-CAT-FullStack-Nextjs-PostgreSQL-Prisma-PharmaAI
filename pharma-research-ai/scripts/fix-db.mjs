import pg from 'pg'

const { Client } = pg

const client = new Client({
  connectionString: process.env.DATABASE_URL,
})

await client.connect()

// Resize embedding column to match gemini-embedding-001 (3072 dims)
await client.query('ALTER TABLE document_chunks DROP COLUMN IF EXISTS embedding')
await client.query('ALTER TABLE document_chunks ADD COLUMN embedding vector(3072)')

// Clear any documents stuck in PROCESSING from previous failed attempts
const stuck = await client.query(
  "UPDATE documents SET status = 'FAILED' WHERE status = 'PROCESSING' RETURNING id, \"originalName\""
)
if (stuck.rowCount > 0) {
  console.log(`Marked ${stuck.rowCount} stuck document(s) as FAILED:`)
  stuck.rows.forEach((r) => console.log(` - ${r.originalName} (${r.id})`))
} else {
  console.log('No stuck documents found.')
}

console.log('Done: document_chunks.embedding is now vector(3072)')
await client.end()
