/**
 * Gemini chat client — uses Gemini REST API with retry & multi-turn history sanitization.
 */

const MODELS = ['gemini-3.8-flash']

const SYSTEM_INSTRUCTION =
  'You are PharmaResearch AI, a helpful assistant for pharmaceutical researchers. ' +
  'Answer questions clearly and concisely. ' +
  'Never provide medical diagnoses, prescriptions, or treatment recommendations. ' +
  'Always remind users that your responses do not replace professional medical, clinical, or scientific judgment.'

export interface GeminiMessage {
  role: 'user' | 'model'
  parts: { text: string }[]
}

function sanitizeContents(history: GeminiMessage[], userMessage: string): GeminiMessage[] {
  const raw: GeminiMessage[] = [
    ...history,
    { role: 'user', parts: [{ text: userMessage.trim() }] },
  ]

  const clean: GeminiMessage[] = []

  for (const msg of raw) {
    const text = msg.parts?.map((p) => p.text).filter(Boolean).join('\n\n').trim()
    if (!text) continue

    if (clean.length > 0 && clean[clean.length - 1].role === msg.role) {
      clean[clean.length - 1].parts[0].text += '\n\n' + text
    } else {
      clean.push({ role: msg.role, parts: [{ text }] })
    }
  }

  while (clean.length > 0 && clean[0].role !== 'user') {
    clean.shift()
  }

  if (clean.length === 0) {
    clean.push({ role: 'user', parts: [{ text: userMessage.trim() }] })
  }

  return clean
}

export async function chat(
  history: GeminiMessage[],
  userMessage: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set in environment variables.')

  const contents = sanitizeContents(history, userMessage)

  const body = {
    system_instruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  }

  let lastError: Error | null = null

  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

    // Retry up to 3 times for temporary 503/429 spikes
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey,
          },
          body: JSON.stringify(body),
        })

        if (response.ok) {
          const data = await response.json()
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) return text
        }

        const errText = await response.text()
        const isTemporary = response.status === 503 || response.status === 429 || response.status === 500

        if (isTemporary && attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000))
          continue
        }

        lastError = new Error(`Gemini error (${model}): ${response.status} — ${errText}`)
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err))
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000))
          continue
        }
      }
    }
  }

  throw lastError ?? new Error('Failed to get response from AI service.')
}
