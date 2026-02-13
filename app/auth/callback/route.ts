import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (!code) {
    return NextResponse.redirect(new URL('/login', requestUrl.origin))
  }

  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              if (options?.maxAge) {
                const expires = new Date(Date.now() + options.maxAge * 1000)
                options.expires = expires
              }
              cookieStore.set(name, value, { path: '/', ...options })
            })
          },
        },
      }
    )

    // Exchange code untuk session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth error:', error)
      return NextResponse.redirect(new URL(`/login?error=auth_failed`, requestUrl.origin))
    }

    // Ambil user info
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Cek apakah profile sudah ada
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      // Buat profile jika belum ada
      if (!profile) {
        const username = user.email?.split('@')[0] || 'user_' + Math.random().toString(36).substr(2, 9)
        
        await supabase.from('profiles').insert({
          id: user.id,
          username: username,
          avatar_url: user.user_metadata?.avatar_url || 
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
          bio: 'Space Explorer 🌌',
          verified: false
        })
      }
    }

    // Redirect ke feed
    const response = NextResponse.redirect(new URL('/feed', requestUrl.origin))
    
    // Set cookie untuk mencegah cache
    response.headers.set('Cache-Control', 'no-store, must-revalidate')
    
    return response

  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(new URL('/login?error=server_error', requestUrl.origin))
  }
}