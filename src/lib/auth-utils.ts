import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  return { user, error, supabase }
}

export async function requireAuth() {
  const { user, error } = await getAuthenticatedUser()
  
  if (error || !user) {
    redirect('/?message=sign-in-required')
  }
  
  return user
}

export async function getOptionalAuth() {
  const { user, supabase } = await getAuthenticatedUser()
  return { user, supabase }
}