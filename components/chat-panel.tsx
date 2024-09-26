import classTypes from '@/public/data/classTypes'
import VocabularyList from './vocabulary-list'
import { useEffect, useState } from 'react'
import { Cross2Icon, PaperPlaneIcon, PlusIcon } from '@radix-ui/react-icons'
import Message from './message'
import { Button } from '@/components/ui/button'
import { Textarea } from './ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRef } from 'react'
import { useActions, useUIState } from 'ai/rsc'
import { useChat } from 'ai/react'

export interface ChatPanelProps {
  append: (value: any) => void
  setIsChatOpen: (value: boolean) => void
  messages: any[]
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  selectedClass: string
  input: string
  setMessages: (value: any) => void
  handleTextareaChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  textareaRef: React.RefObject<HTMLTextAreaElement>
  setInput: (value: string) => void
  playText: ({ text }: { text: string }) => void
  setIsRecordingChat: any
}
const AttachButton = () => (
  <Button variant="outline" size="icon" disabled>
    <PlusIcon className="dark:text-white" />
  </Button>
)
const SubmitButton = () => (
  <Button variant="outline" size="icon" type="submit">
    <PaperPlaneIcon className="dark:text-white" />
  </Button>
)
const ChatInput = ({
  onSubmit,
  input,
  handleTextareaChange,
  textareaRef
}: {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  input: string
  handleTextareaChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  textareaRef: React.RefObject<HTMLTextAreaElement>
}) => (
  <form
    onSubmit={onSubmit}
    className="flex gap-2 items-end justify-end p-2 border-t border-gray-200 dark:border-gray-700"
  >
    <AttachButton />
    <Textarea
      style={{ resize: 'none' }}
      className="dark:bg-primary dark:text-primary-foreground max-h-16 leading-5 overflow-y-auto"
      name="prompt"
      value={input} // Always keep the input updated
      onChange={handleTextareaChange}
            onKeyDown={e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          e.currentTarget.form?.dispatchEvent(
            new Event('submit', { cancelable: true, bubbles: true })
          )
        }
      }}
      ref={textareaRef} // Attach ref to the T
      rows={1}
      placeholder="Type or dictate a message"
    />
    <SubmitButton />
  </form>
)
const Chatheader = ({
  setIsChatOpen
}: {
  setIsChatOpen: (value: boolean) => void
}) => (
  <div className="flex flex-row justify-between border-b border-gray-200 dark:border-gray-700 p-2">
    <div className="flex items-center">
      <Avatar>
        <AvatarImage src={`/images/clara.png`} alt="Clara" />
        <AvatarFallback>Clara</AvatarFallback>
      </Avatar>
      <span className="ml-2 text-lg font-semibold dark:text-white text-black">
        Clara
      </span>
    </div>
    <Button variant="ghost" onClick={() => setIsChatOpen(false)} size={'icon'}>
      <Cross2Icon className="size-4" />
    </Button>
  </div>
)

