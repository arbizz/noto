"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { JSONContent } from "@tiptap/react"

import { Button } from "@/components/ui/button"
import { TiptapEditor } from "@/components/user/TiptapEditor"
import { InputMetadata, MetadataConfig } from "@/components/shared/InputMetadata"

import { ContentCategory, Visibility } from "@/generated/prisma/enums"

export default function NewNotePage() {
  const router = useRouter()

  const [content, setContent] = useState<JSONContent>({})
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<ContentCategory>("other")
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
