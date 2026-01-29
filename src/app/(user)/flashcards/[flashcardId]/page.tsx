"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { InputMetadata, MetadataConfig } from "@/components/shared/InputMetadata"

import { cn } from "@/lib/utils"
import { ContentCategory, Visibility } from "@/generated/prisma/enums"

interface Flashcard {
  front: string
  back: string
}

interface InitialState {
  title: string
  description: string
  category: ContentCategory
  visibility: Visibility
  flashcards: Flashcard[]
}

export default function FlashcardPage() {
  const router = useRouter()
  const { flashcardId } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<ContentCategory>("other")
  const [visibility, setVisibility] = useState<Visibility>("private")
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])

  const [initialState, setInitialState] = useState<InitialState | null>(null)
  const [dirty, setDirty] = useState(false)
  const [renderKey, setRenderKey] = useState(0)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)

      try {
        const res = await fetch(`/api/flashcards/${flashcardId}`)

        if (!res.ok) {
          toast.error("Failed to load flashcard set")
          return
        }

        const { data } = await res.json()

        setTitle(data.title)
        setDescription(data.description ?? "")
        setCategory(data.category)
        setVisibility(data.visibility)
        setFlashcards(data.flashcards)

        setInitialState({
          title: data.title,
          description: data.description ?? "",
          category: data.category,
          visibility: data.visibility,
          flashcards: structuredClone(data.flashcards),
        })
      } catch (error) {
        console.error("Error fetching flashcard data:", error)
        toast.error("Failed to load flashcard set")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [flashcardId])

  useEffect(() => {
    if (!initialState) {
      setDirty(false)
      return
    }

    const isDirty =
      title !== initialState.title ||
      description !== initialState.description ||
      category !== initialState.category ||
      visibility !== initialState.visibility ||
      JSON.stringify(flashcards) !== JSON.stringify(initialState.flashcards)

    setDirty(isDirty)
  }, [title, description, category, visibility, flashcards, initialState])

  useEffect(() => {
    if (currentIndex >= flashcards.length && flashcards.length > 0) {
      setCurrentIndex(flashcards.length - 1)
    }
  }, [flashcards.length, currentIndex])

  function updateCard(index: number, field: "front" | "back", value: string) {
    setFlashcards((prev) =>
      prev.map((card, i) => (i === index ? { ...card, [field]: value } : card))
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

  function handleCancel() {
    if (!initialState) return

    setTitle(initialState.title)
    setDescription(initialState.description)
    setCategory(initialState.category)
    setVisibility(initialState.visibility)
    setFlashcards(structuredClone(initialState.flashcards))
    setRenderKey((k) => k + 1)
    setIsFlipped(false)
  }

  async function handleSave() {
    if (!dirty) return

    setIsSaving(true)

    try {
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
        const error = await res.json()
        toast.error(error.error ?? "Failed to save changes")
        return
      }

      const { data } = await res.json()

      setInitialState({
        title: data.title,
        description: data.description ?? "",
        category: data.category,
        visibility: data.visibility,
        flashcards: structuredClone(data.flashcards),
      })

      setDirty(false)
      toast.success("Changes saved successfully")
    } catch (error) {
      console.error("Error saving flashcard:", error)
      toast.error("Failed to save changes")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!flashcardId) return

    try {
      const res = await fetch(`/api/flashcards/${flashcardId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        toast.error("Failed to delete flashcard set")
        return
      }

      toast.success("Flashcard set deleted successfully")
      router.push("/flashcards")
    } catch (error) {
      console.error("Error deleting flashcard:", error)
      toast.error("Failed to delete flashcard set")
    }
  }

  const metadatas: MetadataConfig[] = [
    {
      type: "title",
      value: title,
      onChange: setTitle,
    },
    {
      type: "description",
      value: description,
      onChange: setDescription,
    },
    {
      type: "category",
      value: category,
      onChange: setCategory,
    },
    {
      type: "visibility",
      value: visibility,
      onChange: setVisibility,
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading flashcard set...</p>
      </div>
    )
  }

  const currentCard = flashcards[currentIndex]
  if (!currentCard) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No flashcards available</p>
      </div>
    )
  }

  return (
    <>
      <section className="space-y-4">
        <InputMetadata metadatas={metadatas} />
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
                placeholder="Front of card"
              />
            </CardContent>

            <CardContent className="absolute inset-0 backface-hidden rotate-y-180 flex items-center justify-center">
              <Textarea
                value={currentCard.back}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) =>
                  updateCard(currentIndex, "back", e.target.value)
                }
                placeholder="Back of card"
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

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={!dirty || isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>

          <Button variant="outline" onClick={handleCancel} disabled={!dirty}>
            Cancel
          </Button>

          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </section>
    </>
  )
}