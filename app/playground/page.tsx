'use client'
import { Textarea } from '@/components/ui/textarea'
import { useCompletion } from 'ai/react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import SettingsForm from './settings_form'
import { useEffect, useState } from 'react'
import OutputList from './output_list'
import LoadingCard from './loading_card'
import ApiKeyDialog from './api_key_dialog'
import { Dialog } from '@/components/ui/dialog'
import { AlertDialogTrigger } from '@/components/ui/alert-dialog'

export default function Playground() {
  const [apiKey, setApiKey] = useState<string>('')
  const [completions, setCompletions] = useState<
    {
      content: string
      startTimestamp: number
      endTimestamp: number
      input: string
    }[]
  >([])
  const [startTimestamp, setStartTimestamp] = useState<number>(Date.now())
  const [askedInput, setAskedInput] = useState<string>('')
  const formSchema = z.object({
    model: z.enum(['ruby', 'emerald', 'diamond']),
    temperature: z.number(),
    maxTokens: z.number(),
    seed: z.number().optional(),
    sysPrompt: z.string().optional()
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: 'ruby',
      temperature: 0.7,
      maxTokens: 500
    }
  })
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data)
  }
  const { completion, input, setInput, handleSubmit, isLoading } =
    useCompletion({
      body: {
        temperature: form.getValues('temperature').toString(),
        maxTokens: form.getValues('maxTokens').toString(),
        seed: form.getValues('seed')?.toString(),
        sysPrompt: form.getValues('sysPrompt')?.toString()
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`
      },
      api: '/api/playground'
    })
  useEffect(() => {
    if (isLoading) {
      setStartTimestamp(Date.now())
    }
    if (completion && !isLoading) {
      const newCompletion = {
        content: completion,
        startTimestamp,
        endTimestamp: Date.now(),
        input: askedInput
      }
      console.log('New completion', newCompletion)
      setCompletions([...completions, newCompletion])
    }
  }, [isLoading])

  return (
    <main className="flex flex-col p-4 size-full">
      <ApiKeyDialog apiKey={apiKey} setApiKey={setApiKey} />
      <h1 className="text-3xl font-bold">Playground</h1>
      <p>This is a playground for testing our models.</p>
      <p className="text-slate-500">Your API key is {apiKey}</p>
      <div className="flex size-full flex-col md:flex-row items-stretch gap-4">
        <div className="flex flex-col w-full md:w-1/3">
          <h2 className="text-2xl font-bold">Settings</h2>
          <SettingsForm form={form} onSubmit={onSubmit} />
        </div>
        <div className="flex flex-col w-full md:w-2/3">
          <h2 className="text-2xl font-bold">Input</h2>
          <Textarea
            className="p-2 border border-gray-300 rounded bg-primary-foreground text-primary-background"
            rows={10}
            placeholder="Enter your text here"
            style={{ resize: 'none' }}
            onChange={(event: { target: { value: any } }) => {
              setInput(event.target.value)
            }}
            value={input}
            onKeyDown={async (event: { key: string }) => {
              if (event.key === 'Enter') {
                setAskedInput(input)
                handleSubmit()
                setInput('')
              }
            }}
          />
          <h2 className="text-2xl font-bold">Output</h2>
          {isLoading ? <LoadingCard /> : null}
          <OutputList completions={completions} />
        </div>
      </div>
    </main>
  )
}
