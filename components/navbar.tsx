"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Search, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAdmin } = useAuth()
  const pathname = usePathname()

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

            {/* Show Setup only if admin */}
            {isAdmin && (
              <Button
                asChild
                variant="outline"
                className="hidden sm:flex border-gray-700 hover:border-amber-500 hover:text-amber-500"
              >
                <Link href="/setup">
                  <Settings className="h-4 w-4 mr-2" />
                  Setup
                </Link>
              </Button>
            )}

            {/* Show Admin only if admin */}
            {isAdmin && (
              <Button 
                asChild 
                variant="outline"
                className="hidden sm:flex bg-amber-500 hover:bg-amber-600 text-gray-900 border-0"
              >
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
            <Link
              href="/submit"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Submit Project
            </Link>

            {/* Show Setup only if admin */}
            {isAdmin && (
              <Link
                href="/setup"
                className={`text-sm font-medium ${pathname === "/setup" ? "text-white" : "text-gray-400 hover:text-white"} transition-colors flex items-center`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Setup
              </Link>
            )}

            {/* Show Admin only if admin */}
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
