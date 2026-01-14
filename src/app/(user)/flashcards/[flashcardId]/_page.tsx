"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { ContentCategory, Visibility } from "@/generated/prisma/enums"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { categories } from "@/data/user"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface Flashcard {
  front: string
  back: string
}

export default function FlashcardPage() {
  const { flashcardId } = useParams()

  const [title, setTitle] =
    useState("")
  const [description, setDescription] =
    useState("")
  const [category, setCategory] =
    useState<ContentCategory | undefined>()
  const [visibility, setVisibility] =
    useState<Visibility>("private")
  const [flashcards, setFlashcards] =
    useState<Flashcard[]>([])

  const [initialTitle, setInitialTitle] =
    useState("")
  const [initialDescription, setInitialDescription] =
    useState("")
  const [initialCategory, setInitialCategory] =
    useState<ContentCategory | undefined>()
  const [initialVisibility, setInitialVisibility] =
    useState<Visibility>("private")
  const [initialFlashcards, setInitialFlashcards] =
    useState<Flashcard[]>([])

  const [dirty, setDirty] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(
        `/api/flashcards/${flashcardId}`,
        { method: "GET" }
      )

      if (!res.ok) {
        toast.error("Error occurred")
        return
      }

      const { data, error, message } = (await res.json())

      console.log(`data: ${JSON.stringify(data)}, err: ${JSON.stringify(error)}, mess: ${JSON.stringify(message)}`)

      setTitle(data.title)
      setDescription(data.description)
      setCategory(data.category)
      setVisibility(data.visibility)
      setFlashcards(structuredClone(data.flashcards))
      
      setInitialTitle(data.title)
      setInitialDescription(data.description)
      setInitialCategory(data.category)
      setInitialVisibility(data.visibility)
      setInitialFlashcards(structuredClone(data.flashcards))
    }

    fetchData()
  }, [flashcardId])

  useEffect(() => {
    if (!flashcards || !initialFlashcards) {
      setDirty(false)
      return
    }

    const isDirty =
      title !== initialTitle ||
      description !== initialDescription ||
      category !== initialCategory ||
      visibility !== initialVisibility ||
      JSON.stringify(flashcards) !== JSON.stringify(initialFlashcards)
    
    setDirty(isDirty)
  }, [
    title,
    description,
    category,
    visibility,
    flashcards,
    initialTitle,
    initialDescription,
    initialCategory,
    initialVisibility,
    initialFlashcards
  ])

  function handleUpdateFCard(idx: number, f: "front" | "back", v: string, e: React.FormEvent<HTMLTextAreaElement>) {
    setFlashcards(prev => {
      e.preventDefault()
      const copy = [...prev]
      copy[idx] = {
        ...copy[idx],
        [f]: v
      }

      return copy
    })
  }

  const currentCard = flashcards[currentIndex]

  function nextCard() {
    setIsFlipped(false)
    setCurrentIndex((i) => Math.min(i + 1, flashcards.length - 1))
  }

  function prevCard() {
    setIsFlipped(false)
    setCurrentIndex((i) => Math.max(i - 1, 0))
  }

  if (!currentCard) return null

  return (
    <>
      <section>
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            type="text"
            placeholder="Untitled"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />
        </div>

        <div>
          <Label htmlFor="desc">Description</Label>
          <Textarea
            id="desc"
            placeholder="description"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />
        </div>

        <Select
          value={category}
          onValueChange={(value) => {
            const v = value as ContentCategory
            setCategory(v)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>

          <SelectContent>
            {categories.map((c, i) => {
              const value = c
                .replaceAll(" ", "_")
                .toLowerCase()

              return (
                <SelectItem key={i} value={value}>
                  {c}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>

        <div>
          <Label htmlFor="vis">Visibility</Label>
          <RadioGroup
            id="vis"
            value={visibility}
            onValueChange={(value) => {
              const v = value as Visibility
              setVisibility(v)
            }}
          >
            <Label>
              <RadioGroupItem value="private" />
              Private
            </Label>
          
            <Label>
              <RadioGroupItem value="public" />
              Public
            </Label>
          </RadioGroup>
        </div>
      </section>
      <section className="flex flex-col items-center gap-6">
        {/* CARD */}
        <div
          className="w-[320px] h-50 perspective"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <Card
            className={cn(
              "relative h-full w-full cursor-pointer transition-transform duration-500",
              "transform-style-preserve-3d",
              isFlipped && "rotate-y-180"
            )}
          >
            <CardContent className="absolute inset-0 flex items-center justify-center backface-hidden text-xl font-semibold">
              <Textarea
                value={currentCard.front}
                onChange={(e) => handleUpdateFCard(currentIndex, "front", e.target.value, e)}
              />
            </CardContent>

            <CardContent className="absolute inset-0 flex items-center justify-center backface-hidden rotate-y-180 text-lg text-muted-foreground">
              <Textarea
                value={currentCard.back}
                onChange={(e) => handleUpdateFCard(currentIndex, "back", e.target.value, e)}
              />
            </CardContent>
          </Card>
        </div>

        {/* CONTROLS */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={prevCard}
            disabled={currentIndex === 0}
          >
            Previous
          </Button>

          <Button
            variant="outline"
            onClick={nextCard}
            disabled={currentIndex === flashcards.length - 1}
          >
            Next
          </Button>
        </div>

        {/* INDICATOR */}
        <p className="text-sm text-muted-foreground">
          {currentIndex + 1} / {flashcards.length}
        </p>

        <p>{JSON.stringify(flashcards)}</p>
        <p>{JSON.stringify(dirty)}</p>
      </section>
    </>
  )
}
