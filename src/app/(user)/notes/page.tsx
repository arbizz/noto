"use client"

import { Button } from "@/components/ui/button"
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
    return value === "asc" || value === "desc" ? value : undefined
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
        <h1>Your Notes</h1>
        <p>Lorem ipsum dolor sit amet.</p>
      </section>

      <section>
        <div className="flex">
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
        <div>
          <Select
            value={category}
            onValueChange={(value) => {
              const v = value as CategoryFilter

              setCategory(v)
              handleUpdateQuery({ category: v === "all" ? undefined : v })
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categories.map((c) => {
                const cValue = c.replaceAll(' ', '_').toLowerCase()
                return (
                  <SelectItem key={cValue} value={cValue}>
                    {c}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Created at: </Label>
          <RadioGroup value={order} onValueChange={(value) => {
            const v = value as "asc" | "desc"
            setOrder(v)
            handleUpdateQuery({order: v})
          }}>
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
      </section>
      
      <section>
        {JSON.stringify(notes)}
      </section>
    </>
  )
}