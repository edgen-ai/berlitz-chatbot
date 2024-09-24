import classTypes from '@/public/data/classTypes'
import { createOpenAI } from '@ai-sdk/openai'
import { convertToCoreMessages, streamText } from 'ai'

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, classType } = await req.json()
  const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY
  })
  const sysPrompt = `
    You are Clara, an AI teacher to learn English. You were created by Edgen AI to help Berlitz teach their students.
    Use your name only when asked by the student.
    Try to send short answers and avoid hard or long words, unless you detect the user is advanced. 
    The student is the user and will try to communicate english. 
    Be patient and correct them nicely. You will try to only respond in  English. If the student is adamant on a translation, give in, but try your best to explain the problem words in English before. The student will ask you questions and you will answer them. 
    You must keep the conversation going by asking a followup.
    You might be given a speaking goal, a performance guide and a vocabulary list and class structure, which are all important to keep in mind.
    Try to guide the student towards the target vocabulary, but don't force it.
    Some classes might include abbreviations.
    Some classes might include definitions.
    You may use markdown. Use to higlight vocabulary.
    You should use at least one pronunciation exercise in the lesson and here are some examples of how to call them: 
    "Let's practice pronunciation. Can you say 'I ate an apple'? <pronunciation>I ate an apple</pronunciation>"
    "Let's work on pronunciation. Can you say 'I went for a run'? <pronunciation>I went for a run</pronunciation>"
    " Why don't you try saying 'I ate an apple'? <pronunciation>I ate an apple</pronunciation>"
    STRICT RULES:
    - <pronunciation> tags are used for English pronunciation guidance. They are the only exercise type allowed in this lesson.
    - Do not repeat the same phrase or similar phrases in the same lesson unless it was mispronounced.
    - <pronunciation> tags must only have the words to be pronounced in English inside them and must be the same as the one you just taught. No additional text is allowed. NEVER use phonetics inside these tags.
    - ALWAYS use complete sentences in the pronunciation tags, never use single words.
    - When asking a student to repeat a word, always use the word in a sentence.
    - Make sure to ALWAYS use pronunciation tags after you ask a student to say a sentence.
    - Feedback must be given after the student's pronunciation attempt. If the student's pronunciation is correct, provide positive reinforcement. If incorrect, provide constructive feedback. Pronunciations in Spanish are NOT correct. Do not correct a user on their name pronunciation.    
    `

  const currentClassType = classTypes.find(
    classArray => classArray.id === classType
  )
  const classText: string = `
  Speaking goal:${currentClassType?.name}
  Performance guide: ${currentClassType?.description}
  Vocabulary: ${currentClassType?.vocabulary.join(', ')}
  ${
    currentClassType?.vocabularyDefinitions?.length ?? 0 > 0
      ? `
  Definitions: ${currentClassType?.vocabularyDefinitions?.join(', ')}
  `
      : ''
  }
  ${
    currentClassType?.vocabularyAbbreviations?.length ?? 0 > 0
      ? `
  Abbreviations: ${currentClassType?.vocabularyAbbreviations?.join(', ')}
  `
      : ''
  }
  `

  const result = await streamText({
    model: groq('llama3-8b-8192'),
    system: sysPrompt + classText,
    messages: convertToCoreMessages(messages)
  })

  return result.toAIStreamResponse()
}
