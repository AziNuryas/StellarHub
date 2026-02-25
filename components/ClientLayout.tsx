'use client'

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/app/contexts/AuthContext"
import { useTheme } from "@/app/contexts/ThemeContext"  // ← TETAP ADA
import Navbar from "@/components/shared/Navbar"
import DebugAuth from '@/components/DebugAuth'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const { theme } = useTheme() // ← AMAN KARENA SUDAH DI WRAP
  const router = useRouter()
  const pathname = usePathname()

  const isLandingPage = pathname === '/'
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password'
  const isPublicPath = isLandingPage || isAuthPage || pathname?.startsWith('/auth/')

  useEffect(() => {
    if (loading) return

    // ✅ Jangan redirect dari landing page
    if (isLandingPage) return

    // ✅ Redirect ke landing kalau akses protected tanpa login
    if (!user && !isPublicPath) {
      router.push('/')
    }

    // ✅ DIHAPUS: jangan auto-redirect ke /feed kalau buka /login atau /register
    // Login page punya UI sendiri untuk handle kondisi "udah login"

  }, [user, loading, pathname, router, isLandingPage, isAuthPage, isPublicPath])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <>
      <DebugAuth />
      {!isAuthPage && !pathname?.startsWith('/auth/') && <Navbar />}
      <main className={!isAuthPage && !pathname?.startsWith('/auth/') ? "pt-16" : ""}>
        {children}
      </main>
    </>
  )
}