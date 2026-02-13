import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({
              name,
              value,
              ...options,
              path: "/",
            })
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const path = request.nextUrl.pathname

  // ✅ LANDING PAGE - BEBAS, JANGAN PERNAH DI REDIRECT!
  if (path === '/') {
    return response
  }

  // ✅ Halaman auth - redirect ke feed kalo udah login
  if (path === '/login' || path === '/register' || path === '/forgot-password') {
    if (session) {
      return NextResponse.redirect(new URL('/feed', request.url))
    }
    return response
  }

  // ✅ Halaman protected - redirect ke landing kalo belum login
  const protectedPaths = ['/feed', '/profile', '/settings', '/post', '/dashboard', '/community', '/nasa', '/explore']
  if (protectedPaths.some(p => path.startsWith(p))) {
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return response
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}