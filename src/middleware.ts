import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const protectedPaths = ['/dashboard', '/events', '/orders', '/membership', '/seller', '/admin']
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))

  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (request.nextUrl.pathname.startsWith('/admin') && profile?.role !== 'admin') {
      const fallback = profile?.role === 'seller' ? '/seller/dashboard' : '/dashboard'
      return NextResponse.redirect(new URL(fallback, request.url))
    }

    if (request.nextUrl.pathname.startsWith('/seller') && profile?.role !== 'seller' && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Role-based dashboard redirect: admin/seller hitting /dashboard -> their own
    const isClientDashboard = request.nextUrl.pathname === '/dashboard' || request.nextUrl.pathname.startsWith('/dashboard/')
    if (isClientDashboard && profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    if (isClientDashboard && profile?.role === 'seller') {
      return NextResponse.redirect(new URL('/seller/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|api).*)',
  ],
}
