import { createOpenAI } from '@ai-sdk/openai'
import { CoreMessage, streamText } from 'ai'

export async function POST(req: Request, res: Response) {
  const {
    prompt,
    sysPrompt,
    data
  }: {
    prompt: string
    sysPrompt: string
    data: {
      temperature: number
      maxTokens: number
    }
  } = await req.json()
  console.log('Data', prompt)
  const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY
  })
  const result = await streamText({
    model: groq('llama3-8b-8192'),
    system: sysPrompt,
    prompt,
    temperature: data.temperature,
    maxTokens: data.maxTokens
  })

  return result.toDataStreamResponse()
}
