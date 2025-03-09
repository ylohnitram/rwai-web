"use client"

import Link from "next/link"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminNavLinks() {
  return (
    <>
      {/* Setup button with gear icon */}
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

      {/* Admin button */}
      <Button 
        asChild 
        variant="outline"
        className="hidden sm:flex bg-amber-500 hover:bg-amber-600 text-gray-900 border-0"
      >
        <Link href="/admin">Admin</Link>
      </Button>
    </>
  )
}
