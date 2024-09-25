import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'

const ApiKeyDialog = ({
  apiKey,
  setApiKey
}: {
  apiKey: string
  setApiKey: (apiKey: string) => void
}) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={() => setIsOpen(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>API Key</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Type your API Key here to use the playground
          </AlertDialogDescription>
          <Textarea
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="API Key"
          />
          <AlertDialogFooter>
            <AlertDialogAction>
              <Button
                disabled={apiKey.length !== 36}
                onClick={() => {
                  if (apiKey.length === 36) {
                    localStorage.setItem('apiKey', apiKey)
                    setApiKey(apiKey)
                    setIsOpen(false)
                  }
                }}
              >
                Start
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default ApiKeyDialog
