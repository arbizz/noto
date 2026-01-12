"use client"

import { Card } from "@/components/ui/card"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface Flashcard {
  front: string
  back: string
}

export default function FlashcardPage() {
  const { flashcardId } = useParams()

  const [flashcards, setFlashcards] = useState<Flashcard[]>([])

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(
        `/api/flashcards/${flashcardId}`,
        { method: "GET" }
      )

      if (!res.ok) {
        toast.error("Error occurred")
      }

      const { flashcards } = (await res.json())
      console.log(JSON.stringify(flashcards))
      setFlashcards(flashcards)
    }

    fetchData()
  },[flashcardId])

  return (
    <>
      <section>
        {flashcards && flashcards.map((f, i) => {
          return (
            <Card key={i}>
              Front: {f.front}
              Back: {f.back}
            </Card>
          )
        })}
      </section>
    </>
  )
}