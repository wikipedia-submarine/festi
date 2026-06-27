"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

export function ListPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  const pages: (number | "dots")[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1, 2, 3)
    if (currentPage > 4) pages.push("dots")
    const mid = Math.max(4, Math.min(totalPages - 3, currentPage))
    if (mid > 3 && mid < totalPages - 2) pages.push(mid)
    if (currentPage < totalPages - 3) pages.push("dots")
    pages.push(totalPages - 1, totalPages)
  }

  const btnBase =
    "flex items-center justify-center min-w-[40px] h-10 px-3.5 rounded-[10px] border text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"

  return (
    <div className="flex flex-wrap justify-center items-center gap-2 mt-12">
      <button
        type="button"
        className={`${btnBase} border-[#cecbf6] bg-white text-[#534ab7] hover:bg-[#f7f6fd] gap-1.5`}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {pages.map((page, i) =>
        page === "dots" ? (
          <span key={`dots-${i}`} className="px-1 text-[#afa9ec] font-medium select-none">
            …
          </span>
        ) : (
          <button
            type="button"
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`${btnBase} ${
              currentPage === page
                ? "bg-[#26215c] border-[#26215c] text-white"
                : "border-[#cecbf6] bg-white text-[#534ab7] hover:bg-[#f7f6fd]"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        className={`${btnBase} border-[#cecbf6] bg-white text-[#534ab7] hover:bg-[#f7f6fd] gap-1.5`}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
