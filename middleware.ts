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

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // ✅ LANDING PAGE — always allow
  if (path === '/') {
    return response
  }

  // ✅ AUTH PAGES — always allow, even if logged in
  // Reason: login page intentionally shows "continue or switch account" UI
  // We must NOT redirect here — that would bypass the user's choice
  if (
    path === '/login' ||
    path === '/register' ||
    path === '/forgot-password' ||
    path === '/reset-password' ||
    path.startsWith('/auth/')
  ) {
    return response
  }

  // ✅ PROTECTED PAGES — redirect to landing if not logged in
  const protectedPaths = [
    '/feed', '/profile', '/settings', '/post',
    '/dashboard', '/community', '/nasa', '/explore',
    '/notifications',
  ]

  if (protectedPaths.some(p => path.startsWith(p))) {
    if (!user) {
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