import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // Only run this middleware for admin routes
  if (pathname.startsWith("/admin")) {
    // Check if Supabase environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      // If Supabase is not configured, redirect to the setup page
      const url = new URL("/setup", req.url)
      return NextResponse.redirect(url)
    }

    try {
      const supabase = createMiddlewareClient({ req, res })

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        const url = new URL("/login", req.url)
        return NextResponse.redirect(url)
      }

      // Verify admin role
      const { data: userData } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

      if (userData?.role !== "admin") {
        const url = new URL("/login", req.url)
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.error("Middleware error:", error)
      // If an error occurs, redirect to the login page
      const url = new URL("/login", req.url)
      return NextResponse.redirect(url)
    }
  }

  return res
}

export const config = {
  matcher: ["/admin/:path*"],
}

