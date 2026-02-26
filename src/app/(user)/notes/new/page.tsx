"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { JSONContent } from "@tiptap/react"

import { Button } from "@/components/ui/button"
import { TiptapEditor } from "@/components/user/TiptapEditor"
import { InputMetadata, MetadataConfig } from "@/components/shared/InputMetadata"

import { ContentCategory, Visibility } from "@/generated/prisma/enums"
import { toast } from "sonner"

export default function NewNotePage() {
  const router = useRouter()

  const [content, setContent] = useState<JSONContent>({})
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<ContentCategory>("other")
  const [visibility, setVisibility] = useState<Visibility>("private")
  const [saving, setSaving] = useState(false)

  async function handleCreate() {
    const contentText = JSON.stringify(content)
    const hasText = /[a-zA-Z0-9]/.test(contentText)

    if (!title.trim()) {
      toast.error("Title is required")
      return
    }

    if (!hasText) {
      toast.error("Content must contain at least one character")
      return
    }

    setSaving(true)
    try {
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

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to create note")
        return
      }

      if (data.id) {
        toast.success("Note created successfully")
        router.push(`/notes/${data.id}`)
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Failed to save note. Please try again.")
    } finally {
      setSaving(false)
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

      <section className="flex flex-col gap-8 mt-12">
        <p className="-mb-4">Notes  <strong className="text-red-500">*</strong></p>
        <TiptapEditor
          content={content}
          onChange={setContent}
          className="border"
        />

        <div>
          <Button onClick={handleCreate} className="w-full" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </section>
    </>
  )
}