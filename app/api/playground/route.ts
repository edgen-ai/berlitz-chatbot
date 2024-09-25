import { createOpenAI } from '@ai-sdk/openai'
import { CoreMessage, streamText } from 'ai'

export async function POST(req: Request, res: Response) {
  const {
    prompt,
    sysPrompt,
    temperature,
    maxTokens,
    seed
  }: {
    prompt: string
    sysPrompt: string
    temperature: string
    maxTokens: string
    seed: string
  } = await req.json()
  const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY
  })
  console.log('Prompt', prompt)
  console.log('SysPrompt', sysPrompt)
  console.log('Temperature', temperature)
  console.log('MaxTokens', maxTokens)
  console.log('Seed', seed)
  const result = await streamText({
    model: groq('llama3-8b-8192'),
    system: sysPrompt,
    prompt,
    temperature: parseInt(temperature),
    maxTokens: parseInt(maxTokens),

    ...(seed ? { seed: parseInt(seed) } : {})
  })

  return result.toDataStreamResponse({ sendUsage: true })
}