const MessageList = ({
  messages,
  onStartRecording,
  onStopRecording,
  isRecording
}: {
  messages: Object[]
  onStartRecording: Function
  onStopRecording: Function
  isRecording: boolean
}) => {
  // scroll to bottom on new message
  useEffect(() => {
    const chatPanel = document.querySelector('#message-list')
    chatPanel?.scrollTo(0, chatPanel.scrollHeight)
  }, [messages])
  return (
    <div
      className="flex flex-col gap-1 p-2 overflow-auto grow"
      id="message-list"
    >
      {messages.map((message: any, index: number) =>
        index > 0 ? (
          <Message
            key={index}
            message={message}
            onStartRecording={onStartRecording}
            onStopRecording={onStopRecording}
            isRecording={isRecording}
          />
        ) : null
      )}
    </div>
  )
}
export function ChatPanel({
  append,
  setIsChatOpen,
  messages,
  onSubmit,
  selectedClass,
  input,
  setMessages,
  handleTextareaChange,
  textareaRef,
  playText,
  setIsRecordingChat
}: ChatPanelProps) {
  const [saidWords, setSaidWords] = useState<string[]>([])
  const { submitUserMessage } = useActions()
  // New state for recording
  const [isRecording, setIsRecording] = useState(false)
  const [expectedText, setExpectedText] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Function to start recording
  // Function to start recording
  const handleStartRecording = async (textToPronounce: string) => {
    setIsRecording(true)
    setIsRecordingChat(true)
    setExpectedText(textToPronounce)
    audioChunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Determine supported mime type
      const getSupportedMimeType = () => {
        const possibleTypes = [
          'audio/webm;codecs=opus',
          'audio/ogg;codecs=opus',
          'audio/webm',
          'audio/ogg'
        ]
        for (const mimeType of possibleTypes) {
          if (MediaRecorder.isTypeSupported(mimeType)) {
            return mimeType
          }
        }
        return ''
      }

      const options = { mimeType: getSupportedMimeType() }
      mediaRecorderRef.current = new MediaRecorder(stream, options)

      mediaRecorderRef.current.ondataavailable = event => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false)
        setIsRecordingChat(false)
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop())

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorderRef.current!.mimeType
        })

        // Determine file extension based on mime type
        const mimeType = mediaRecorderRef.current!.mimeType
        let extension = 'webm'
        if (mimeType.includes('ogg')) {
          extension = 'ogg'
        } else if (mimeType.includes('wav')) {
          extension = 'wav'
        }

        const audioFile = new File([audioBlob], `recording.${extension}`, {
          type: mimeType
        })
        const evaluationResult = await evaluateAudio(audioFile, textToPronounce)

        append({
          role: 'user',
          content: `${evaluationResult.coloredText} \n Accuracy: ${evaluationResult.accuracyScore} `
        })
      }

      mediaRecorderRef.current.start()
    } catch (error) {
      console.error('Error accessing microphone:', error)
      setIsRecording(false)
    }
  }

  // Function to stop recording
  const handleStopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop()
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  // Function to evaluate audio
  const evaluateAudio = async (file: File, transcription: string) => {
    const apiUrl =
      'https://hjngsvyig3.execute-api.us-west-1.amazonaws.com/production/audioEval'

    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', transcription)
    formData.append('transcription', transcription)
    formData.append('language', 'en')

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const realTranscript = data.real_transcripts
      const letterCorrectnessRaw = data.is_letter_correct_all_words
      const letterCorrectness = data.is_letter_correct_all_words
        .trim()
        .split(' ')
      const letterCorrectnessArray = letterCorrectness
      const words = realTranscript.split(' ')
      if (words.length > letterCorrectnessArray.length) {
        const difference = words.length - letterCorrectnessArray.length
        for (let i = 0; i < difference; i++) {
          letterCorrectnessArray.unshift('')
        }
      }
      const pronunciationAccuracy = data.pronunciation_accuracy

      // Generate colored transcript based on the correctness
      let coloredText = ''
      for (let i = 0; i < words.length; i++) {
        const word = words[i]
        const correctness = letterCorrectnessArray[i] || ''
        for (let j = 0; j < word.length; j++) {
          const letter = word[j]
          if (correctness && correctness[j] !== undefined) {
            const isCorrect = correctness[j] === '1'
            coloredText += isCorrect
              ? `<span style="color: lightgreen">${letter}</span>`
              : `<span style="color: lightcoral">${letter}</span>`
          } else {
            // If there's no correctness data, display the letter in default color
            coloredText += `<span>${letter}</span>`
          }
        }
        coloredText += ' ' // Add space between words
      }
      return {
        accuracyScore: pronunciationAccuracy,
        coloredText,
        realTranscript,
        letterCorrectnessRaw
      }
    } catch (error) {
      console.error('Error during API request:', error)
      return {
        accuracyScore: 0,
        coloredText: 'Error evaluating pronunciation.'
      }
    }
  }
  const normalizeWord = (word: string) => {
    return word
      .replace(/\s*\(.*?\)\s*/g, '')
      .trim()
      .toLowerCase()
  }

  useEffect(() => {
    // Helper function to find new terms in text
    function findNewTermsInText(
      termsArray: string[],
      userText: string,
      existingTerms: string | any[]
    ) {
      const normalizedTerms = termsArray.map(normalizeWord)
      return normalizedTerms.filter((term: any) => {
        const termRegex = new RegExp(`\\b${term}\\b`, 'i') // Match whole words
        return termRegex.test(userText) && !existingTerms.includes(term)
      })
    }

    // Your main function or useEffect where this code runs
    // ...

    // Filter user messages to only those from the user
    const userMessages = messages.filter(m => m.role === 'user')

    // Concatenate all user messages into a single string
    const userText = userMessages
      .map(m => normalizeWord(m.content))
      .join(' ')
      .toLowerCase()

    // Get the selected class type
    const classType = classTypes.find(ct => ct.id === selectedClass)

    if (!classType) {
      return
    }

    const { vocabulary, vocabularyPlurals } = classType

    // Initialize an array to hold new words found
    let newWords: string[] = []

    // Find new vocabulary terms in user text
    if (vocabulary) {
      const vocabularyMatches = findNewTermsInText(
        vocabulary,
        userText,
        saidWords
      )
      newWords = [...newWords, ...vocabularyMatches]
    }

    // Find new vocabulary plurals in user text
    if (vocabularyPlurals) {
      const pluralsMatches = findNewTermsInText(
        vocabularyPlurals,
        userText,
        saidWords
      )

      // Map plurals back to their singular forms
      const normalizedVocabulary = vocabulary.map(normalizeWord)
      const normalizedVocabularyPlurals = vocabularyPlurals.map(normalizeWord)

      pluralsMatches.forEach(pluralTerm => {
        const index = normalizedVocabularyPlurals.indexOf(pluralTerm)
        if (index !== -1) {
          const singularTerm = normalizedVocabulary[index]
          if (!saidWords.includes(singularTerm)) {
            newWords.push(singularTerm)
          }
        }
      })
    }

    // Update the saidWords state with any new terms found
    if (newWords.length > 0) {
      setSaidWords(prevSaidWords => [...prevSaidWords, ...newWords])
    }
  }, [messages, classTypes, selectedClass])
  return (
    <div className="flex flex-col justify-between width-full rounded-lg shadow-lg max-w-2xl h-full">
      <Chatheader setIsChatOpen={setIsChatOpen} />
      <MessageList
        messages={messages}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        isRecording={isRecording}
      />
      <div>
        <ChatInput
          onSubmit={onSubmit}
          input={input}
          handleTextareaChange={handleTextareaChange}
          textareaRef={textareaRef}
        />
        <VocabularyList
          selectedClass={selectedClass}
          saidWords={saidWords}
          playText={playText}
        />
      </div>
    </div>
  )
}
