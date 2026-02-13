'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useState, useEffect } from 'react'

type SupabaseContextType = ReturnType<typeof createClient>

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within SupabaseProvider')
  }
  return context
}

export default function SupabaseProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [supabase] = useState(() => createClient())
  const router = useRouter()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  )
}
