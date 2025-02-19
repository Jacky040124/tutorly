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

  // Format the error message to be more user-friendly
  const getErrorMessage = (error: Error) => {
    if (error.message.includes('auth/invalid-credential')) {
      return "Invalid email or password. Please try again."
    }
    return error.message || "Unknown error occurred"
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-red-600">Oops! Something went wrong</h1>
        <p className="text-gray-600 text-lg max-w-md">
          We apologize for the inconvenience. An unexpected error has occurred.
        </p>
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-800 text-sm font-medium">
            {getErrorMessage(error)}
          </p>
          {error.digest && (
            <p className="text-red-600 text-xs mt-1">
              Error ID: {error.digest}
            </p>
          )}
        </div>
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
