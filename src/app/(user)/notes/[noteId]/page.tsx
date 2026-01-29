"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { JSONContent } from "@tiptap/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { TiptapEditor } from "@/components/user/TiptapEditor"
import { InputMetadata, MetadataConfig } from "@/components/shared/InputMetadata"

import { ContentCategory, Visibility } from "@/generated/prisma/client"
import { compareProseMirrorJSON } from "@/lib/tiptap"

interface InitialState {
  title: string
  description: string
  category: ContentCategory
  visibility: Visibility
  content: JSONContent
}

export default function NotePage() {
  const router = useRouter()
  const { noteId } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<ContentCategory>("other")
  const [visibility, setVisibility] = useState<Visibility>("private")
  const [content, setContent] = useState<JSONContent>()

  const [initialState, setInitialState] = useState<InitialState | null>(null)
  const [dirty, setDirty] = useState(false)
  const [renderKey, setRenderKey] = useState(0)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)

      try {
        const res = await fetch(`/api/notes/${noteId}`)

        if (!res.ok) {
          toast.error("Failed to load note")
          return
        }

        const { data } = await res.json()

        setTitle(data.title)
        setDescription(data.description ?? "")
        setCategory(data.category)
        setVisibility(data.visibility)
        setContent(data.content as JSONContent)

        setInitialState({
          title: data.title,
          description: data.description ?? "",
          category: data.category,
          visibility: data.visibility,
          content: data.content as JSONContent,
        })
      } catch (error) {
        console.error("Error fetching note data:", error)
        toast.error("Failed to load note")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [noteId])

  useEffect(() => {
    if (!initialState || !content) {
      setDirty(false)
      return
    }

    if (
      Object.keys(content).length === 0 ||
      Object.keys(initialState.content).length === 0
    ) {
      setDirty(false)
      return
    }

    const isDirty =
      title !== initialState.title ||
      description !== initialState.description ||
      category !== initialState.category ||
      visibility !== initialState.visibility ||
      !compareProseMirrorJSON(content, initialState.content)

    setDirty(isDirty)
  }, [title, description, category, visibility, content, initialState])

  function handleCancel() {
    if (!initialState) return

    setTitle(initialState.title)
    setDescription(initialState.description)
    setCategory(initialState.category)
    setVisibility(initialState.visibility)
    setContent(initialState.content)
    setRenderKey((k) => k + 1)
  }

  async function handleUpdate() {
    if (!noteId || !dirty) return

    setIsSaving(true)

    try {
      const res = await fetch(`/api/notes/${noteId}`, {
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
      })

      if (!res.ok) {
        const error = await res.json()
        toast.error(error.error ?? "Failed to update note")
        return
      }

      const { data } = await res.json()

      setInitialState({
        title: data.title,
        description: data.description ?? "",
        category: data.category,
        visibility: data.visibility,
        content: data.content as JSONContent,
      })

      setDirty(false)
      toast.success("Note updated successfully")
    } catch (error) {
      console.error("Error updating note:", error)
      toast.error("Failed to update note")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!noteId) return

    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        toast.error("Failed to delete note")
        return
      }

      toast.success("Note deleted successfully")
      router.push("/notes")
    } catch (error) {
      console.error("Error deleting note:", error)
      toast.error("Failed to delete note")
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
        <p className="text-muted-foreground">Loading note...</p>
      </div>
    )
  }

  return (
    <>
      <section className="space-y-4">
        <InputMetadata metadatas={metadatas} />
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
          <Button onClick={handleUpdate} disabled={!dirty || isSaving}>
            {isSaving ? "Updating..." : "Update"}
          </Button>

          <Button variant="outline" onClick={handleCancel} disabled={!dirty}>
            Cancel
          </Button>

          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </section>
    </>
  )
}