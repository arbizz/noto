"use client"

import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import { EditorContent, JSONContent, useEditor } from "@tiptap/react"
import { TiptapToolbar } from "@/components/user/TiptapToolbar"
import { Separator } from "@/components/ui/separator"

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
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: "max-w-full rounded-md my-2",
        },
      }),
    ],
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
      {!readonly && (
        <>
          <TiptapToolbar editor={editor} />
          <Separator />
        </>
      )}
      <div className="max-w-full overflow-x-hidden">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export { TiptapEditor }