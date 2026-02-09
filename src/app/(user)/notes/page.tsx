"use client"

import Link from "next/link"
import { LucidePlus } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { NFCard } from "@/components/user/NFCard"
import { PagePagination } from "@/components/shared/PagePagination"
import { FilterConfig, InputFilter } from "@/components/shared/InputFilter"

import { PaginationMeta } from "@/types/shared/pagination"
import { ContentWithExtras } from "@/types/shared/nf_extras"
import { CategoryFilter, VisibilityFilter } from "@/types/shared/filter"

export default function NotesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [notes, setNotes] = useState<ContentWithExtras[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [search, setSearch] = useState(() => searchParams.get("search") ?? "")
  const [category, setCategory] = useState<CategoryFilter>(
    () => (searchParams.get("category") as CategoryFilter) ?? "all"
  )
  const [visibility, setVisibility] = useState<VisibilityFilter>(
    () => (searchParams.get("visibility") as VisibilityFilter) ?? "all"
  )
  const [order, setOrder] = useState<"asc" | "desc">(() => {
    const value = searchParams.get("order")
    return value === "asc" || value === "desc" ? value : "desc"
  })

  const handleUpdateQuery = useCallback((
    paramsObj: Record<string, string | undefined>
  ) => {
    const params = new URLSearchParams(searchParams.toString())

    for (const [key, value] of Object.entries(paramsObj)) {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    }

    router.push(`?${params.toString()}`)
  }, [searchParams, router])

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)

      try {
        const res = await fetch(
          `/api/notes?${searchParams.toString()}`,
          { method: "GET" }
        )

        const data = await res.json()
        const {
          notes,
          pagination,
        }: { notes: ContentWithExtras[]; pagination: PaginationMeta } = data

        const requestedPage = parseInt(searchParams.get("page") ?? "1")

        if (
          requestedPage > pagination.totalPages &&
          pagination.totalPages > 0
        ) {
          handleUpdateQuery({ page: String(pagination.totalPages) })
          return
        }

        if (requestedPage < 1) {
          handleUpdateQuery({ page: "1" })
          return
        }

        setNotes(notes)
        setPagination(pagination)
      } catch (error) {
        console.error("Error fetching notes data:", error)
        setNotes([])
        setPagination(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [searchParams, handleUpdateQuery])

  const filters: FilterConfig[] = [
    {
      type: "search",
      placeholder: "Search",
      value: search,
      onChange: setSearch,
      onSearch: () => handleUpdateQuery({ search }),
    },
    {
      type: "category",
      placeholder: "Category",
      value: category,
      onChange: (value) => {
        const v = value as CategoryFilter
        setCategory(v)
        handleUpdateQuery({
          category: v === "all" ? undefined : v,
        })
      },
    },
    {
      type: "order",
      placeholder: "Order",
      value: order,
      onChange: (value) => {
        setOrder(value)
        handleUpdateQuery({ order: value })
      },
    },
    {
      type: "visibility",
      value: visibility,
      onChange: (value) => {
        const v = value as VisibilityFilter
        setVisibility(v)
        handleUpdateQuery({
          visibility: v === "all" ? undefined : v,
        })
      },
    },
  ]

  return (
    <>
      <section className="mb-6 flex flex-col gap-1">
        <h1>Notes</h1>
        <p>Lorem ipsum dolor sit amet.</p>
      </section>

      <section className="mb-8 flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm">
        <InputFilter
          filters={filters}
          showSearch
          showCategory
          showVisibility
          showOrder
        />
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <Button asChild>
            <Link href="/notes/new">
              Add
              <LucidePlus />
            </Link>
          </Button>
        </div>

        <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NFCard
              key={note.id}
              content={note}
              onClick={() => router.push(`/notes/${note.id}`)}
              showActions={false}
              showLikeOnly={true}
            />
          ))}
        </div>
      </section>

      <section className="mt-10 flex justify-center">
        {pagination && pagination.totalPages > 1 && !isLoading && (
          <PagePagination
            pagination={pagination}
            searchParams={searchParams}
          />
        )}
      </section>
    </>
  )
}