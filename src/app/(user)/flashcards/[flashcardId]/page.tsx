"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"
import { ContentCategory, Visibility } from "@/generated/prisma/enums"
import { LucideEdit, LucideTrash, LucideRepeat } from "lucide-react"

interface Flashcard {
  front: string
  back: string
}

export default function FlashcardViewPage() {
  const router = useRouter()
  const { flashcardId } = useParams()
  const [isLoading, setIsLoading] = useState(true)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<ContentCategory>("other")
  const [visibility, setVisibility] = useState<Visibility>("private")
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])

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
        setDescription(data.description)
        setCategory(data.category)
        setVisibility(data.visibility)
        setFlashcards(data.content)
      } catch (error) {
        console.error("Error fetching flashcard data:", error)
        toast.error("Failed to load flashcard set")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [flashcardId])

  function nextCard() {
    setIsFlipped(false)
    setCurrentIndex((i) => Math.min(i + 1, (flashcards.length || 1) - 1))
  }

  function prevCard() {
    setIsFlipped(false)
    setCurrentIndex((i) => Math.max(i - 1, 0))
  }

  async function handleDelete() {
    if (!flashcardId) return

    const confirmed = confirm("Are you sure you want to delete this flashcard set?")
    if (!confirmed) return

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading flashcard set...</p>
      </div>
    )
  }

  const currentCard = flashcards[currentIndex]

  return (
    <>
      <section className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <h1 className="text-3xl font-bold">{title}</h1>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push(`/flashcards/${flashcardId}/edit`)}>
              <LucideEdit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <LucideTrash className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="px-2 py-1 bg-muted rounded-md capitalize">
            {category.replace(/_/g, " ")}
          </span>
          <span className="px-2 py-1 bg-muted rounded-md capitalize">
            {visibility}
          </span>
        </div>
      </section>

      <section className="mt-10 flex flex-col items-center gap-6">
        <div 
          className="w-full max-w-2xl h-80 cursor-pointer"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <Card 
            className={cn(
              "h-full w-full flex items-center justify-center transition-colors duration-200 hover:bg-muted/30 border-2",
              isFlipped ? "border-primary/50 bg-muted/10" : "border-border"
            )}
          >
            <CardContent className="text-center p-8 w-full">
              <div className="flex flex-col items-center gap-4">
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider",
                  isFlipped 
                    ? "bg-primary/10 text-primary" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {isFlipped ? "Answer / Back" : "Question / Front"}
                </span>

                <p className="text-2xl font-medium whitespace-pre-wrap animate-in fade-in zoom-in-95 duration-200 key={isFlipped ? 'back' : 'front'}">
                  {isFlipped ? currentCard.back : currentCard.front}
                </p>

                <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1 opacity-70">
                  <LucideRepeat className="w-3 h-3" />
                  Click card to {isFlipped ? "see question" : "reveal answer"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={prevCard}
            disabled={currentIndex === 0}
            size="lg"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={nextCard}
            disabled={currentIndex === flashcards.length - 1}
            size="lg"
          >
            Next
          </Button>
        </div>

        <p className="text-lg font-semibold">
          {currentIndex + 1} / {flashcards.length}
        </p>
      </section>
    </>
  )
}