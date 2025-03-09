"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Search, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/supabase"
import type { User } from "@/types/auth"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(true)
  const pathname = usePathname()

  // Check if user is authenticated and is admin
  useEffect(() => {
    // Check if Supabase environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setIsSupabaseConfigured(false)
      return
    }

    const checkUser = async () => {
      try {
        const supabaseClient = getSupabaseClient()
        const {
          data: { session },
        } = await supabaseClient.auth.getSession()

        if (session) {
          const { data } = await supabaseClient
            .from("profiles")
            .select("id, email, role")
            .eq("id", session.user.id)
            .single()

          setUser(data as User | null)
        }
      } catch (error) {
        console.error("Error checking user:", error)
      }
    }

    checkUser()

    try {
      // Set listener for auth state changes
      const supabaseClient = getSupabaseClient()
      const { data: authListener } = supabaseClient.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
          try {
            const { data } = await supabaseClient
              .from("profiles")
              .select("id, email, role")
              .eq("id", session.user.id)
              .single()

            setUser(data as User | null)
          } catch (error) {
            console.error("Error fetching user profile:", error)
          }
        } else {
          setUser(null)
        }
      })

      return () => {
        authListener?.subscription?.unsubscribe()
      }
    } catch (error) {
      console.error("Error setting up auth listener:", error)
    }
  }, [])

  // Show setup only for admins or when Supabase is not configured
  const shouldShowSetup = !isSupabaseConfigured || (user && user.role === "admin")

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-[#0F172A]/90 backdrop-blur-sm">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="text-xl font-bold">
            <span className="text-amber-500">Token</span>Directory <span className="text-xs text-gray-400">by RWA Investors</span>
          </span>
        </Link>
        <nav className="hidden md:flex flex-1 items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className={`text-sm font-medium ${pathname === "/" ? "text-white" : "text-gray-400 hover:text-white"} transition-colors`}
            >
              Home
            </Link>
            <Link
              href="/directory"
              className={`text-sm font-medium ${pathname.startsWith("/directory") ? "text-white" : "text-gray-400 hover:text-white"} transition-colors`}
            >
              Directory
            </Link>
            <Link
              href="/blog"
              className={`text-sm font-medium ${pathname.startsWith("/blog") ? "text-white" : "text-gray-400 hover:text-white"} transition-colors`}
            >
              Blog
            </Link>
            {shouldShowSetup && (
              <Link
                href="/setup"
                className={`text-sm font-medium ${pathname === "/setup" ? "text-white" : "text-gray-400 hover:text-white"} transition-colors`}
              >
                Setup
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative rounded-full border border-amber-500/30 bg-gray-900/50">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Projects"
                className="h-10 w-[250px] rounded-full bg-transparent pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <Button
              asChild
              variant="outline"
              className="hidden sm:flex bg-amber-500 hover:bg-amber-600 text-gray-900 border-0"
            >
              <Link href="/submit">Submit Project</Link>
            </Button>

            {/* Show Setup button only for admins or when Supabase is not configured */}
            {shouldShowSetup && (
              <Button
                asChild
                variant="outline"
                className="hidden sm:flex border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
              >
                <Link href="/setup">
                  <Settings className="h-4 w-4 mr-2" />
                  Setup
                </Link>
              </Button>
            )}

            {/* Admin link is only visible to admin users */}
            {isSupabaseConfigured && user && user.role === "admin" && (
              <Button asChild variant="ghost" className="text-gray-400 hover:text-white">
                <Link href="/admin">Admin</Link>
              </Button>
            )}
          </div>
        </nav>
        <div className="md:hidden flex flex-1 justify-end">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden p-4 border-t border-gray-800 bg-[#0F172A]">
          <nav className="flex flex-col space-y-4">
            <Link
              href="/"
              className={`text-sm font-medium ${pathname === "/" ? "text-white" : "text-gray-400 hover:text-white"} transition-colors`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/directory"
              className={`text-sm font-medium ${pathname.startsWith("/directory") ? "text-white" : "text-gray-400 hover:text-white"} transition-colors`}
              onClick={() => setIsMenuOpen(false)}
            >
              Directory
            </Link>
            <Link
              href="/blog"
              className={`text-sm font-medium ${pathname.startsWith("/blog") ? "text-white" : "text-gray-400 hover:text-white"} transition-colors`}
              onClick={() => setIsMenuOpen(false)}
            >
              Blog
            </Link>
            {shouldShowSetup && (
              <Link
                href="/setup"
                className={`text-sm font-medium ${pathname === "/setup" ? "text-white" : "text-gray-400 hover:text-white"} transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                Setup
              </Link>
            )}
            <Link
              href="/submit"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Submit Project
            </Link>

            {/* Admin link is only visible to admin users */}
            {isSupabaseConfigured && user && user.role === "admin" && (
              <Link
                href="/admin"
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
            )}

            <div className="pt-2">
              <div className="relative rounded-full border border-amber-500/30 bg-gray-900/50">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Projects"
                  className="h-10 w-full rounded-full bg-transparent pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
