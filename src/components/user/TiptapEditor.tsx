"use client"

import StarterKit from "@tiptap/starter-kit"
import { useEffect } from "react"
import { EditorContent, JSONContent, useEditor } from "@tiptap/react"
import { TiptapToolbar } from "@/components/user/TiptapToolbar"
import { Separator } from "@/components/ui/separator"

function TiptapEditor({
  content,
  onChange,
  className,
}: {
  content: JSONContent,
  onChange: (value: JSONContent) => void,
  className: string,
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
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