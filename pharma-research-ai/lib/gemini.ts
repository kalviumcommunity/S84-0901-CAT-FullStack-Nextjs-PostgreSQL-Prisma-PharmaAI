/**
 * Simple Gemini chat — sends a message and returns the text response.
 * Uses gemini-2.0-flash via the generativelanguage REST API.
 */

const MODEL = 'gemini-3.8-flash'

const SYSTEM_INSTRUCTION =
  'You are PharmaResearch AI, a helpful assistant for pharmaceutical researchers. ' +
  'Answer questions clearly and concisely. ' +
  'Never provide medical diagnoses, prescriptions, or treatment recommendations. ' +
  'Always remind users that your responses do not replace professional medical, clinical, or scientific judgment.'

export interface GeminiMessage {
  role: 'user' | 'model'
  parts: { text: string }[]
}

export async function chat(
  history: GeminiMessage[],
  userMessage: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set.')

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

  const body = {
    system_instruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    contents: [
      ...history,
      { role: 'user', parts: [{ text: userMessage }] },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Gemini error: ${response.status} — ${err}`)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response generated.'
}
