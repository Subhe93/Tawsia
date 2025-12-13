'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  itemsPerPage?: number
  className?: string
}

export function AdminPagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  className = ''
}: PaginationProps) {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="text-sm text-gray-500">
        {totalItems && itemsPerPage && (
          <>
            عرض {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} إلى {' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} من إجمالي {totalItems.toLocaleString()} عنصر
          </>
        )}
        {!totalItems && (
          <>صفحة {currentPage} من {totalPages}</>
        )}
      </div>

      <div className="flex items-center space-x-2 space-x-reverse">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronRight className="h-4 w-4" />
          السابق
        </Button>

        <div className="flex items-center space-x-1 space-x-reverse">
          {visiblePages.map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <Button variant="ghost" size="sm" disabled className="w-8 h-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const newPage = Math.min(totalPages, currentPage + 1)
            console.log('➡️ Next button clicked:', currentPage, '→', newPage)
            onPageChange(newPage)
          }}
          disabled={currentPage === totalPages}
        >
          التالي
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
