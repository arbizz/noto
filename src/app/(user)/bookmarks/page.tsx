"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FlashcardSet, Note } from "@/generated/prisma/client"
import { ContentCategory } from "@/generated/prisma/enums"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { NFCard } from "@/components/user/NFCard"
import { toast } from "sonner"
import { FilterConfig, InputFilter } from "@/components/shared/InputFilter"
import { PagePagination } from "@/components/shared/PagePagination"

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

export default function BookmarksPage() {
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
          `/api/bookmarks?${searchParams.toString()}`,
          { method: "GET" }
        )

        if (!res.ok) {
          throw new Error("Failed to fetch bookmarks")
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
        console.error("Error fetching bookmarks:", error)
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

  const filters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search",
      value: search,
      onChange: setSearch,
      onSearch: () => handleUpdateQuery({ search: search || undefined, page: "1" }),
    },
    {
      type: "category",
      placeholder: "Category",
      value: category,
      onChange: (value) => {
        const v = value as CategoryFilter
        setCategory(v)
        handleUpdateQuery({ category: v === "all" ? undefined : v, page: "1" })
      }
    },
    {
      type: "order",
      placeholder: "Order",
      value: order,
      onChange: (value) => {
        const v = value as "asc" | "desc"
        setOrder(v)
        handleUpdateQuery({ order: v, page: "1" })
      },
    },
  ]

  return (
    <>
      <section className="mb-6 flex flex-col gap-1">
        <h1>Bookmarks</h1>
        <p>Your saved notes and flashcards</p>
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

          <InputFilter
            filters={filters}
            showSearch
            showCategory
            showOrder
          />

          <TabsContent value="note" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : notes.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">No bookmarked notes found</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
                {notes.map((n) => (
                  <NFCard 
                    key={n.id} 
                    content={n} 
                    onClick={() => router.push(`/notes/${n.id}`)}
                    onLike={(e) => handleToggleLike(n.id, "note", e)}
                    showActions={true}
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
                <p className="text-muted-foreground">No bookmarked flashcards found</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
                {flashcards.map((f) => (
                  <NFCard 
                    key={f.id} 
                    content={f} 
                    onClick={() => router.push(`/flashcards/${f.id}`)}
                    onLike={(e) => handleToggleLike(f.id, "flashcard", e)}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      <section className="mt-10 flex justify-center">
        {activePagination && activePagination.totalPages > 1 && !isLoading && (
          <PagePagination
            pagination={activePagination}
            searchParams={searchParams}
          />
        )}
      </section>
    </>
  )
}