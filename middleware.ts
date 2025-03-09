import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // Check for protected routes: admin, API admin, and setup
  if (
    pathname.startsWith("/admin") || 
    pathname.startsWith("/api/admin") ||
    pathname === "/setup"  // Add setup to protected routes
  ) {
    // Check if Supabase environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.log("Supabase environment variables not set")
      // Special case: Allow access to setup page if environment variables are not set
      // This allows initial configuration
      if (pathname === "/setup") {
        return NextResponse.next()
      }
      
      // For other admin routes, redirect to the setup page
      const url = new URL("/setup", req.url)
      return NextResponse.redirect(url)
    }

    try {
      // Create a Supabase client for the middleware
      const supabase = createMiddlewareClient({ req, res })
      
      // Get the current session and refresh it if needed
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error("Session error:", sessionError)
        
        // For API requests, return a JSON response
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Authentication error", message: sessionError.message },
            { status: 401 }
          )
        }
        
        // For page requests, redirect to login
        const url = new URL("/login", req.url)
        return NextResponse.redirect(url)
      }

      if (!session) {
        console.log("No session found, redirecting to login")
        
        // For API requests, return a JSON response
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "No active session", message: "Please log in" },
            { status: 401 }
          )
        }
        
        // For page requests, redirect to login
        const url = new URL("/login", req.url)
        url.searchParams.set("from", pathname)
        return NextResponse.redirect(url)
      }

      // For protected admin routes, check if the user is an admin
      try {
        // Check admin role
        const { data: userData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()
          
        if (profileError) {
          console.error("Profile error:", profileError)
          
          // For API requests, return a JSON response
          if (pathname.startsWith("/api/")) {
            return NextResponse.json(
              { error: "Profile error", message: profileError.message },
              { status: 500 }
            )
          }
          
          // For page requests, redirect to login
          const url = new URL("/login", req.url)
          return NextResponse.redirect(url)
        }
        
        if (userData?.role !== "admin") {
          console.log("User role is not admin:", userData?.role)
          
          // For API requests, return a JSON response
          if (pathname.startsWith("/api/")) {
            return NextResponse.json(
              { error: "Access denied", message: "Admin privileges required" },
              { status: 403 }
            )
          }
          
          // For page requests, redirect to login with error
          const url = new URL("/login", req.url)
          url.searchParams.set("error", "admin_required")
          return NextResponse.redirect(url)
        }
      } catch (profileErr) {
        console.error("Profile check exception:", profileErr)
        
        // For API requests, return a JSON response
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Server error", message: "Failed to verify admin privileges" },
            { status: 500 }
          )
        }
        
        // For page requests, redirect to login
        const url = new URL("/login", req.url)
        return NextResponse.redirect(url)
      }
    } catch (authError) {
      console.error("Auth middleware error:", authError)
      
      // For API requests, return a JSON response
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Authentication error", message: "Failed to verify authentication" },
          { status: 500 }
        )
      }
      
      // For page requests, redirect to login
      const url = new URL("/login", req.url)
      return NextResponse.redirect(url)
    }
  }

  return res
}

// Configure paths that will trigger this middleware
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/setup", 
  ],
}
