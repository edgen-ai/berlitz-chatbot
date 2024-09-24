import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const LoadingCard = () => (
  <div className="flex flex-col-reverse gap-2 my-1">
    <Card className="border border-gray-300 rounded p-2 animate-pulse">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Loading...</CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-full mb-2" /> {/* Placeholder for input */}
          <Skeleton className="h-4 w-3/4" />{' '}
          {/* Placeholder for more content */}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" /> {/* Placeholder for content */}
        <Skeleton className="h-4 w-3/4" /> {/* Placeholder for more content */}
      </CardContent>
      <CardFooter>
        <Skeleton className="h-4 w-1/4" /> {/* Placeholder for time taken */}
      </CardFooter>
    </Card>
  </div>
)
export default LoadingCard
