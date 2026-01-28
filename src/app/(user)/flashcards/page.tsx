"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LucidePlus, LucideSearch } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import { categories } from "@/constants/user"
import { FlashcardSet } from "@/generated/prisma/client"
import { ContentCategory, Visibility } from "@/generated/prisma/enums"
import Link from "next/link"
import { NFCard } from "@/components/user/NFCard"

type CategoryFilter = ContentCategory | "all"

type VisibilityFilter = Visibility | "all"

type PaginationMeta = {
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export default function FlashcardsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [flashcards, setFlashcards] = useState<FlashcardSet[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)

  const [search, setSearch] = useState(() => {
    return searchParams.get("search") ?? ""
  })

  const [category, setCategory] = useState<CategoryFilter>(() => {
    return searchParams.get("category") as ContentCategory ?? "all"
  })

  const [visibility, setVisibility] = useState<VisibilityFilter>(() => {
    return searchParams.get("visibility") as VisibilityFilter ?? "all"
  })

  const [order, setOrder] = useState<"asc" | "desc">(() => {
    const value = searchParams.get("order")
    return value === "asc" || value === "desc" ? value : "desc"
  })

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
        `/api/flashcards?${searchParams.toString()}`,
        { method: "GET" }
      )

      const data = await res.json()

      const {
        flashcards,
        pagination,
      }: { flashcards: FlashcardSet[], pagination: PaginationMeta } = data

      const requestedPage = parseInt(
        searchParams.get("page") ?? "1"
      )

      if (
        requestedPage > pagination.totalPages &&
        pagination.totalPages > 0
      ) {
        handleUpdateQuery({
          page: String(pagination.totalPages),
        })
        return
      }

      if (requestedPage < 1) {
        handleUpdateQuery({ page: "1" })
        return
      }

      setFlashcards(flashcards)
      setPagination(pagination)
    }

    fetchData()

  }, [searchParams])

  return (
    <>
      <section className="mb-6 flex flex-col gap-1">
        <h1>Flashcards</h1>
        <p>Lorem ipsum dolor sit amet consectetur.</p>
      </section>

      <section className="mb-8 flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm">
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

        <div className="grid grid-cols-3 w-full gap-4">
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

          <div className="flex w-full justify-between gap-2">
            <Label className="whitespace-nowrap">
              Visibility:
            </Label>

            <RadioGroup
              value={visibility}
              onValueChange={(value) => {
                const v = value as VisibilityFilter
                setVisibility(v)
                handleUpdateQuery({ visibility: v === "all" ? undefined : v })
              }}
              className="flex flex-1 justify-between"
            >
              <Label className="flex items-center gap-2 border p-2 rounded-md shadow-xs w-full">
                <RadioGroupItem value="all" />
                All
              </Label>

              <Label className="flex items-center gap-2 border p-2 rounded-md shadow-xs w-full">
                <RadioGroupItem value="private" />
                Private
              </Label>

              <Label className="flex items-center gap-2 border p-2 rounded-md shadow-xs w-full">
                <RadioGroupItem value="public" />
                Public
              </Label>
            </RadioGroup>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <Button asChild>
              <Link href="/flashcards/new">
                Add
                <LucidePlus />
              </Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
          {flashcards.map((f) => (
            <NFCard key={f.id} content={f} onClick={() => router.push(`/flashcards/${f.id}`)} />
          ))}
        </div>
      </section>

      <section className="mt-10 flex justify-center">
        {pagination && pagination.totalPages > 1 && (
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
        )}
      </section>
    </>
  )
}