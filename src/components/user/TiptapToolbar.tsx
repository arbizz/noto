import { Editor, useEditorState } from "@tiptap/react"
import { Button } from "../ui/button"
import {
  LucideBold,
  LucideCode,
  LucideHeading1,
  LucideHeading2,
  LucideHeading3,
  LucideHeading4,
  LucideHeading5,
  LucideHeading6,
  LucideItalic,
  LucideList,
  LucideListOrdered,
  LucideQuote,
  LucideRedo,
  LucideSquareCode,
  LucideStrikethrough,
  LucideUndo
} from "lucide-react"

function TiptapToolbar({ editor }: { editor: Editor }) {
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
        isHeading4: ctx.editor.isActive('heading', { level: 4 }) ?? false,
        isHeading5: ctx.editor.isActive('heading', { level: 5 }) ?? false,
        isHeading6: ctx.editor.isActive('heading', { level: 6 }) ?? false,
        isBulletList: ctx.editor.isActive('bulletList') ?? false,
        isOrderedList: ctx.editor.isActive('orderedList') ?? false,
        isCodeBlock: ctx.editor.isActive('codeBlock') ?? false,
        isBlockquote: ctx.editor.isActive('blockquote') ?? false,
        canUndo: ctx.editor.can().chain().undo().run() ?? false,
        canRedo: ctx.editor.can().chain().redo().run() ?? false,
      }
    }
  })

  return (
    <div className="flex justify-start items-center">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editorState.canBold}
      >
        <LucideBold />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editorState.canItalic}
      >
        <LucideItalic />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editorState.canStrike}
      >
        <LucideStrikethrough />  
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editorState.canCode}
      >
        <LucideCode />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
      >
        CM
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().clearNodes().run()}
        >
        CN
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        P
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
        <LucideHeading1 />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <LucideHeading2 />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <LucideHeading3 />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
      >
        <LucideHeading4 />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
      >
        <LucideHeading5 />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
      >
        <LucideHeading6 />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <LucideList />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <LucideListOrdered />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <LucideSquareCode />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <LucideQuote />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        HR
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().setHardBreak().run()}
      >
        HB
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().undo().run()} 
        disabled={!editorState.canUndo}
      >
        <LucideUndo />
      </Button>
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