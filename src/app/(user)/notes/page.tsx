"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LucideSearch } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { categories } from "@/data/user"
import { ContentCategory, Note } from "@/generated/prisma/client"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

type CategoryFilter = ContentCategory | "all"

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
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "")
  const [category, setCategory] = useState<CategoryFilter>(() => {
    return (searchParams.get("category") as ContentCategory) ?? "all"
  })
  const [order, setOrder] = useState<"asc" | "desc">(() => {
    const value = searchParams.get("order")
    return value === "asc" || value === "desc" ? value : "asc"
  })

  const [page, setPage] = useState(() => {
    return searchParams.get("page") ?? "1"
  })

  function handleUpdateQuery(paramsObj: Record<string, string | undefined>) {
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
      const res = await fetch(`/api/notes?${searchParams.toString()}`, {
        method: "GET",
      })

      const data = await res.json()
      const { notes, pagination }: { notes: Note[], pagination: PaginationMeta } = data

      const requestedPage = parseInt(searchParams.get("page") ?? "1")

      if (requestedPage > pagination.totalPages && pagination.totalPages > 0) {
        handleUpdateQuery({ page: String(pagination.totalPages) })
        return
      }

      if (requestedPage < 1) {
        handleUpdateQuery({ page: "1" })
    }

      setNotes(notes)
      setPagination(pagination)
    }

    fetchData()
  }, [searchParams])

  return (
    <>
      <section>
        <h1>Notes</h1>
        <p>Lorem ipsum dolor sit amet.</p>
      </section>
      <section className="flex flex-col gap-4 mb-8 rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex w-full gap-4">
          <Input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if(e.key === "Enter") {
                handleUpdateQuery({ search })
              }
            }}
          />
          <Button
            type="button"
            size="icon"
            onClick={() => handleUpdateQuery({ search })}
          >
            <LucideSearch />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            value={category}
            onValueChange={(value) => {
              const v = value as CategoryFilter

              setCategory(v)
              handleUpdateQuery({ category: v === "all" ? undefined : v })
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categories.map((c, i) => {
                const cValue = c.replaceAll(' ', '_').toLowerCase()
                return (
                  <SelectItem key={i} value={cValue}>
                    {c}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <div className="flex">
            <Label>Created at: </Label>
            <RadioGroup
              value={order}
              onValueChange={(value) => {
                const v = value as "asc" | "desc"
                setOrder(v)
                handleUpdateQuery({order: v})
              }}
              className="flex"
            >
              <Label>
                <RadioGroupItem value="asc" />
                Asc
              </Label>
              <Label>
                <RadioGroupItem value="desc" />
                Desc
              </Label>
            </RadioGroup>
          </div>
        </div>
      </section>
      <section className="grid grid-cols-2 p-4 gap-4">
        {notes.map((n) => (
          <Card key={n.id}>
            <CardHeader>
              <CardTitle>{n.title}</CardTitle>
              <CardDescription>{n.description}</CardDescription>
              <Separator />
            </CardHeader>
            <CardFooter className="flex justify-between">
              <div className="flex">
                <span>{n.category}</span>
                <span>{n.visibility}</span>
              </div>
              <div className="flex">
                <span>{n.likes}</span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </section>
      <section className="flex justify-center mt-8">
        {pagination && pagination.totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href={pagination.hasPreviousPage ? createPageUrl(pagination.currentPage - 1) : "#"}
                  aria-disabled={!pagination.hasPreviousPage}
                  className={!pagination.hasPreviousPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {(() => {
                const total = pagination.totalPages
                const current = pagination.currentPage
                
                const pages = []
                
                pages.push(1)

                if (current > 3) {
                  pages.push("ellipsis-start")
                }

                const neighbors = [current - 1, current, current + 1]
                  .filter(p => p > 1 && p < total)
                
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
                        isActive={pagination.currentPage === pageNumber}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })
              })()}
              <PaginationItem>
                <PaginationNext 
                  href={pagination.hasNextPage ? createPageUrl(pagination.currentPage + 1) : "#"}
                  aria-disabled={!pagination.hasNextPage}
                  className={!pagination.hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </section>
    </>
  )
}