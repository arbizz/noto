"use client"

import { Textarea } from "@/components/ui/textarea";
import { ContentCategory, Visibility } from "@/generated/prisma/enums";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LucidePlus, LucideTrash } from "lucide-react";
import { InputMetadata, MetadataConfig } from "@/components/shared/InputMetadata";

interface Flashcard {
  front: string
  back: string
}

export default function NewFlashcardPage() {
  const router = useRouter()

  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    { front: "", back: "" }
  ])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<ContentCategory>("other")
  const [visibility, setVisibility] = useState<Visibility>("private")

  function handleUpdateFCard(e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, i: number, f: "front" | "back", v: string) {
    e.preventDefault()
    setFlashcards(prev => {
      const newSet = [...prev]
      newSet[i] = {
        ...newSet[i],
        [f]: v
      }

      return newSet
    })
  }

  function handleAddFCard(e: React.FormEvent<HTMLButtonElement>) {
    e.preventDefault()
    setFlashcards((prev) => {
      return [...prev, {front: "", back: ""}]
    })
  }

  function handleDeletedFCard(e: React.FormEvent<HTMLButtonElement>, i: number) {
    e.preventDefault()
    setFlashcards(() => {
      const newSet = flashcards.filter((_, index) => index !== i)

      return newSet
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLButtonElement>) {
    const hasFilledCard = flashcards.some(card => 
      card.front.trim().length > 0 || card.back.trim().length > 0
    )

    if (!hasFilledCard) {
      toast.error("At least one flashcard must be filled")
      return
    }

    const res = await fetch("/api/flashcards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        description,
        flashcards,
        category,
        visibility
      })
    })

    const {id} = await res.json()

    if (id) {
      toast.success("Flashcard set created successfully")  
      router.push(`/flashcards/${id}`)
    }
  }

  const metadatas: MetadataConfig[] = [
    {
      type: "title",
      value: title,
      onChange: setTitle
    },
    {
      type: "description",
      value: description,
      onChange: setDescription
    },
    {
      type: "category",
      value: category,
      onChange: setCategory
    },
    {
      type: "visibility",
      value: visibility,
      onChange: setVisibility
    }
  ]

  return (
    <>
      <section className="space-y-4">
        <InputMetadata metadatas={metadatas} />
      </section>

      <section className="mt-12 space-y-4">
        <p className="-mb-4">Your set  <strong className="text-red-500">*</strong></p>
        {flashcards.map((c, i) => {
          return (
            <div
              key={i}
              className="flex flex-col max-w-4xl mx-auto border rounded-lg p-4 gap-2 relative"
            >
              <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/20">
                <span className="font-semibold text-sm text-muted-foreground">
                  Card #{i + 1}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={(e) => handleDeletedFCard(e, i)}
                >
                  <LucideTrash size={16} />
                </Button>
              </div>

              <div className="p-6 grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">
                      Front Side
                  </label>
                  <div className="relative">
                      <Textarea
                          value={c.front}
                          onChange={(e) =>
                              handleUpdateFCard(e, i, "front", e.target.value)
                          }
                          placeholder="Enter term or question..."
                          className="min-h-37.5 resize-none bg-muted/5 focus:bg-background transition-colors text-base"
                      />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">
                      Back Side
                  </label>
                  <div className="relative">
                      <Textarea
                          value={c.back}
                          onChange={(e) =>
                              handleUpdateFCard(e, i, "back", e.target.value)
                          }
                          placeholder="Enter definition or answer..."
                          className="min-h-37.5 resize-none bg-muted/5 focus:bg-background transition-colors text-base"
                      />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </section>

      <section className="flex flex-col pt-4 space-y-8 items-end justify-end">
        <Button 
          variant="outline" 
          onClick={(e) => handleAddFCard(e)}
          className="w-full h-16 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 gap-2 text-muted-foreground hover:text-primary transition-all"
        >
          <LucidePlus className="w-5 h-5" />
          Add Card
        </Button>
        <Button onClick={(e) => handleSubmit(e)} className="w-full">Save</Button>
      </section>
    </>
  )
}