'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-red-600">Oops! Something went wrong</h1>
        <p className="text-gray-600 text-lg max-w-md">
          We apologize for the inconvenience. An unexpected error has occurred.
        </p>
        <div className="space-x-4">
          <Button
            onClick={() => router.push('/')}
            variant="default"
          >
            Return to Homepage
          </Button>
          <Button
            onClick={() => reset()}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )
}
