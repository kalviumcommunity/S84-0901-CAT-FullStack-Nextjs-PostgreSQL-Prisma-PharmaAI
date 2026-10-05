import Groq from 'groq-sdk'

const SYSTEM_INSTRUCTION =
  'You are PharmaResearch AI, a helpful, knowledgeable assistant for pharmaceutical researchers. ' +
  'Answer questions clearly, accurately, and concisely. ' +
  'Never provide medical diagnoses, prescriptions, or personalized treatment recommendations. ' +
  'Always remind users that your responses do not replace professional medical, clinical, or scientific judgment.'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const GROQ_MODELS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
]

/**
 * Generate chat response using Groq (fast, no RAG complexity)
 * with graceful fallback to Gemini if needed.
 */
export async function generateChatResponse(
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY

  if (groqKey) {
    try {
      const groq = new Groq({ apiKey: groqKey })
      const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        ...history.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user', content: userMessage.trim() },
      ]

      for (const model of GROQ_MODELS) {
        try {
          const completion = await groq.chat.completions.create({
            model,
            messages,
            temperature: 0.7,
            max_tokens: 1024,
          })

          const answer = completion.choices[0]?.message?.content
          if (answer) return answer
        } catch (err) {
          console.warn(`[Groq] Model ${model} failed, trying next:`, err)
        }
      }
    } catch (err) {
      console.warn('[Groq] Chat failed, trying Gemini fallback:', err)
    }
  }

  // Fallback to Gemini if Groq is unavailable
  const geminiKey = process.env.GEMINI_API_KEY
  if (geminiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`
    const contents = [
      ...history.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
      { role: 'user', parts: [{ text: userMessage.trim() }] },
    ]

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': geminiKey,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    })

    if (response.ok) {
      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) return text
    }
  }

  throw new Error('No AI provider available. Please check GROQ_API_KEY or GEMINI_API_KEY in .env.')
}
