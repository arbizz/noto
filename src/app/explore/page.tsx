"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ContentCategory } from "@/generated/prisma/enums"

import { NFCard } from "@/components/user/NFCard"
import { PagePagination } from "@/components/shared/PagePagination"
import { FilterConfig, InputFilter } from "@/components/shared/InputFilter"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LogIn, LucideArrowLeft } from "lucide-react"

import { CategoryFilter } from "@/types/shared/filter"
import { PaginationMeta } from "@/types/shared/pagination"
import { ContentWithExtras } from "@/types/shared/nf_extras"

// Simplified type without user interaction flags
type ExploreContent = {
  id: number
  userId: number
  contentType: "note" | "flashcard"
  title: string
  description: string | null
  content: any
  visibility: string
  category: string
  createdAt: Date | string
  updatedAt: Date | string
  user: {
    id: number
    name: string | null
    image: string | null
  }
  _count: {
    likes: number
  }
}

export default function ExplorePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [notes, setNotes] = useState<ContentWithExtras[]>([])
  const [flashcards, setFlashcards] = useState<ContentWithExtras[]>([])
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

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const res = await fetch(
          `/api/explore?${searchParams.toString()}`,
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
          notes: ContentWithExtras[]
          flashcards: ContentWithExtras[]
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
        console.error("Error fetching explore data:", error)
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
    }
  ]

  return (
    <>
      <section className="mb-6 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div>
            <h1>Explore</h1>
            <p>Discover public notes and flashcards from our community</p>
          </div>
          <div className="space-x-4">
            <Button onClick={() => router.push("/")} variant="ghost">
              <LucideArrowLeft />
              Back to landing page
            </Button>
            <Button onClick={() => router.push("/login")}>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In to Interact
            </Button>
          </div>
        </div>
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
                <p className="text-muted-foreground">No notes found</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
                {notes.map((n) => (
                  <NFCard 
                    key={n.id} 
                    content={n} 
                    onClick={() => router.push(`/explore/note-${n.id}`)}
                    showActions={false}
                    hideLike
                    hideBadge
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
                    onClick={() => router.push(`/explore/flashcard-${f.id}`)}
                    showActions={false}
                    hideLike
                    hideBadge
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