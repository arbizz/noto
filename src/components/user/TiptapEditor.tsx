"use client"

import StarterKit from "@tiptap/starter-kit"
import { EditorContent, JSONContent, useEditor } from "@tiptap/react"
import { TiptapToolbar } from "@/components/user/TiptapToolbar"
import { Separator } from "@/components/ui/separator"
import { useEffect } from "react"

function TiptapEditor({
  content,
  onChange,
  className,
  readonly = false
}: {
  content: JSONContent,
  onChange: (value: JSONContent) => void,
  className?: string,
  readonly?: boolean
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable: !readonly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
  })

  if (!editor) return null

  return (
    <div className={className}>
      <TiptapToolbar editor={editor} />
      <Separator />
      <div className="max-w-full overflow-x-hidden">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export { TiptapEditor }