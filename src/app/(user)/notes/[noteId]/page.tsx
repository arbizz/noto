"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { JSONContent } from "@tiptap/react"
import { toast } from "sonner"

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
  Note,
  Visibility,
} from "@/generated/prisma/client"
import { compareProseMirrorJSON } from "@/lib/tiptap"

export default function NotePage() {
  const { noteId } = useParams()
  const router = useRouter()

  const [note, setNote] = useState<Note | undefined>()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] =
    useState<ContentCategory | undefined>()
  const [visibility, setVisibility] =
    useState<Visibility>("private")
  const [content, setContent] =
    useState<JSONContent>()

  const [initialTitle, setInitialTitle] =
    useState("")
  const [initialDescription, setInitialDescription] =
    useState("")
  const [initialCategory, setInitialCategory] =
    useState<ContentCategory | undefined>()
  const [initialVisibility, setInitialVisibility] =
    useState<Visibility>("private")
  const [initialContent, setInitialContent] =
    useState<JSONContent>()

  const [dirty, setDirty] = useState(false)
  const [renderKey, setRenderKey] = useState(0)

  useEffect(() => {
    async function fetchData() {
      if (!noteId) return

      const res = await fetch(
        `/api/notes/${noteId}`,
        { method: "GET" }
      )

      const { note: fetchedNote } =
        (await res.json()) as { note: Note }

      setNote(fetchedNote)

      setTitle(fetchedNote.title)
      setDescription(fetchedNote.description ?? "")
      setCategory(fetchedNote.category)
      setVisibility(fetchedNote.visibility)
      setContent(fetchedNote.content as JSONContent)

      setInitialTitle(fetchedNote.title)
      setInitialDescription(
        fetchedNote.description ?? ""
      )
      setInitialCategory(fetchedNote.category)
      setInitialVisibility(fetchedNote.visibility)
      setInitialContent(
        fetchedNote.content as JSONContent
      )
    }

    fetchData()
  }, [noteId])

  useEffect(() => {
    if (!content || !initialContent) {
      setDirty(false)
      return
    }

    if (
      Object.keys(content).length === 0 ||
      Object.keys(initialContent).length === 0
    ) {
      setDirty(false)
      return
    }

    const isDirty =
      title !== initialTitle ||
      description !== initialDescription ||
      category !== initialCategory ||
      visibility !== initialVisibility ||
      !compareProseMirrorJSON(
        content,
        initialContent
      )

    setDirty(isDirty)
    console.log(isDirty)
  }, [
    title,
    description,
    category,
    visibility,
    content,
    initialTitle,
    initialDescription,
    initialCategory,
    initialVisibility,
    initialContent,
  ])

  function handleCancel() {
    setTitle(initialTitle)
    setDescription(initialDescription)
    setCategory(initialCategory)
    setVisibility(initialVisibility)
    setContent(initialContent)
    setRenderKey((k) => k + 1)
  }

  async function handleUpdate() {
    if (!noteId || !dirty) return

    const res = await fetch(
      `/api/notes/${noteId}`,
      {
        method: "PATCH",
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
      }
    )

    if (res.ok) {
      const { note: updatedNote } =
        (await res.json()) as { note: Note }

      setNote(updatedNote)

      setInitialTitle(updatedNote.title)
      setInitialDescription(
        updatedNote.description ?? ""
      )
      setInitialCategory(updatedNote.category)
      setInitialVisibility(updatedNote.visibility)
      setInitialContent(
        updatedNote.content as JSONContent
      )
      setDirty(false)

      toast.success("Update success")
    } else {
      console.error("Failed to update note")
    }
  }

  async function handleDelete() {
    if (!noteId) return

    const res = await fetch(
      `/api/notes/${noteId}`,
      { method: "DELETE" }
    )

    if (res.ok) {
      toast.success("Delete success")
      router.push("/notes")
    } else {
      toast.error("Delete failed")
    }
  }

  return (
    <>
      <section
        key={renderKey}
        className="space-y-4"
      >
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
          <Label htmlFor="desc" className="ml-1">
            Description
          </Label>
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
                  .toLowerCase() as ContentCategory

                return (
                  <SelectItem
                    key={i}
                    value={cValue}
                  >
                    {c}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>

          <div className="flex gap-2 w-full">
            <Label htmlFor="vis">
              Visibility
            </Label>
            <RadioGroup
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
        {content && (
          <TiptapEditor
            key={`${noteId}-${renderKey}`}
            content={content}
            onChange={setContent}
            className="border"
          />
        )}

        <div className="flex items-center gap-3">
          <Button
            onClick={handleUpdate}
            disabled={!dirty}
          >
            Update
          </Button>

          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={!dirty}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </section>
    </>
  )
}
