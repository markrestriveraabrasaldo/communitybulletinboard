import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/'

  // If there's an error from Facebook, log it and redirect
  if (error) {
    console.error('OAuth error from Facebook:', { error, error_description })
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${error}&description=${error_description}`)
  }

  if (code) {
    // Store cookies to be set on response
    const cookiesToSet: Array<{ name: string; value: string; options?: any }> = []
    
    // Clean environment variables to prevent header issues
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim()
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim().replace(/\s+/g, '')
    
    // Create Supabase client with proper cookie handling for Route Handlers
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookieList) {
            cookiesToSet.push(...cookieList)
          },
        },
      }
    )

    const { error: supabaseError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (supabaseError) {
      console.error('Supabase auth error:', supabaseError)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?supabase_error=${supabaseError.message}`)
    }
    
    // Create response and set all collected cookies
    const response = NextResponse.redirect(`${origin}${next}`)
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })
    
    return response
  }

  // No code parameter
  console.error('No authorization code received')
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`)
}