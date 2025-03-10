"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"

// Dynamically import the admin components with no SSR
const AdminNavLinks = dynamic(() => import('./admin-nav-links'), { ssr: false })
const MobileAdminLinks = dynamic(() => import('./mobile-admin-links'), { ssr: false })

interface NavbarProps {
  isAdmin?: boolean;
}

export default function Navbar({ isAdmin = false }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  console.log("Navbar rendered with isAdmin:", isAdmin)

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
            <Link
              href="/edit"
              className={`text-sm font-medium ${pathname.startsWith("/edit") ? "text-white" : "text-gray-400 hover:text-white"} transition-colors`}
            >
              Edit Project
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

            {/* Conditionally render admin links */}
            {isAdmin && <AdminNavLinks />}
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
              href="/edit"
              className={`text-sm font-medium ${pathname.startsWith("/edit") ? "text-white" : "text-gray-400 hover:text-white"} transition-colors`}
              onClick={() => setIsMenuOpen(false)}
            >
              Edit Project
            </Link>
            <Link
              href="/submit"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Submit Project
            </Link>

            {/* Conditionally render mobile admin links */}
            {isAdmin && <MobileAdminLinks />}
          </nav>
        </div>
      )}
    </header>
  )
}
