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
      console.log("Supabase environment variables not set")
      // If Supabase is not configured, redirect to the setup page
      const url = new URL("/setup", req.url)
      return NextResponse.redirect(url)
    }

    try {
      const supabase = createMiddlewareClient({ req, res })
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error("Session error:", sessionError)
        const url = new URL("/login", req.url)
        return NextResponse.redirect(url)
      }

      if (!session) {
        console.log("No session found, redirecting to login")
        const url = new URL("/login", req.url)
        return NextResponse.redirect(url)
      }

      console.log("User authenticated:", session.user.email)
      
      try {
        // Check admin role
        const { data: userData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()
          
        if (profileError) {
          console.error("Profile error:", profileError)
          const url = new URL("/login", req.url)
          return NextResponse.redirect(url)
        }
        
        if (userData?.role !== "admin") {
          console.log("User role is not admin:", userData?.role)
          const url = new URL("/login", req.url)
          return NextResponse.redirect(url)
        }
        
        console.log("Admin access granted to:", session.user.email)
      } catch (profileErr) {
        console.error("Profile check exception:", profileErr)
        const url = new URL("/login", req.url)
        return NextResponse.redirect(url)
      }
    } catch (authError) {
      console.error("Auth middleware error:", authError)
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
