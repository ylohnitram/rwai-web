"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

interface PaginationProps {
  totalPages: number
}

export default function Pagination({ totalPages }: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentPage = Number.parseInt(searchParams.get("page") || "1")

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-400">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild disabled={currentPage <= 1}>
          <Link href={createPageURL(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>

        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          // Show max 5 page buttons
          let pageNumber = currentPage
          if (currentPage < 3) {
            pageNumber = i + 1
          } else if (currentPage > totalPages - 2) {
            pageNumber = totalPages - 4 + i
          } else {
            pageNumber = currentPage - 2 + i
          }

          if (pageNumber > 0 && pageNumber <= totalPages) {
            return (
              <Button key={pageNumber} variant={currentPage === pageNumber ? "default" : "outline"} size="icon" asChild>
                <Link href={createPageURL(pageNumber)}>{pageNumber}</Link>
              </Button>
            )
          }
          return null
        })}

        <Button variant="outline" size="icon" asChild disabled={currentPage >= totalPages}>
          <Link href={createPageURL(currentPage + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
