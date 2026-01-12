"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Flashcard {
  front: string
  back: string
}

export default function FlashcardPage() {
  const { flashcardId } = useParams()
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/flashcards/${flashcardId}`)

      if (!res.ok) {
        toast.error("Error occurred")
        return
      }

      const { flashcards } = await res.json()
      setFlashcards(flashcards)
    }

    fetchData()
  }, [flashcardId])

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
            {currentCard.front}
          </CardContent>

          <CardContent className="absolute inset-0 flex items-center justify-center backface-hidden rotate-y-180 text-lg text-muted-foreground">
            {currentCard.back}
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
    </section>
  )
}
