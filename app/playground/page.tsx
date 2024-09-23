'use client'
import { Textarea } from '@/components/ui/textarea'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import SettingsForm from './settings_form'

export default function Playground() {
  const formSchema = z.object({
    model: z.enum(['gpt2', 'gpt3', 'gpt4']),
    temperature: z.number(),
    maxTokens: z.number(),
    topP: z.number(),
    stream: z.boolean()
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: 'gpt2',
      temperature: 0.7,
      maxTokens: 500,
      topP: 0.8,
      stream: false
    }
  })
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data)
  }

  return (
    <main className="flex flex-col p-4 size-full">
      <h1 className="text-3xl font-bold">Playground</h1>
      <p>This is a playground for testing our models.</p>
      <div className="flex p-2 size-full">
        <div className="flex flex-col p-4 w-1/3">
          <h2 className="text-2xl font-bold">Settings</h2>
          <SettingsForm form={form} onSubmit={onSubmit} />
        </div>
        <div className="flex flex-col p-4 w-2/3">
          <h2 className="text-2xl font-bold">Input</h2>
          <Textarea
            className="p-2 border border-gray-300 rounded"
            rows={10}
            placeholder="Enter your text here"
            style={{ resize: 'none' }}
          />
          <h2 className="text-2xl font-bold">Output</h2>
          <Textarea readOnly style={{ resize: 'none' }} />
        </div>
      </div>
    </main>
  )
}
