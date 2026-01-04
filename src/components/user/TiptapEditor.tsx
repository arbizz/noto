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
  readonly, 
}: {
  content: JSONContent,
  onChange: (value: JSONContent) => void,
  className: string,
  readonly?: boolean
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
    immediatelyRender: false,
    editable: !readonly
  })

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content)
    }
  }, [editor, content])

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