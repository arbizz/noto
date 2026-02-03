"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { JSONContent } from "@tiptap/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { TiptapEditor } from "@/components/user/TiptapEditor"

import { ContentCategory, Visibility } from "@/generated/prisma/enums"
import { LucideEdit, LucideTrash } from "lucide-react"


export default function NotePage() {
  const router = useRouter()
  const { noteId } = useParams()
  const [isLoading, setIsLoading] = useState(true)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<ContentCategory>("other")
  const [visibility, setVisibility] = useState<Visibility>("private")
  const [content, setContent] = useState<JSONContent>()

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
        setDescription(data.description)
        setCategory(data.category)
        setVisibility(data.visibility)
        setContent(data.content as JSONContent)
      } catch (error) {
        console.error("Error fetching note data:", error)
        toast.error("Failed to load note")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [noteId])

  async function handleDelete() {
    if (!noteId) return

    const confirmed = confirm("Are you sure you want to delete this note?")
    if (!confirmed) return

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
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <h1 className="text-3xl font-bold">{title}</h1>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push(`/notes/${noteId}/edit`)}>
              <LucideEdit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <LucideTrash className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="px-2 py-1 bg-muted rounded-md capitalize">
            {category.replace(/_/g, " ")}
          </span>
          <span className="px-2 py-1 bg-muted rounded-md capitalize">
            {visibility}
          </span>
        </div>
      </section>

      <section className="flex flex-col gap-8 mt-12">
        {content && (
          <TiptapEditor
            readonly
            content={content}
            onChange={setContent}
            className="border"
          />
        )}
      </section>
    </>
  )
}