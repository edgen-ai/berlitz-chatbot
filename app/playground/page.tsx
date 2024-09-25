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
export default function Playground() {
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
    model: z.enum(['gpt2', 'gpt3', 'gpt4']),
    temperature: z.number(),
    maxTokens: z.number()
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: 'gpt2',
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
        maxTokens: form.getValues('maxTokens').toString()
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
      <h1 className="text-3xl font-bold">Playground</h1>
      <p>This is a playground for testing our models.</p>
      <div className="flex size-full items-stretch gap-4">
        <div className="flex flex-col w-1/3">
          <h2 className="text-2xl font-bold">Settings</h2>
          <SettingsForm form={form} onSubmit={onSubmit} />
        </div>
        <div className="flex flex-col w-2/3">
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
