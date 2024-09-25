import { MemoizedReactMarkdown } from '@/components/markdown'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'

const OutputList = ({
  completions
}: {
  completions: {
    content: string
    startTimestamp: number
    endTimestamp: number
    input: string
  }[]
}) => {
  return (
    <div className="flex flex-col-reverse gap-2">
      {completions.map((completion, index) => (
        <Card key={index} className="border border-gray-300 rounded p-2">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Completion {index + 1}
            </CardTitle>
            <CardDescription>
              <MemoizedReactMarkdown>{completion.input}</MemoizedReactMarkdown>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MemoizedReactMarkdown>{completion.content}</MemoizedReactMarkdown>
          </CardContent>
          <Tooltip>
            <TooltipTrigger asChild>
              <CardFooter>
                <p>
                  Time taken:{' '}
                  {completion.endTimestamp - completion.startTimestamp} ms
                </p>
              </CardFooter>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                From:{' '}
                {new Intl.DateTimeFormat('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  second: 'numeric',
                  timeZoneName: 'short'
                }).format(new Date(completion.startTimestamp))}
              </p>
              <p>
                Until:{' '}
                {new Intl.DateTimeFormat('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  second: 'numeric',
                  timeZoneName: 'short'
                }).format(new Date(completion.endTimestamp))}
              </p>
            </TooltipContent>
          </Tooltip>
        </Card>
      ))}
    </div>
  )
}

export default OutputList
