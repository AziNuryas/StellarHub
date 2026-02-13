// components/DebugAuth.tsx
'use client'

import { useAuth } from '@/app/contexts/AuthContext'

export default function DebugAuth() {
  const { user, loading } = useAuth()

  console.log('=== AUTH DEBUG ===')
  console.log('Loading:', loading)
  console.log('User:', user)
  console.log('Is logged in:', !!user)
  console.log('==================')

  return null
}