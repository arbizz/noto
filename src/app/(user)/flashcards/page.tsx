"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { categories } from "@/data/user"
import { FlashcardSet } from "@/generated/prisma/client"
import { ContentCategory, Visibility } from "@/generated/prisma/enums"
import { LucideSearch } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

type CategoryFilter = ContentCategory | "all"

type VisibilityFilter = Visibility | "all"

export default function FlashcardsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [flashcards, setFlashcards] = useState<FlashcardSet[]>([])

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

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(
        `/api/flashcards?${searchParams.toString()}`,
        { method: "GET" }
      )

      const data = await res.json()

      const { flashcards }: { flashcards: FlashcardSet[] } = data

      setFlashcards(flashcards)
    }

    fetchData()

  }, [searchParams])

  return (
    <>
      <section>
        <h1>Notes</h1>
        <p>Lorem ipsum dolor sit amet consectetur.</p>
      </section>
      <section>
        <div>
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
          />

          <Button
            type="button"
            size="icon"
            onClick={() => handleUpdateQuery({ search })}
          >
            <LucideSearch />
          </Button>
        </div>

        <div>
          <Label>Category:</Label>
          <Select
            value={category}
            onValueChange={(value) => {
              const v = value as CategoryFilter
              setCategory(v)
              handleUpdateQuery({
                category: v === "all" ? undefined : v
              })
            }}
          >
            <SelectTrigger>
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
        </div>

        <Select
          value={order}
          onValueChange={(value) => {
            const v = value as "asc" | "desc"
            setOrder(v)
            handleUpdateQuery({
              order: v === "desc" || "asc" ? v : "asc" 
            })
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Newest</SelectItem>
            <SelectItem value="desc">Oldest</SelectItem>
          </SelectContent>
        </Select>

        <div>
          <Label>Visibility:</Label>

          <RadioGroup
            value={visibility}
            onValueChange={(value) => {
              const v = value as VisibilityFilter
              setVisibility(v)
              handleUpdateQuery({ visibility: v === "all" ? undefined : v })
            }}
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
      </section>

      <section>
        {flashcards.map((f) => (
          <Card
            key={f.id}
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/flashcards/${f.id}`)}
          >
            <CardHeader>
              <CardTitle>
                {f.title}
              </CardTitle>

              <CardDescription>
                {f.description}
              </CardDescription>
            </CardHeader>

            <CardFooter>
              <span>{f.visibility}</span>
            </CardFooter>
          </Card>
        ))}
      </section>
    </>
  )
}