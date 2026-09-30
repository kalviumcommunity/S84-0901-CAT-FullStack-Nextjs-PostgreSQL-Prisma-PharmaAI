import Groq from 'groq-sdk'
import type { SearchResult } from './vector-search'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `You are PharmaResearch AI, an evidence-grounded research assistant for pharmaceutical documents.

Your role:
- Answer questions based ONLY on the provided document passages.
- Be concise and accurate.
- If the evidence is insufficient or the answer cannot be found in the passages, say so clearly.
- Never provide medical diagnoses, prescriptions, or treatment recommendations.
- Always ground your answer in the specific passages provided.

IMPORTANT DISCLAIMER: PharmaResearch AI provides document-grounded research assistance and does not replace professional medical, clinical, regulatory, or scientific judgment.`

export interface ChatResponse {
  answer: string
  conversationId: string
}

/**
 * Generate a RAG answer using Groq LLM with retrieved context.
 */
export async function generateAnswer(
  question: string,
  context: SearchResult[]
): Promise<string> {
  if (context.length === 0) {
    return 'I could not find relevant information in your uploaded documents to answer this question. Please ensure relevant documents are uploaded and processed.'
  }

  const contextText = context
    .map(
      (chunk, i) =>
        `[Source ${i + 1}] ${chunk.documentName} — Page ${chunk.pageNumber}\n${chunk.content}`
    )
    .join('\n\n---\n\n')

  const userMessage = `Based on the following document passages, answer this question:

Question: ${question}

Document Passages:
${contextText}

Provide a clear, accurate answer based only on the passages above. At the end, briefly note which sources support your answer.`

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.1,
    max_tokens: 1024,
  })

  return completion.choices[0]?.message?.content ?? 'No response generated.'
}
