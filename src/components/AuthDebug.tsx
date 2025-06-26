'use client'

import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase-client'

export default function AuthDebug() {
  const { user, session, loading } = useAuth()
  const supabase = createClient()

  const checkAuthStatus = async () => {
    const { data: { session: currentSession }, error } = await supabase.auth.getSession()
    console.log('Current session:', currentSession)
    console.log('Auth error:', error)
    
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    console.log('Current user:', currentUser)
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="text-xs space-y-1">
        <div>Loading: {loading ? 'true' : 'false'}</div>
        <div>User: {user ? user.email || 'Anonymous' : 'null'}</div>
        <div>Session: {session ? 'exists' : 'null'}</div>
        <div>User ID: {user?.id || 'none'}</div>
        <div>Provider: {user?.app_metadata?.provider || 'none'}</div>
        <div>Metadata: {JSON.stringify(user?.user_metadata) || 'none'}</div>
      </div>
      <button
        onClick={checkAuthStatus}
        className="mt-2 px-2 py-1 bg-blue-600 text-white text-xs rounded"
      >
        Check Auth
      </button>
    </div>
  )
}