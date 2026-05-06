'use client'

import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/app/contexts/AuthContext"
import { useTheme } from "@/app/contexts/ThemeContext"
import Navbar from "@/components/shared/Navbar"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const { theme } = useTheme()

  const pathname = usePathname()

  const isLandingPage = pathname === '/'
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password'
  const isPublicPath = isLandingPage || isAuthPage || pathname?.startsWith('/auth/')



  if (loading && !isPublicPath) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100svh', background: '#07090f'
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '2px solid rgba(129,140,248,0.15)',
          borderTopColor: '#818cf8',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 64 }}>
        {children}
      </main>
    </>
  )
}