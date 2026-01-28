"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { cn } from "@/lib/utils"
import { categories } from "@/constants/user"
import { ContentCategory, Visibility } from "@/generated/prisma/enums"

interface Flashcard {
  front: string
  back: string
}

interface InitialState {
  title: string
  description: string
  category?: ContentCategory
  visibility: Visibility
  flashcards: Flashcard[]
}

export default function FlashcardPage() {
  const router = useRouter()
  const { flashcardId } = useParams<{ flashcardId: string }>()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<ContentCategory | undefined>()
  const [visibility, setVisibility] = useState<Visibility>("private")
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])

  const [initialState, setInitialState] = useState<InitialState | null>(null)

  const [dirty, setDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/flashcards/${flashcardId}`)

      if (!res.ok) {
        toast.error("Failed to load flashcards")
        return
      }

      const { data } = await res.json()
      const clonedFlashcards = structuredClone(data.flashcards)

      setTitle(data.title)
      setDescription(data.description)
      setCategory(data.category)
      setVisibility(data.visibility)
      setFlashcards(clonedFlashcards)

      setInitialState({
        title: data.title,
        description: data.description,
        category: data.category,
        visibility: data.visibility,
        flashcards: structuredClone(data.flashcards),
      })
    }

    fetchData()
  }, [flashcardId])

  useEffect(() => {
    if (!initialState) return

    const isDirty =
      title !== initialState.title ||
      description !== initialState.description ||
      category !== initialState.category ||
      visibility !== initialState.visibility ||
      JSON.stringify(flashcards) !==
        JSON.stringify(initialState.flashcards)

    setDirty(isDirty)
  }, [
    title,
    description,
    category,
    visibility,
    flashcards,
    initialState,
  ])

  useEffect(() => {
    if (currentIndex >= flashcards.length) {
      setCurrentIndex(Math.max(0, flashcards.length - 1))
    }
  }, [flashcards.length, currentIndex])

  function updateCard(
    index: number,
    field: "front" | "back",
    value: string
  ) {
    setFlashcards((prev) =>
      prev.map((card, i) =>
        i === index ? { ...card, [field]: value } : card
      )
    )
  }

  function nextCard() {
    setIsFlipped(false)
    setCurrentIndex((i) => Math.min(i + 1, flashcards.length - 1))
  }

  function prevCard() {
    setIsFlipped(false)
    setCurrentIndex((i) => Math.max(i - 1, 0))
  }

  async function handleSave() {
    try {
      setIsSaving(true)

      const res = await fetch(`/api/flashcards/${flashcardId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          category,
          visibility,
          flashcards,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Failed to save")
        return
      }

      const { data } = await res.json()

      setInitialState({
        title: data.title,
        description: data.description,
        category: data.category,
        visibility: data.visibility,
        flashcards: structuredClone(data.flashcards),
      })

      toast.success("Changes saved")
    } catch (err) {
      console.error(err)
      toast.error("Something went wrong")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!flashcardId) return

    const res = await fetch(
      `/api/flashcards/${flashcardId}`, {
        method: "DELETE"
      }
    )

    if (res.ok) {
      toast.success("nasdflk")
      router.push("/flashcards")
    } else {
      toast.error("failed")
    }
  }

  const currentCard = flashcards[currentIndex]
  if (!currentCard) return null

  return (
    <>
      <section className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <Select
          value={category}
          onValueChange={(v) =>
            setCategory(v as ContentCategory)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem
                key={c}
                value={c.replaceAll(" ", "_").toLowerCase()}
              >
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div>
          <Label>Visibility</Label>
          <RadioGroup
            value={visibility}
            onValueChange={(v) =>
              setVisibility(v as Visibility)
            }
          >
            <Label className="flex gap-2 items-center">
              <RadioGroupItem value="private" />
              Private
            </Label>
            <Label className="flex gap-2 items-center">
              <RadioGroupItem value="public" />
              Public
            </Label>
          </RadioGroup>
        </div>

        <Button
          onClick={handleSave}
          disabled={!dirty || isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </section>

      <section className="mt-10 flex flex-col items-center gap-6">
        <div
          className="w-[320px] h-52 perspective"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <Card
            className={cn(
              "relative h-full w-full cursor-pointer transition-transform duration-500",
              "transform-style-preserve-3d",
              isFlipped && "rotate-y-180"
            )}
          >
            <CardContent className="absolute inset-0 backface-hidden flex items-center justify-center">
              <Textarea
                value={currentCard.front}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) =>
                  updateCard(currentIndex, "front", e.target.value)
                }
              />
            </CardContent>

            <CardContent className="absolute inset-0 backface-hidden rotate-y-180 flex items-center justify-center">
              <Textarea
                value={currentCard.back}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) =>
                  updateCard(currentIndex, "back", e.target.value)
                }
              />
            </CardContent>
          </Card>
        </div>

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

        <p className="text-sm text-muted-foreground">
          {currentIndex + 1} / {flashcards.length}
        </p>

        <p className="text-sm">
          Dirty: <b>{dirty ? "TRUE" : "FALSE"}</b>
        </p>
        <Button variant="destructive" onClick={handleDelete}>
          Delete
        </Button>
      </section>
    </>
  )
}
