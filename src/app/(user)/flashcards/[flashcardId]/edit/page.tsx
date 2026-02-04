"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { InputMetadata, MetadataConfig } from "@/components/shared/InputMetadata"

import { ContentCategory, Visibility } from "@/generated/prisma/enums"
import { LucidePlus, LucideTrash, LucideArrowLeft } from "lucide-react"

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

export default function FlashcardUpdatePage() {
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
        setFlashcards(data.content)

        setInitialState({
          title: data.title,
          description: data.description ?? "",
          category: data.category,
          visibility: data.visibility,
          flashcards: structuredClone(data.content),
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

  function handleCancel() {
    router.push(`/flashcards/${flashcardId}`)
  }

  async function handleSave() {
    if (!dirty) return

    const hasFilledCard = flashcards.some(card => 
      card.front.trim().length > 0 || card.back.trim().length > 0
    )

    if (!hasFilledCard) {
      toast.error("At least one flashcard must be filled")
      return
    }

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
        toast.error(error.error ?? "Failed to save flashcard set")
        return
      }

      toast.success("Flashcard set saved successfully")
      router.push(`/flashcards/${flashcardId}`)
    } catch (error) {
      console.error("Error saving flashcard:", error)
      toast.error("Failed to save flashcard set")
    } finally {
      setIsSaving(false)
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

  return (
    <>
      <section className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="mb-4"
        >
          <LucideArrowLeft className="w-4 h-4 mr-2" />
          Back to View
        </Button>

        <InputMetadata metadatas={metadatas}/>
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

        <div className="flex items-center gap-3 w-full">
          <Button onClick={handleSave} disabled={!dirty || isSaving} className="flex-1">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>

          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
        </div>
      </section>
    </>
  )
}