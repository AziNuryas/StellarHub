import { createBrowserClient } from '@supabase/ssr'

declare global {
  interface Window {
    __supabase_client: any;
  }
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}