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
import { toast } from "sonner"

type CategoryFilter = ContentCategory | "all"

type PaginationMeta = {
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

type NoteWithUser = Note & {
  user: {
    id: number
    name: string
    image: string | null
  }
  _count: {
    likes: number
  }
  isBookmarked: boolean
  isLiked: boolean
}

type FlashcardSetWithUser = FlashcardSet & {
  user: {
    id: number
    name: string
    image: string | null
  }
  _count: {
    likes: number
  }
  isBookmarked: boolean
  isLiked: boolean
}

export default function DiscoverPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [notes, setNotes] = useState<NoteWithUser[]>([])
  const [flashcards, setFlashcards] = useState<FlashcardSetWithUser[]>([])
  const [fpagination, setFPagination] = useState<PaginationMeta | null>(null)
  const [npagination, setNPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [search, setSearch] = useState(() => {
    return searchParams.get("search") ?? ""
  })

  const [category, setCategory] = useState<CategoryFilter>(() => {
    const cat = searchParams.get("category")
    return (cat && Object.values(ContentCategory).includes(cat as ContentCategory))
      ? (cat as ContentCategory)
      : "all"
  })

  const [order, setOrder] = useState<"asc" | "desc">(() => {
    const value = searchParams.get("order")
    return value === "asc" ? "asc" : "desc"
  })
  
  const [type, setType] = useState<"note" | "card">(() => {
    const typeParam = searchParams.get("type")
    return typeParam === "card" ? "card" : "note"
  })

  function handleUpdateQuery(paramsObj: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString())

    for (const [key, value] of Object.entries(paramsObj)) {
      if (value !== undefined && value !== "") {
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

  async function handleToggleBookmark(
    contentId: number,
    contentType: "note" | "flashcard",
    e: React.MouseEvent
  ) {
    e.stopPropagation()

    try {
      const res = await fetch("/api/bookmarks/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contentId,
          contentType
        })
      })

      if (!res.ok) {
        throw new Error("Failed to toggle bookmark")
      }

      const data = await res.json()

      if (contentType === "note") {
        setNotes(prev =>
          prev.map(note =>
            note.id === contentId
              ? { ...note, isBookmarked: data.isBookmarked }
              : note
          )
        )
      } else {
        setFlashcards(prev =>
          prev.map(flashcard =>
            flashcard.id === contentId
              ? { ...flashcard, isBookmarked: data.isBookmarked }
              : flashcard
          )
        )
      }

      const notif = data.isBookmarked ? "Bookmarked" : "Bookmark removed"
      toast(notif, {
        description: data.message
      })
    } catch (error) {
      console.error("Error toggling bookmark:", error)
      toast.error("Error toggling bookmark")
    }
  }

  async function handleToggleLike(
    contentId: number,
    contentType: "note" | "flashcard",
    e: React.MouseEvent
  ) {
    e.stopPropagation()

    try {
      const res = await fetch("/api/likes/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contentId,
          contentType
        })
      })

      if (!res.ok) {
        throw new Error("Failed to toggle like")
      }

      const data = await res.json()

      if (contentType === "note") {
        setNotes(prev =>
          prev.map(note =>
            note.id === contentId
              ? { 
                  ...note, 
                  isLiked: data.isLiked,
                  _count: {
                    ...note._count,
                    likes: note._count.likes + (data.isLiked ? 1 : -1)
                  }
                }
              : note
          )
        )
      } else {
        setFlashcards(prev =>
          prev.map(flashcard =>
            flashcard.id === contentId
              ? { 
                  ...flashcard, 
                  isLiked: data.isLiked,
                  _count: {
                    ...flashcard._count,
                    likes: flashcard._count.likes + (data.isLiked ? 1 : -1)
                  }
                }
              : flashcard
          )
        )
      }

      const notif = data.isLiked ? "Liked" : "Like removed"
      toast(notif, {
        description: data.message
      })
    } catch (error) {
      console.error("Error toggling like:", error)
      toast.error("Error toggling like")
    }
  }

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const res = await fetch(
          `/api/discover?${searchParams.toString()}`,
          { method: "GET" }
        )

        if (!res.ok) {
          throw new Error("Failed to fetch data")
        }

        const data = await res.json()
        
        const {
          notes,
          flashcards,
          pagination,
        }: {
          notes: NoteWithUser[]
          flashcards: FlashcardSetWithUser[]
          pagination: {
            npagination: PaginationMeta
            fpagination: PaginationMeta
          }
        } = data

        const requestedPage = parseInt(searchParams.get("page") ?? "1")

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
      } catch (error) {
        console.error("Error fetching discover data:", error)
        setNotes([])
        setFlashcards([])
        setNPagination(null)
        setFPagination(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [searchParams])

  const activePagination = type === "note" ? npagination : fpagination

  return (
    <>
      <section className="mb-6 flex flex-col gap-1">
        <h1>Discover</h1>
        <p>Explore public notes and flashcards from the community</p>
      </section>

      <section className="mb-8 flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm">
        <Tabs 
          value={type} 
          onValueChange={(value) => {
            const v = value as "note" | "card"
            setType(v)
            handleUpdateQuery({ type: v, page: "1" })
          }}
        >
          <TabsList className="w-full">
            <TabsTrigger value="note">Notes</TabsTrigger>
            <TabsTrigger value="card">Flashcards</TabsTrigger>
          </TabsList>

          <div className="mt-6 flex flex-col gap-6">
            <div className="flex w-full gap-3">
              <Input
                type="text"
                placeholder="Search by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUpdateQuery({ search: search || undefined, page: "1" })
                  }
                }}
                className="flex-1"
              />

              <Button
                type="button"
                size="icon"
                onClick={() => handleUpdateQuery({ search: search || undefined, page: "1" })}
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
                    page: "1"
                  })
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
              
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
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
                  handleUpdateQuery({ order: v, page: "1" })
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
              
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="note" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : notes.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">No notes found</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
                {notes.map((n) => (
                  <NFCard 
                    key={n.id} 
                    content={n} 
                    onClick={() => router.push(`/notes/${n.id}`)}
                    onBookmark={(e) => handleToggleBookmark(n.id, "note", e)}
                    onLike={(e) => handleToggleLike(n.id, "note", e)}
                    showBookmark
                    showLike
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="card" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : flashcards.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">No flashcards found</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
                {flashcards.map((f) => (
                  <NFCard 
                    key={f.id} 
                    content={f} 
                    onClick={() => router.push(`/flashcards/${f.id}`)}
                    onBookmark={(e) => handleToggleBookmark(f.id, "flashcard", e)}
                    onLike={(e) => handleToggleLike(f.id, "flashcard", e)}
                    showBookmark
                    showLike
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      {activePagination && activePagination.totalPages > 1 && !isLoading && (
        <section className="mt-10 flex justify-center">
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
      </section>
    )}
  </>
)}