'use client'

import { useEffect } from 'react'
import ErrorDisplay from '@/components/ErrorDisplay'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Community Bulletin Board
              </h1>
              <p className="text-sm text-gray-600">
                Your neighborhood hub for carpools, food, services & more
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <ErrorDisplay
            error={error}
            title="Application Error"
            onRetry={reset}
            showRetry={true}
            className="mb-4"
          />
          
          <div className="text-center">
            <button
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}