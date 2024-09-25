'use client'
import 'regenerator-runtime/runtime'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { Message, Session } from '@/lib/types'
import TalkingHeadComponent from '@/components/avatarai/page'
import { useChat } from 'ai/react'
import fetch_and_play_audio from '@/lib/chat/fetch_and_play_audio'
import SpeechRecognition, {
  useSpeechRecognition
} from 'react-speech-recognition'
import classTypes from '@/public/data/classTypes'
import CrazyButtons from './crazy-buttons'
import { useBackground } from '@/lib/hooks/background-context'
import { useClass } from '@/lib/hooks/class-context'
import Backgrounds from '@/public/data/backgrounds'
import { ChatPanel } from './chat-panel'
import { process_script } from '@/lib/api/process_script'
import { Dialog } from '@radix-ui/react-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from './ui/alert-dialog'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  session?: Session
  missingKeys: string[]
}

export function Chat({ id }: ChatProps) {
  const [audioBuffer, setAudioBuffer] = useState<Uint8Array | undefined>(
    undefined
  )
  const [textResponse, setTextResponse] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [localClassType, setLocalClassType] = useState('1')
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [isResponding, setIsResponding] = useState(false)
  const [initialDialogOpen, setInitialDialogOpen] = useState(true)
  const { selectedBackground } = useBackground()
  const { selectedClass } = useClass()

  // https://sdk.vercel.ai/docs/reference/ai-sdk-ui/use-chat
  let {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    append
  } = useChat({
    body: {
      classType: selectedClass || localClassType || '1'
    }
  })

  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
    listening
  } = useSpeechRecognition()

  const lastAiMessageRef = useRef<Message | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null) // Ref for the textarea

  useEffect(() => {
    if (messages.length === 0 && !initialDialogOpen) {
      append({ role: 'user', content: "Hello, let's start the class!" })
    }
  }, [append, messages, initialDialogOpen])

  useEffect(() => {
    setLocalClassType(selectedClass)
  }, [selectedClass])
  useEffect(() => {
    setInput(transcript)
  }, [transcript])
  useEffect(() => {
    setMessages([])
    setInput('')
  }, [localClassType])
  useEffect(() => {
    console.log('running lsistener')
    if (!browserSupportsSpeechRecognition) {
      console.error('Browser does not support speech recognition.')
      return
    }

    if (!isResponding) {
      // Start listening for speech immediately when the component mounts
      SpeechRecognition.startListening({ continuous: true, language: 'en-US' })
      console.log('Listening for speech...')
    }

    if (isResponding) {
      SpeechRecognition.stopListening() // Clean up on unmount or when editing starts
      console.log('Stopped listening for speech.')
    }

    return () => {
      SpeechRecognition.stopListening() // Clean up on unmount or when editing starts
      console.log('Stopped listening for speech.')
    }
  }, [isResponding, isEditing, browserSupportsSpeechRecognition])
  const cleanup_markdown_from_text = ({
    markdownText
  }: {
    markdownText: string
  }) => {
    let cleanText = markdownText

    // Remove code blocks and inline code
    cleanText = cleanText.replace(/`{3}[\s\S]+?`{3}/g, '') // Code blocks
    cleanText = cleanText.replace(/`[^`]+`/g, '') // Inline code

    // Remove images and links
    cleanText = cleanText.replace(/!\[.*?\]\(.*?\)/g, '') // Images
    cleanText = cleanText.replace(/\[.*?\]\(.*?\)/g, '') // Links

    // Remove bold, italic, and strikethrough formatting
    cleanText = cleanText.replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    cleanText = cleanText.replace(/\*([^*]+)\*/g, '$1') // Italic
    cleanText = cleanText.replace(/~~([^~]+)~~/g, '$1') // Strikethrough

    // Remove headers
    cleanText = cleanText.replace(/^#{1,6}\s+/gm, '')

    // Remove blockquotes
    cleanText = cleanText.replace(/^>\s+/gm, '')

    // Remove horizontal rules
    cleanText = cleanText.replace(/^---+/gm, '')

    // Remove remaining Markdown symbols (bullets, etc.)
    cleanText = cleanText.replace(/^\s*[-*+]\s+/gm, '')

    return cleanText.trim()
  }
  const get_each_sentence = (phrase: string) => {
    const endOfSentenceRegex = /([^\.\?\!]+[\.\?\!]+)/g;
    const sentences = phrase.match(endOfSentenceRegex) || [];
  
    // Calculate word counts for each sentence
    const wordCounts = sentences.map(sentence => sentence.trim().split(/\s+/).length);
  
    const chunks: string[] = [];
    let currentChunkSentences: string[] = [];
    let currentChunkWordCount = 0;
    let prevChunkWordCount = 0;
  
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const wordCount = wordCounts[i];
  
      currentChunkSentences.push(sentence);
      currentChunkWordCount += wordCount;
  
      // If current chunk's word count is greater than previous chunk's word count, finalize the chunk
      if (currentChunkWordCount > prevChunkWordCount) {
        const chunk = currentChunkSentences.join(' ').trim();
        chunks.push(chunk);
  
        // Update previous chunk word count
        prevChunkWordCount = currentChunkWordCount;
  
        // Reset current chunk
        currentChunkSentences = [];
        currentChunkWordCount = 0;
      } else {
        // Continue adding sentences to current chunk
        // Note: This may exceed the maximum number of sentences per chunk
      }
    }
  
    // Add any remaining sentences to the last chunk
    if (currentChunkSentences.length > 0) {
      // Ensure the last chunk is larger than the previous one
      if (currentChunkWordCount > prevChunkWordCount) {
        const chunk = currentChunkSentences.join(' ').trim();
        chunks.push(chunk);
      } else {
        // Merge with the previous chunk if it's not larger
        if (chunks.length > 0) {
          chunks[chunks.length - 1] += ' ' + currentChunkSentences.join(' ').trim();
        } else {
          // If there's no previous chunk, just add the current sentences
          chunks.push(currentChunkSentences.join(' ').trim());
        }
      }
    }
  
    return chunks;
  };
  
  

  const extractPronunciationContent = (text: string) => {
    // Regex to match content between <pronunciation> and </pronunciation>, including multiline content
    const pronunciationRegex = /<pronunciation>([\s\S]*?)<\/pronunciation>/g
    const pronunciationMatches = []
    let match

    // Loop through all matches and extract content between the tags
    while ((match = pronunciationRegex.exec(text)) !== null) {
      pronunciationMatches.push(match[1].trim()) // Push the matched content (trimmed) into the array
    }

    // Return the matches or a message if no tags are found
    return pronunciationMatches.length > 0 ? pronunciationMatches : text
  }

  async function playText({ text }: { text: string }) {
    const audiB = await fetch_and_play_audio({
      text: cleanup_markdown_from_text({ markdownText: text })
    })
    setTextResponse(text)
    await setAudioBuffer(audiB as any)
  }
  useEffect(() => {
    async function getAudioAndPlay() {
      if (messages.length === 0) {
        return
      }
      if (messages[messages.length - 1]?.role === 'assistant') {
        const lastMessage = messages[messages.length - 1]


        const { cleanText: clean_script, exercises: pronunciation_exercise } =
          process_script(lastMessage.content)
        console.log(clean_script)
        const sentences = get_each_sentence(clean_script)
        console.log('sentences', sentences)
        if (
          typeof pronunciation_exercise !== 'string' &&
          Array.isArray(pronunciation_exercise) &&
          pronunciation_exercise.length > 0 &&
          pronunciation_exercise[0]?.content
        ) {
           setMessages((messages: any) => [
          ...messages,
          {
            role: 'assistant',
            content: pronunciation_exercise[0]?.content,
            id: 'pronunciation'
          }
        ])
        
      }
        for (const sentence of sentences) {
          const audiB = await fetch_and_play_audio({
            text: cleanup_markdown_from_text({ markdownText: sentence })
          })
          setTextResponse(
            cleanup_markdown_from_text({ markdownText: sentence })
          )
          setAudioBuffer(audiB as any)
        }
      }
    }
    getAudioAndPlay()
  }, [isLoading])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent sending another message while waiting for a response
    if (isResponding) return

    // Call handleSubmit with the updated input state
    handleSubmit()

    // Reset the transcript after submission
    resetTranscript()

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    lastAiMessageRef.current = null // Reset for the next AI message
  }

  useEffect(() => {
    if (textareaRef.current) {
      adjustTextareaHeight() // Adjust height whenever transcript is updated
    }
  }, [transcript, input])

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto' // Reset the height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px` // Adjust based on scroll height
      // Scroll to the bottom of the textarea
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight
    }
  }

  const handleTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setIsEditing(true) // Stop transcription when the user starts typing
    handleInputChange(event) // Allow manual editing of the input
  }
  const ClassTitle = () => (
    <span className="text-md md:text-2xl font-semibold text-center">
      {
        classTypes[classTypes.findIndex(ct => ct.id === selectedClass)]
          ?.description
      }
    </span>
  )

  return (
    <div className="flex flex-col size-full ">
      <AlertDialog open={initialDialogOpen} onOpenChange={setInitialDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Class starting</AlertDialogTitle>
            <AlertDialogDescription>
              You will start{' '}
              {
                classTypes[classTypes.findIndex(ct => ct.id === selectedClass)]
                  ?.description
              }{' '}
              class
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="flex items-start justify-start width-full">
        <ClassTitle />
      </div>
      <div className="flex size-full justify-between flex-col md:flex-row scrollbar-thin scrollbar-thumb-primary-foreground scrollbar-track-primary-darker min-h-0">
        <div className="relative h-1/3 md:h-full md:w-1/2">
          <Image
            src={
              selectedBackground &&
              Backgrounds &&
              Backgrounds.find(bg => bg.id === selectedBackground)
                ? Backgrounds.find(bg => bg.id === selectedBackground)!.src
                : Backgrounds[0].src
            }
            alt="Background"
            layout="fill"
            style={{ objectFit: 'cover', filter: 'blur(2px)' }}
            priority={true}
            className="transition ease-in-out duration-1000"
          />
          <TalkingHeadComponent
            textToSay={textResponse}
            audioToSay={audioBuffer}
            setIsResponding={setIsResponding}
          />
        </div>
        <div className="px-2 max-w-2xl h-2/3 w-full md:w-1/2 md:h-full">
          {isChatOpen ? (
            <ChatPanel
              append={append} 
              setIsChatOpen={setIsChatOpen}
              messages={messages}
              onSubmit={onSubmit}
              selectedClass={selectedClass}
              setInput={setInput}
              input={input}
              handleTextareaChange={handleTextareaChange}
              textareaRef={textareaRef}
              playText={playText}
              setMessages={setMessages}
            />
          ) : (
            <CrazyButtons setIsChatOpen={setIsChatOpen} />
          )}
        </div>
      </div>
    </div>
  )
}
