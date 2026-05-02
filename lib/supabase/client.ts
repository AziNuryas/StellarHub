import { createBrowserClient } from '@supabase/ssr'

declare global {
  interface Window {
    __supabase_client: any;
  }
}

export function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Supabase environment variables are missing. Please check your Vercel settings or .env.local file.");
    // Return a dummy client to prevent crashing the entire app immediately,
    // though auth/db operations will fail.
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ error: new Error('Missing Supabase Config') }),
        signUp: async () => ({ error: new Error('Missing Supabase Config') }),
        signOut: async () => {},
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: new Error('Missing config') })
          })
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: new Error('Missing config') })
          })
        })
      }),
      storage: {
        from: () => ({})
      },
      rpc: async () => ({ data: null, error: new Error('Missing config') })
    } as any;
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}