"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { JSONContent } from "@tiptap/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { TiptapEditor } from "@/components/user/TiptapEditor"

import { categories } from "@/data/user"
import {
  ContentCategory,
  Visibility,
} from "@/generated/prisma/enums"
import { Card } from "@/components/ui/card"

export default function NewNotePage() {
  const router = useRouter()

  const [content, setContent] = useState<JSONContent>({})
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<ContentCategory>()
  const [visibility, setVisibility] = useState<Visibility>("private")

  async function handleCreate() {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        content,
        category,
        visibility,
      }),
    })

    const { id: noteId } = await res.json()

    router.push(`/notes/${noteId}`)
  }

  return (
    <>
      <section className="space-y-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="title" className="ml-1">Title</Label>
          <Input
            id="title"
            type="text"
            placeholder="Untitled"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="desc" className="ml-1">Description</Label>
          <Textarea
            id="desc"
            placeholder="description"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            value={category}
            onValueChange={(value) => {
              const v = value as ContentCategory
              setCategory(v)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Category" />
            </SelectTrigger>

            <SelectContent>
              {categories.map((c, i) => {
                const cValue = c
                  .replaceAll(" ", "_")
                  .toLowerCase()

                return (
                  <SelectItem key={i} value={cValue}>
                    {c}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>

          <div className="flex gap-2 w-full">
            <Label htmlFor="vis">Visibility</Label>
            <RadioGroup
              id="vis"
              value={visibility}
              onValueChange={(value) => {
                const v = value as Visibility
                setVisibility(v)
              }}
              className="flex flex-1 justify-between"
            >
              <Label className="flex flex-1 items-center gap-2 border p-2 rounded-md shadow-xs">
                <RadioGroupItem value="private" />
                Private
              </Label>

              <Label className="flex flex-1 items-center gap-2 border p-2 rounded-md shadow-xs">
                <RadioGroupItem value="public" />
                Public
              </Label>
            </RadioGroup>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-8 mt-12">
        <TiptapEditor
          content={content}
          onChange={setContent}
          className="border"
        />

        <div>
          <Button onClick={handleCreate} className="w-full">
            Save
          </Button>  
        </div>
      </section>
    </>
  )
}
