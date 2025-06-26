import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/'

  // Log all parameters for debugging
  console.log('Auth callback params:', {
    code: code ? 'present' : 'missing',
    error,
    error_description,
    all_params: Object.fromEntries(searchParams.entries())
  })

  // If there's an error from Facebook, log it and redirect
  if (error) {
    console.error('OAuth error from Facebook:', { error, error_description })
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${error}&description=${error_description}`)
  }

  if (code) {
    const supabase = await createClient()
    const { data, error: supabaseError } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log('Supabase auth exchange result:', { 
      success: !supabaseError, 
      error: supabaseError?.message,
      user: data?.user?.email,
      userMetadata: data?.user?.user_metadata,
      provider: data?.user?.app_metadata?.provider
    })
    
    if (!supabaseError) {
      console.log('Authentication successful, redirecting to:', next)
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error('Supabase auth error:', supabaseError)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?supabase_error=${supabaseError.message}`)
    }
  }

  // No code parameter
  console.error('No authorization code received')
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`)
}