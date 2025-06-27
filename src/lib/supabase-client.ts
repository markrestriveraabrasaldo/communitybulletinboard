import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  // Clean environment variables to prevent header issues
  const cleanUrl = supabaseUrl.trim()
  const cleanKey = supabaseAnonKey.trim().replace(/\s+/g, '')

  return createBrowserClient<Database>(
    cleanUrl,
    cleanKey
  )
}