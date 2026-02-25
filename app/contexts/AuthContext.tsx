'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

interface User {
  id: string
  email: string
  username: string
  avatar_url: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const NO_REDIRECT_PATHS = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/nasa', '/explore']

function clearAllAuthStorage() {
  if (typeof window === 'undefined') return
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('sb-') || key.startsWith('supabase') || key.startsWith('stellarhub')) {
      localStorage.removeItem(key)
    }
  })
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('sb-') || key.startsWith('supabase')) {
      sessionStorage.removeItem(key)
    }
  })
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const saveUserToLocalStorage = (userData: User | null) => {
    if (typeof window !== 'undefined') {
      if (userData) {
        localStorage.setItem('stellarhub_user', JSON.stringify(userData))
        localStorage.setItem('stellarhub_user_timestamp', Date.now().toString())
      } else {
        localStorage.removeItem('stellarhub_user')
        localStorage.removeItem('stellarhub_user_timestamp')
      }
    }
  }

  const buildUserData = async (sessionUser: any): Promise<User> => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionUser.id)
      .single()

    return {
      id: sessionUser.id,
      email: sessionUser.email || '',
      username:
        profile?.username ||
        sessionUser.user_metadata?.username ||
        sessionUser.email?.split('@')[0] ||
        'User',
      avatar_url:
        profile?.avatar_url ||
        sessionUser.user_metadata?.avatar_url ||
        `https://ui-avatars.com/api/?name=${sessionUser.email?.split('@')[0]}&background=random`,
    }
  }

  const checkAuth = async () => {
    try {
      const { data: { user: verifiedUser }, error } = await supabase.auth.getUser()
      if (verifiedUser && !error) {
        const userData = await buildUserData(verifiedUser)
        setUser(userData)
        saveUserToLocalStorage(userData)
      } else {
        clearAllAuthStorage()
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event)
        
        if (!mounted) return

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            const userData = await buildUserData(session.user)
            setUser(userData)
            saveUserToLocalStorage(userData)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          clearAllAuthStorage()
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        if (error.message.includes('Email not confirmed')) throw new Error('EMAIL_NOT_CONFIRMED')
        throw error
      }
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, username: string) => {
    setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email, password,
        options: { data: { username } },
      })
      if (authError) throw authError
      if (authData.user) {
        await supabase.from('profiles').insert({
          id: authData.user.id,
          username,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authData.user.id}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' })
    } catch (e) {
      console.error('Logout error:', e)
    } finally {
      clearAllAuthStorage()
      setUser(null)
      window.location.href = '/login'
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider')
  return context
}