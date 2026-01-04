"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TiptapEditor } from "@/components/user/TiptapEditor";
import { categories } from "@/data/user";
import { ContentCategory, Visibility } from "@/generated/prisma/enums";
import { JSONContent } from "@tiptap/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title, description, content, category, visibility
      })
    })
    const { id: noteId } = await res.json()

    router.push(`/notes/${noteId}`)
  }

  return (
    <>
      <section>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          type="text"
          placeholder="Untitled"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Label htmlFor="desc">Description</Label>
        <Textarea
          id="desc"
          placeholder="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
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
              const cValue = c.replaceAll(' ', '_').toLowerCase()
              return (
                <SelectItem key={i} value={cValue}>
                  {c}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        <Label htmlFor="vis">Visibility</Label>
        <RadioGroup
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
        <div>
          <Button onClick={handleCreate}>Add</Button>
        </div>
      </section>
      <section className="p-4">
        <TiptapEditor
          content={content}
          onChange={setContent}
          className="border"
        />
      </section>
    </>
  )
}