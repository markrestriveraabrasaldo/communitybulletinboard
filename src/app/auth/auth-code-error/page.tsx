import Link from 'next/link'

interface AuthCodeErrorPageProps {
  searchParams: Promise<{
    error?: string
    description?: string
    supabase_error?: string
  }>
}

export default async function AuthCodeErrorPage({ searchParams }: AuthCodeErrorPageProps) {
  const { error, description, supabase_error } = await searchParams

  let errorMessage = "There was an error signing you in."
  let specificError = ""

  if (error === "access_denied") {
    errorMessage = "You cancelled the Facebook login process."
    specificError = "You need to approve the Facebook login to continue."
  } else if (error === "server_error") {
    errorMessage = "Facebook server error occurred."
    specificError = "This is usually temporary. Please try again."
  } else if (supabase_error) {
    errorMessage = "Supabase authentication error."
    specificError = supabase_error
  } else if (error) {
    errorMessage = `Facebook OAuth error: ${error}`
    specificError = description || ""
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Authentication Error
        </h1>
        <p className="text-gray-600 mb-4">{errorMessage}</p>
        
        {specificError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-700">{specificError}</p>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
          <h3 className="font-medium text-yellow-800 mb-2">Common Solutions:</h3>
          <ul className="text-left text-sm text-yellow-700 space-y-1">
            <li>• Check Facebook app redirect URL configuration</li>
            <li>• Verify Supabase Facebook provider settings</li>
            <li>• Ensure Facebook app is not in sandbox mode</li>
            <li>• Check that your Facebook account can access the app</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </Link>
          
          {/* Debug info for developers */}
          {(error || supabase_error) && (
            <details className="text-left text-xs text-gray-500 border rounded p-2">
              <summary className="cursor-pointer font-medium">Debug Information</summary>
              <div className="mt-2 space-y-1">
                <div>Error: {error || 'none'}</div>
                <div>Description: {description || 'none'}</div>
                <div>Supabase Error: {supabase_error || 'none'}</div>
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}