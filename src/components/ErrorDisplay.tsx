interface ErrorDisplayProps {
  error: string | Error
  title?: string
  className?: string
  onRetry?: () => void
  showRetry?: boolean
}

export default function ErrorDisplay({ 
  error, 
  title = 'Error',
  className = '',
  onRetry,
  showRetry = true
}: ErrorDisplayProps) {
  const errorMessage = error instanceof Error ? error.message : error

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {title}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{errorMessage}</p>
          </div>
          {showRetry && onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-800 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ErrorCard({ 
  error, 
  title,
  className = '' 
}: { 
  error: string | Error
  title?: string
  className?: string 
}) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <ErrorDisplay 
        error={error} 
        title={title}
        showRetry={false}
      />
    </div>
  )
}