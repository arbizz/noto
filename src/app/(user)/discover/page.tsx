"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { categories } from "@/data/user"
import { FlashcardSet, Note } from "@/generated/prisma/client"
import { ContentCategory } from "@/generated/prisma/enums"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { LucideSearch } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationEllipsis, PaginationLink, PaginationNext } from "@/components/ui/pagination"
import { NFCard } from "@/components/user/NFCard"

type CategoryFilter = ContentCategory | "all"

type PaginationMeta = {
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export default function DiscoverPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [notes, setNotes] = useState<Note[]>([])
  const [flashcards, setFlashcards] = useState<FlashcardSet[]>([])
  const [fpagination, setFPagination] = useState<PaginationMeta | null>(null)
  const [npagination, setNPagination] = useState<PaginationMeta | null>(null)

  const [search, setSearch] = useState(() => {
    return searchParams.get("search") ?? ""
  })

  const [category, setCategory] = useState<CategoryFilter>(() => {
    return searchParams.get("category") as ContentCategory ?? "all"
  })

  const [order, setOrder] = useState<"asc" | "desc">(() => {
    const value = searchParams.get("order")
    return value === "asc" || value === "desc" ? value : "desc"
  })
  
  const [type, setType] = useState<"note" | "card">("note")

  function handleUpdateQuery(
    paramsObj: Record<string, string | undefined>
  ) {
    const params = new URLSearchParams(searchParams.toString())

    for (const [key, value] of Object.entries(paramsObj)) {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    }

    router.push(`?${params.toString()}`)
  }

  function createPageUrl(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    return `?${params.toString()}`
  }

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(
        `/api/discover?${searchParams.toString()}`,
        { method: "GET" }
      )

      const data = await res.json()
      
      const {
        notes,
        flashcards,
        pagination,
      }: {
        notes: Note[],
        flashcards: FlashcardSet[],
        pagination: {
          npagination: PaginationMeta,
          fpagination: PaginationMeta
        }
      } = data

      const requestedPage = parseInt(
        searchParams.get("page") ?? "1"
      )

      if (type === "note") {
        if (
          requestedPage > pagination.npagination.totalPages &&
          pagination.npagination.totalPages > 0
        ) {
          handleUpdateQuery({
            page: String(pagination.npagination.totalPages),
          })
          return
        }
      } else {
        if (
          requestedPage > pagination.fpagination.totalPages &&
          pagination.fpagination.totalPages > 0
        ) {
          handleUpdateQuery({
            page: String(pagination.fpagination.totalPages),
          })
          return
        }
      }

      if (requestedPage < 1) {
        handleUpdateQuery({ page: "1" })
        return
      }
      
      setNotes(notes)
      setFlashcards(flashcards)
      setNPagination(pagination.npagination)
      setFPagination(pagination.fpagination)
    }

    fetchData()
  }, [searchParams, type])

  const activePagination = type === "note" ? npagination : fpagination
  return (
    <>
      <section className="mb-6 flex flex-col gap-1">
        <h1>Discover</h1>
        <p>Lorem ipsum dolor sit amet.</p>
      </section>

      <section className="mb-8 flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm">
        <Tabs value={type} onValueChange={(value) => {
          const v = value as "note" | "card"
          setType(v)
          handleUpdateQuery({ page: "1" })
        }}>
          <TabsList className="w-full">
            <TabsTrigger value="note">Notes</TabsTrigger>
            <TabsTrigger value="card">Flashcards</TabsTrigger>
          </TabsList>
          <div className="mt-6 flex flex-col gap-6">
            <div className="flex w-full gap-3">
              <Input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUpdateQuery({ search })
                  }
                }}
                className="flex-1"
              />

              <Button
                type="button"
                size="icon"
                onClick={() => handleUpdateQuery({ search })}
              >
                <LucideSearch />
              </Button>
            </div>
              
            <div className="grid grid-cols-2 w-full gap-4">
              <Select
                value={category}
                onValueChange={(value) => {
                  const v = value as CategoryFilter
                  setCategory(v)
                  handleUpdateQuery({
                    category: v === "all" ? undefined : v,
                  })
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
              
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {categories.map((c, i) => {
                    const cValue = c
                      .replaceAll(" ", "_")
                      .toLowerCase()
                  
                    return (
                      <SelectItem key={i} value={cValue}>
                        {c}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
                
              <Select
                value={order}
                onValueChange={(value) => {
                  const v = value as "asc" | "desc"
                  setOrder(v)
                  handleUpdateQuery({ order: v })
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
              
                <SelectContent>
                  <SelectItem value="desc">Newest</SelectItem>
                  <SelectItem value="asc">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="note" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
              {notes.map((n) => (
                <NFCard key={n.id} content={n} onClick={() => router.push(`/notes/${n.id}`)} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="card" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
              {flashcards.map((f) => (
                <NFCard key={f.id} content={f} onClick={() => router.push(`/flashcards/${f.id}`)} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <section className="mt-10 flex justify-center">
        {activePagination && activePagination.totalPages > 1 && (
          <Pagination>
            <PaginationContent className="gap-1">
              <PaginationItem>
                <PaginationPrevious
                  href={
                    activePagination.hasPreviousPage
                      ? createPageUrl(activePagination.currentPage - 1)
                      : "#"
                  }
                  aria-disabled={!activePagination.hasPreviousPage}
                  className={
                    !activePagination.hasPreviousPage
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {(() => {
                const total = activePagination.totalPages
                const current = activePagination.currentPage
                const pages: (number | string)[] = []

                pages.push(1)

                if (current > 3) {
                  pages.push("ellipsis-start")
                }

                const neighbors = [
                  current - 1,
                  current,
                  current + 1,
                ].filter((p) => p > 1 && p < total)

                pages.push(...neighbors)

                if (current < total - 2) {
                  pages.push("ellipsis-end")
                }

                if (total > 1) {
                  pages.push(total)
                }

                return pages.map((page, index) => {
                  if (page === "ellipsis-start" || page === "ellipsis-end") {
                    return (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }

                  const pageNumber = page as number

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href={createPageUrl(pageNumber)}
                        isActive={activePagination.currentPage === pageNumber}
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
                    activePagination.hasNextPage
                      ? createPageUrl(activePagination.currentPage + 1)
                      : "#"
                  }
                  aria-disabled={!activePagination.hasNextPage}
                  className={
                    !activePagination.hasNextPage
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </section>
    </>
  )
}