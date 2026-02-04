"use client"

import { InputMetadata, MetadataConfig } from "@/components/shared/InputMetadata"
import { Button } from "@/components/ui/button"
import { TiptapEditor } from "@/components/user/TiptapEditor"
import { ContentCategory, Visibility } from "@/generated/prisma/enums"
import { compareProseMirrorJSON } from "@/lib/tiptap"
import { JSONContent } from "@tiptap/core"
import { LucideArrowLeft } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface InitialState {
  title: string
  description: string
  category: ContentCategory
  visibility: Visibility
  content: JSONContent
}

function isContentEmpty(content: JSONContent | undefined): boolean {
  if (!content) return true
  if (!content.content || content.content.length === 0) return true
  
  function hasText(node: JSONContent): boolean {
    if (node.text && node.text.trim().length > 0) {
      return true
    }
    
    if (node.content && Array.isArray(node.content)) {
      return node.content.some(child => hasText(child))
    }
    
    return false
  }
  
  return !content.content.some(node => hasText(node))
}

export default function NoteUpdatePage() {
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
  const [isDirty, setIsDirty] = useState(false)
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

        setRenderKey((k) => k + 1)
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
      setIsDirty(false)
      return
    }

    if (
      Object.keys(content).length === 0 ||
      Object.keys(initialState.content).length === 0
    ) {
      setIsDirty(false)
      return
    }

    const isDirty =
      title !== initialState.title ||
      description !== initialState.description ||
      category !== initialState.category ||
      visibility !== initialState.visibility ||
      !compareProseMirrorJSON(content, initialState.content)

    setIsDirty(isDirty)
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
    if (!noteId || !isDirty) return

    if (isContentEmpty(content)) {
      toast.error("Content must contain at least one character")
      return
    }
    
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
        toast.error(error.error ?? "Failed to save note")
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

      setIsDirty(false)
      toast.success("Note saved successfully")
      router.push(`/notes/${noteId}`)
    } catch (error) {
      console.error("Error updating note:", error)
      toast.error("Failed to save note")
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
        <p className="text-muted-foreground">Loading note...</p>
      </div>
    )
  }

  return (
    <>
      <section className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/notes/${noteId}`)}
          className="mb-4"
        >
          <LucideArrowLeft className="w-4 h-4 mr-2" />
          Back to View
        </Button>

        <InputMetadata metadatas={metadatas}/>
      </section>

      <section className="mt-12 space-y-4">
        <p>Notes  <strong className="text-red-500">*</strong></p>
        {content && (
          <TiptapEditor
            key={renderKey}
            content={content}
            onChange={setContent}
            className="border"
          />
        )}

        <div className="flex items-center gap-3">
          <Button onClick={handleUpdate} disabled={!isDirty || isSaving} className="flex-1">
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