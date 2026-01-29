import { PaginationMeta } from "@/types/shared/pagination"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination"
import { ReadonlyURLSearchParams } from "next/navigation"

function PagePagination({
  pagination,
  searchParams
}: {
  pagination: PaginationMeta
  searchParams: ReadonlyURLSearchParams
}) {

  function createPageUrl(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    return `?${params.toString()}`  
  }

  return (
    <>
      <Pagination>
        <PaginationContent className="gap-1">
          <PaginationItem>
            <PaginationPrevious
              href={
                pagination.hasPreviousPage
                  ? createPageUrl(
                      pagination.currentPage - 1
                    )
                  : "#"
              }
              aria-disabled={
                !pagination.hasPreviousPage
              }
              className={
                !pagination.hasPreviousPage
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>

          {(() => {
            const total = pagination.totalPages
            const current = pagination.currentPage
            const pages: (number | string)[] = []

            pages.push(1)

            if (current > 3) {
              pages.push("ellipsis-start")
            }

            const neighbors = [
              current - 1,
              current,
              current + 1,
            ].filter(
              (p) => p > 1 && p < total
            )

            pages.push(...neighbors)

            if (current < total - 2) {
              pages.push("ellipsis-end")
            }

            if (total > 1) {
              pages.push(total)
            }

            return pages.map((page, index) => {
              if (
                page === "ellipsis-start" ||
                page === "ellipsis-end"
              ) {
                return (
                  <PaginationItem
                    key={`ellipsis-${index}`}
                  >
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              }

              const pageNumber = page as number

              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href={createPageUrl(pageNumber)}
                    isActive={
                      pagination.currentPage ===
                      pageNumber
                    }
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              )
            })
          })()}

          <PaginationItem>
            <PaginationNext
              href={
                pagination.hasNextPage
                  ? createPageUrl(
                      pagination.currentPage + 1
                    )
                  : "#"
              }
              aria-disabled={!pagination.hasNextPage}
              className={
                !pagination.hasNextPage
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  )
}

export { PagePagination }