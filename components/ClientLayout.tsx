'use client'

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/app/contexts/AuthContext"
import Navbar from "@/components/shared/Navbar"
import DebugAuth from '@/components/DebugAuth'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isLandingPage = pathname === '/'
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password'
  const isPublicPath = isLandingPage || isAuthPage || pathname?.startsWith('/auth/')

  useEffect(() => {
    if (loading) return

    // ✅ JANGAN PERNAH REDIRECT DARI LANDING PAGE!
    if (isLandingPage) {
      return
    }

    // Redirect ke landing kalo akses protected tanpa login
    if (!user && !isPublicPath) {
      router.push('/')
    }

    // Redirect ke feed kalo udah login buka login/register
    if (user && isAuthPage) {
      router.push('/feed')
    }

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