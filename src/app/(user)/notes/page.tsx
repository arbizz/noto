"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Heart, LucideEye, LucideSearch } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

import { categories } from "@/data/user"
import { ContentCategory, Note, Visibility } from "@/generated/prisma/client"
import { Badge } from "@/components/ui/badge"

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

export default function NotesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [notes, setNotes] = useState<Note[]>([])
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
    return value === "asc" || value === "desc" ? value : "asc"
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
        `/api/notes?${searchParams.toString()}`,
        { method: "GET" }
      )

      const data = await res.json()

      const {
        notes,
        pagination,
      }: { notes: Note[], pagination: PaginationMeta } = data

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

      setNotes(notes)
      setPagination(pagination)
    }

    fetchData()
  }, [searchParams])

  return (
    <>
      <section className="mb-6 flex flex-col gap-1">
        <h1>Notes</h1>
        <p>Lorem ipsum dolor sit amet.</p>
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

        <div className="grid gap-4 sm:grid-cols-2">
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

          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2">
              <Label className="whitespace-nowrap">
                Created at:
              </Label>

              <RadioGroup
                value={order}
                onValueChange={(value) => {
                  const v = value as "asc" | "desc"
                  setOrder(v)
                  handleUpdateQuery({ order: v })
                }}
                className="flex"
              >
                <Label className="flex items-center gap-2">
                  <RadioGroupItem value="asc" className="p-2" />
                  Asc
                </Label>

                <Label className="flex items-center gap-2">
                  <RadioGroupItem value="desc" className="p-2" />
                  Desc
                </Label>
              </RadioGroup>
            </div>
            <div className="flex gap-2">
              <Label className="whitespace-nowrap">
                Visibilty:
              </Label>

              <RadioGroup
                value={visibility}
                onValueChange={(value) => {
                  const v = value as VisibilityFilter
                  setVisibility(v)
                  handleUpdateQuery({ visibility: v === "all" ? undefined : v })
                }}
                className="flex"
              >
                <Label className="flex items-center gap-2">
                  <RadioGroupItem value="all" />
                  All
                </Label>

                <Label className="flex items-center gap-2">
                  <RadioGroupItem value="private" />
                  Private
                </Label>

                <Label className="flex items-center gap-2">
                  <RadioGroupItem value="public" />
                  Public
                </Label>
              </RadioGroup>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((n) => (
          <Card
            key={n.id}
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/notes/${n.id}`)}
            className="
              group cursor-pointer
              transition-all
              hover:border-primary/40
              hover:shadow-md
              focus-visible:ring-2 focus-visible:ring-ring
            "
          >
            <CardHeader className="gap-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="line-clamp-2 text-base font-semibold">
                  {n.title}
                </CardTitle>
              </div>
        
              {n.description && (
                <CardDescription className="line-clamp-3 text-sm">
                  {n.description}
                </CardDescription>
              )}
            </CardHeader>
            
            <CardFooter className="flex items-center justify-between pt-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge className="capitalize">
                  {n.category.replaceAll("_", " ")}
                </Badge>
            
                <Badge
                  variant="secondary"
                  className="capitalize"
                >
                  <LucideEye />
                  {n.visibility}
                </Badge>
              </div>

              {n.visibility === "public" && <div className="flex items-center gap-1 text-muted-foreground">
                <Heart className="h-4 w-4 group-hover:text-primary transition-colors" />
                <span className="text-xs font-medium">{n.likes}</span>
              </div>}
            </CardFooter>
          </Card>
        ))}
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
