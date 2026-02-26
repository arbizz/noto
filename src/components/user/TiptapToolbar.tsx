"use client"

import { Editor, useEditorState } from "@tiptap/react"
import { Button } from "../ui/button"
import {
  LucideBold,
  LucideCode,
  LucideHeading1,
  LucideHeading2,
  LucideHeading3,
  LucideItalic,
  LucideList,
  LucideListOrdered,
  LucideQuote,
  LucideRedo,
  LucideSquareCode,
  LucideStrikethrough,
  LucideUndo,
  LucideRemoveFormatting,
  LucideEraser,
  LucidePilcrow,
  LucideMinus,
  LucideCornerDownLeft,
  LucideImage,
} from "lucide-react"
import { useRef } from "react"

function TiptapToolbar({ editor }: { editor: Editor }) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isBold: ctx.editor.isActive('bold') ?? false,
        canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
        isItalic: ctx.editor.isActive('italic') ?? false,
        canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
        isStrike: ctx.editor.isActive('strike') ?? false,
        canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
        isCode: ctx.editor.isActive('code') ?? false,
        canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
        canClearMarks: ctx.editor.can().chain().unsetAllMarks().run() ?? false,
        isParagraph: ctx.editor.isActive('paragraph') ?? false,
        isHeading1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
        isHeading2: ctx.editor.isActive('heading', { level: 2 }) ?? false,
        isHeading3: ctx.editor.isActive('heading', { level: 3 }) ?? false,
        isBulletList: ctx.editor.isActive('bulletList') ?? false,
        isOrderedList: ctx.editor.isActive('orderedList') ?? false,
        isCodeBlock: ctx.editor.isActive('codeBlock') ?? false,
        isBlockquote: ctx.editor.isActive('blockquote') ?? false,
        canUndo: ctx.editor.can().chain().undo().run() ?? false,
        canRedo: ctx.editor.can().chain().redo().run() ?? false,
      }
    }
  })

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (data.url) {
        editor.chain().focus().setImage({ src: data.url }).run()
      }
    } catch {
      console.error("Gagal upload gambar")
    } finally {
      // reset input agar file yang sama bisa diupload lagi
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-wrap justify-start items-center gap-0.5">
      {/* Bold */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editorState.canBold}
        data-active={editorState.isBold}
        className="data-[active=true]:bg-accent"
      >
        <LucideBold />
      </Button>

      {/* Italic */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editorState.canItalic}
        data-active={editorState.isItalic}
        className="data-[active=true]:bg-accent"
      >
        <LucideItalic />
      </Button>

      {/* Strikethrough */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editorState.canStrike}
        data-active={editorState.isStrike}
        className="data-[active=true]:bg-accent"
      >
        <LucideStrikethrough />
      </Button>

      {/* Inline Code */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editorState.canCode}
        data-active={editorState.isCode}
        className="data-[active=true]:bg-accent"
      >
        <LucideCode />
      </Button>

      {/* Clear Marks (CM) */}
      <Button
        variant="ghost"
        size="icon"
        title="Hapus format teks"
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
      >
        <LucideRemoveFormatting />
      </Button>

      {/* Clear Nodes (CN) */}
      <Button
        variant="ghost"
        size="icon"
        title="Hapus format blok"
        onClick={() => editor.chain().focus().clearNodes().run()}
      >
        <LucideEraser />
      </Button>

      {/* Paragraph (P) */}
      <Button
        variant="ghost"
        size="icon"
        title="Paragraf"
        onClick={() => editor.chain().focus().setParagraph().run()}
        data-active={editorState.isParagraph}
        className="data-[active=true]:bg-accent"
      >
        <LucidePilcrow />
      </Button>

      {/* Heading 1 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        data-active={editorState.isHeading1}
        className="data-[active=true]:bg-accent"
      >
        <LucideHeading1 />
      </Button>

      {/* Heading 2 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        data-active={editorState.isHeading2}
        className="data-[active=true]:bg-accent"
      >
        <LucideHeading2 />
      </Button>

      {/* Heading 3 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        data-active={editorState.isHeading3}
        className="data-[active=true]:bg-accent"
      >
        <LucideHeading3 />
      </Button>

      {/* Bullet List */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        data-active={editorState.isBulletList}
        className="data-[active=true]:bg-accent"
      >
        <LucideList />
      </Button>

      {/* Ordered List */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        data-active={editorState.isOrderedList}
        className="data-[active=true]:bg-accent"
      >
        <LucideListOrdered />
      </Button>

      {/* Code Block */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        data-active={editorState.isCodeBlock}
        className="data-[active=true]:bg-accent"
      >
        <LucideSquareCode />
      </Button>

      {/* Blockquote */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        data-active={editorState.isBlockquote}
        className="data-[active=true]:bg-accent"
      >
        <LucideQuote />
      </Button>

      {/* Horizontal Rule (HR) */}
      <Button
        variant="ghost"
        size="icon"
        title="Garis pemisah"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <LucideMinus />
      </Button>

      {/* Hard Break (HB) */}
      <Button
        variant="ghost"
        size="icon"
        title="Baris baru paksa"
        onClick={() => editor.chain().focus().setHardBreak().run()}
      >
        <LucideCornerDownLeft />
      </Button>

      {/* Insert Image */}
      <Button
        variant="ghost"
        size="icon"
        title="Sisipkan gambar"
        onClick={() => fileInputRef.current?.click()}
      >
        <LucideImage />
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Undo */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editorState.canUndo}
      >
        <LucideUndo />
      </Button>

      {/* Redo */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editorState.canRedo}
      >
        <LucideRedo />
      </Button>
    </div>
  )
}

export { TiptapToolbar }