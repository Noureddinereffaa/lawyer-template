import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server'
import { triggerReminderCheck } from '@/lib/reminder-engine'

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  // Lazy reminder check — use waitUntil to prevent Vercel Edge from killing the background promise
  triggerReminderCheck(event);
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Skip supabase initialization if env vars are missing during build time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co"
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy"

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // ── Protected Routes ──
  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
    if (!user) {
      // Check if global Demo Mode is enabled
      const { data: settingsData } = await supabase.from('settings').select('config_data').single();
      const isDemoMode = settingsData?.config_data?.isDemoMode === true;
      
      if (!isDemoMode) {
        // no user and not in demo mode, redirect to login
        const url = request.nextUrl.clone()
        url.pathname = '/admin/login'
        return NextResponse.redirect(url)
      }
    }
  }

  // If user is already logged in, redirect away from login page
  if (user && request.nextUrl.pathname.startsWith('/admin/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
