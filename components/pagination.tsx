"use client"

import { useCallback } from "react"
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

  // Calculate which page numbers to show
  const getPageNumbers = () => {
    // Simple case: 5 or fewer pages total
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // For more than 5 pages:
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Adjust if we're near the end
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - 4);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const pageNumbers = getPageNumbers();

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

        {pageNumbers.map(pageNumber => (
          <Button 
            key={pageNumber} 
            variant={currentPage === pageNumber ? "default" : "outline"} 
            size="icon"
            onClick={() => handlePageChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}

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
