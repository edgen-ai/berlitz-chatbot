'use client'
import TalkingHeadComponent from '@/components/avatarai/page'
import fetch_and_play_audio from '@/lib/chat/fetch_and_play_audio'
import { use, useEffect, useState } from 'react'

export default function NewPage() {
  const text =
    'Welcome to Edgen A.I.! Here starts your journey to the future. Felicitaciones por querer aprender un nuevo idioma. ¡Vamos a empezar!'
  const [audioBuffer, setAudioBuffer] = useState<Uint8Array | undefined>(
    undefined
  )
  useEffect(() => {
    async function playText({ text }: { text: string }) {
      const audiB = await fetch_and_play_audio({
        text
      })

      setAudioBuffer(audiB as any)
    }
    playText({ text })
  }, [])
  return <TalkingHeadComponent textToSay={text} audioToSay={audioBuffer} />
}
