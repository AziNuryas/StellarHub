'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Fungsi untuk menyimpan user ke localStorage
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

  // Fungsi untuk mengambil user dari localStorage
  const getUserFromLocalStorage = (): User | null => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('stellarhub_user')
      const timestampStr = localStorage.getItem('stellarhub_user_timestamp')
      
      if (userStr && timestampStr) {
        const timestamp = parseInt(timestampStr)
        if (Date.now() - timestamp < 3600000) {
          return JSON.parse(userStr)
        }
      }
    }
    return null
  }

  const checkAuth = async () => {
    try {
      // Cek session dari Supabase
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Fetch profile dari database
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          username: profile?.username || 
                   session.user.user_metadata?.username || 
                   session.user.email?.split('@')[0] || 
                   'User',
          avatar_url: profile?.avatar_url || 
                     session.user.user_metadata?.avatar_url || 
                     `https://ui-avatars.com/api/?name=${session.user.email?.split('@')[0]}&background=random`
        }
        
        setUser(userData)
        saveUserToLocalStorage(userData)
      } else {
        // Cek dari localStorage sebagai fallback
        const cachedUser = getUserFromLocalStorage()
        if (cachedUser) {
          setUser(cachedUser)
        } else {
          setUser(null)
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      setUser(null)
      saveUserToLocalStorage(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            username: profile?.username || 
                     session.user.user_metadata?.username || 
                     session.user.email?.split('@')[0] || 
                     'User',
            avatar_url: profile?.avatar_url || 
                       session.user.user_metadata?.avatar_url || 
                       `https://ui-avatars.com/api/?name=${session.user.email?.split('@')[0]}&background=random`
          }
          
          setUser(userData)
          saveUserToLocalStorage(userData)
        } else {
          setUser(null)
          saveUserToLocalStorage(null)
        }
        
        router.refresh()
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, []) // ← Kosongin dependency array!

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    await checkAuth()
  }

  const register = async (email: string, password: string, username: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          avatar_url: `https://ui-avatars.com/api/?name=${username}&background=random`
        }
      }
    })
    
    if (authError) throw authError

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          username,
          avatar_url: `https://ui-avatars.com/api/?name=${username}&background=random`
        })
      
      if (profileError) {
        console.log('Profile creation note:', profileError.message)
      }
      
      await checkAuth()
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    saveUserToLocalStorage(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout,
      checkAuth 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}