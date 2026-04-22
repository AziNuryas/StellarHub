'use client'

import { usePathname, useRouter } from "next/navigation"
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
  const router = useRouter()
  const pathname = usePathname()

  const isLandingPage = pathname === '/'
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password'
  const isPublicPath = isLandingPage || isAuthPage || pathname?.startsWith('/auth/')

  useEffect(() => {
    if (loading) return

    // User sudah login tapi masih di landing page atau auth page → langsung ke feed
    if (user && (isLandingPage || isAuthPage)) {
      router.replace('/feed')
      return
    }

    // User belum login tapi akses protected route → balik ke landing
    if (!user && !isPublicPath) {
      router.replace('/')
    }
  }, [user, loading, pathname])

  if (loading) {
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

  const showNav = !isAuthPage && !pathname?.startsWith('/auth/')

  return (
    <>
      {showNav && <Navbar />}
      <main style={{ paddingTop: showNav ? 64 : 0 }}>
        {children}
      </main>
    </>
  )
}