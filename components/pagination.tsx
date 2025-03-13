"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
}

export default function Pagination({ totalPages, currentPage, onPageChange }: PaginationProps) {
  const handlePageChange = useCallback((pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return
    onPageChange(pageNumber)
  }, [totalPages, onPageChange])

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-400">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="icon" 
          disabled={currentPage <= 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
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
              <Button 
                key={pageNumber} 
                variant={currentPage === pageNumber ? "default" : "outline"} 
                size="icon"
                onClick={() => handlePageChange(pageNumber)}
              >
                {pageNumber}
              </Button>
            )
          }
          return null
        })}

        <Button 
          variant="outline" 
          size="icon" 
          disabled={currentPage >= totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
