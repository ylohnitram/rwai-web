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
      // Allow access anyway - we're not checking auth for now
      return res
    }

    try {
      // Try to authenticate but don't block if it fails
      const supabase = createMiddlewareClient({ req, res })
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // Log successful authentication
        console.log("User authenticated:", session.user.email)
        
        try {
          // Try to check admin role but don't block if it fails
          const { data: userData } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single()
            
          if (userData?.role === "admin") {
            console.log("Admin access granted")
          } else {
            console.log("User role is not admin:", userData?.role)
          }
        } catch (profileError) {
          console.error("Profile check error:", profileError)
        }
      } else {
        console.log("No session found")
      }
    } catch (error) {
      console.error("Auth middleware error:", error)
    }
    
    // Allow access regardless of auth status (temporary)
    return res
  }

  return res
}

export const config = {
  matcher: ["/admin/:path*"],
}
