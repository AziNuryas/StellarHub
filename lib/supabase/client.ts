import { createClient as createSupabaseClient } from '@supabase/supabase-js'

declare global {
  interface Window {
    __supabase_client: any;
  }
}

let browserClient: any = null;

export function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("CRITICAL ERROR: Supabase environment variables are missing on Vercel.");
    return new Proxy({}, {
      get: function(target, prop) {
        if (prop === 'auth') return new Proxy({}, { get: () => () => ({ data: { session: null, user: null }, error: new Error('MISSING_ENV_VARS') }) });
        if (prop === 'from') return () => new Proxy({}, { get: () => () => new Proxy({}, { get: () => () => ({ data: null, error: new Error('MISSING_ENV_VARS') }) }) });
        return () => ({ data: null, error: new Error('MISSING_ENV_VARS') });
      }
    }) as any;
  }
  
  // Return singleton if in browser to prevent navigator.locks deadlocks
  if (typeof window !== 'undefined') {
    if (!browserClient) {
      browserClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,

            storage: {
              getItem: (key: string) => {
                try { return window.localStorage.getItem(key) } catch(e) { return null }
              },
              setItem: (key: string, value: string) => {
                try { window.localStorage.setItem(key, value) } catch(e) {}
              },
              removeItem: (key: string) => {
                try { window.localStorage.removeItem(key) } catch(e) {}
              }
            }
          },
        }
      );
    }
    return browserClient;
  }

  // Always return fresh client on server
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}