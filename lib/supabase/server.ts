import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              if (options?.maxAge) {
                // Convert to Date for cookie store
                options.expires = new Date(Date.now() + options.maxAge * 1000)
              }
              cookieStore.set({ name, value, ...options })
            })
          } catch {
            // Ignore errors in middleware
          }
        },
      },
    }
  )
}