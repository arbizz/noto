"use client"

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { categories } from "@/constants/user";
import { ContentCategory, Visibility } from "@/generated/prisma/enums";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LucideChevronLeft, LucideChevronRight, LucideRotateCcw, LucideTrash, Trash2 } from "lucide-react";
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

  // const [currentIndex, setCurrentIndex] = useState(0);
  // const [isFlipped, setIsFlipped] = useState(false);

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
    // if (flashcards.length > 1) {
    //   setFlashcards(flashcards.filter((_, index) => index !== i));
    //   if (currentIndex >= flashcards.length - 1) {
    //     setCurrentIndex(Math.max(0, flashcards.length - 2));
    //   }
    //   setIsFlipped(false);
    // }
  }

  // function handleNextCard(e: React.MouseEvent) {
  //   e.preventDefault();
  //   setIsFlipped(false);
  //   setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  // }

  // function handlePrevCard(e: React.MouseEvent) {
  //   e.preventDefault();
  //   setIsFlipped(false);
  //   setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  // };

  // function handleToggleFlip(e: React.MouseEvent) {
  //   e.preventDefault();
  //   setIsFlipped(!isFlipped);
  // }

  async function handleSubmit(e: React.FormEvent<HTMLButtonElement>) {
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

    if (id) toast.success("Created")
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
        {flashcards.map((c, i) => {
          return (
            <div
              key={i}
              className="flex flex-col max-w-4xl mx-auto border rounded-lg p-4 gap-2 relative"
            >
              <span className="flex items-center justify-between text-muted-foreground mx-1.5">
                Number {i + 1}
                <Button variant="ghost" size="icon" onClick={(e) => handleDeletedFCard(e, i)}>
                  <LucideTrash size={18} className="text-destructive" />
                </Button>
              </span>
              <div className="grid grid-cols-2 gap-4 w-full">
                <Textarea
                  value={c.front}
                  onChange={(e) =>
                    handleUpdateFCard(e, i, "front", e.target.value)
                  }
                  placeholder="Front side"
                  className="h-48 text-center text-lg font-medium resize-none"
                />
                <Textarea
                  value={c.back}
                  onChange={(e) =>
                    handleUpdateFCard(e, i, "back", e.target.value)
                  }
                  placeholder="Back side"
                  className="h-48 text-center text-lg font-medium resize-none"
                />
              </div>
            </div>
          )
        })}
      </section>

      <section>
        <div>
          <Button variant="outline" onClick={(e) => handleAddFCard(e)}>Add</Button>
          <Button onClick={(e) => handleSubmit(e)}>Save</Button>
        </div>
      </section>
    </>
  )
}