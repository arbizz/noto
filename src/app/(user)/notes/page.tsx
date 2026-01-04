"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { categories } from "@/data/user"
import { ContentCategory, Note } from "@/generated/prisma/client"
import { LucideSearch } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

type CategoryFilter = ContentCategory | "all"

export default function NotesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [notes, setNotes] = useState<Note[]>([])

  const [search, setSearch] = useState(() => {
    return searchParams.get("search") ?? ""
  })
  const [category, setCategory] = useState<CategoryFilter>(() => {
    return (
      (searchParams.get("category") as ContentCategory) ?? "all"
    )
  })
  const [order, setOrder] = useState<"asc" | "desc" | undefined>(() => {
    const value = searchParams.get("order")
    return value === "asc" || value === "desc" ? value : "asc"
  })  

  function handleUpdateQuery(paramsObj: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString())

    for (const [key, value] of Object.entries(paramsObj)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }

    router.push(`?${params.toString()}`)
  }

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/notes?${searchParams.toString()}`, {
        method: "GET",
        credentials: "include",
      })

      const { notes }: { notes: Note[] } = await res.json()
      setNotes(notes)
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
    </>
  )
}