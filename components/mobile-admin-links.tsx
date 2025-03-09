"use client"

import Link from "next/link"
import { Settings } from "lucide-react"
import { usePathname } from "next/navigation"

export default function MobileAdminLinks() {
  const pathname = usePathname()
  
  return (
    <>
      {/* Setup link in mobile menu */}
      <Link
        href="/setup"
        className={`text-sm font-medium ${pathname === "/setup" ? "text-white" : "text-gray-400 hover:text-white"} transition-colors flex items-center`}
        onClick={() => {}}
      >
        <Settings className="h-4 w-4 mr-2" />
        Setup
      </Link>

      {/* Admin link in mobile menu */}
      <Link
        href="/admin"
        className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
        onClick={() => {}}
      >
        Admin
      </Link>
    </>
  )
}
