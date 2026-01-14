"use client"

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { categories } from "@/data/user";
import { ContentCategory, Visibility } from "@/generated/prisma/enums";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideTrash } from "lucide-react";
import { toast } from "sonner";

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
  const [category, setCategory] = useState<ContentCategory>()
  const [visibility, setVisibility] = useState<Visibility>("private")

  function handleUpdateFCard(e: React.FormEvent<HTMLTextAreaElement>, i: number, f: "front" | "back", v: string) {
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

  return (
    <>
      <section>
        <h1>Flashcards</h1>
        <p>lorem ipsum</p>
      </section>
      <section>
        <form>
          <div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                placeholder="Untitled"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                placeholder="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
          </div>
          <div>
            {flashcards.map((c, i) => {
              return (
                <div key={i}>
                  <Card>
                    <CardAction>
                      {flashcards.length > 1 && 
                        <Button variant="destructive" size="icon" onClick={(e) => handleDeletedFCard(e, i)}>
                          <LucideTrash />
                        </Button>
                      }
                    </CardAction>
                    <Textarea
                      value={c.front}
                      onChange={(e) => handleUpdateFCard(e, i, "front" , e.target.value)}
                    />
                  </Card>

                  <Card>
                    <Textarea
                      value={c.back}
                      onChange={(e) => handleUpdateFCard(e, i, "back" , e.target.value)}
                    />
                  </Card>
                </div>
              )
            })}
          </div>
          <div>
            <Button variant="outline" onClick={(e) => handleAddFCard(e)}>Add</Button>
            <Button onClick={(e) => handleSubmit(e)}>Save</Button>
          </div>
        </form>
      </section>

      <section>
        {JSON.stringify(flashcards)}
      </section>
    </>
  )
}