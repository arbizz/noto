import { JSONContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import { Schema } from "@tiptap/pm/model"
import { getSchema } from "@tiptap/core"

const tiptapExtensions = [
  StarterKit,
  Image,
]

const tiptapSchema: Schema = getSchema(tiptapExtensions)

export function compareProseMirrorJSON(a: JSONContent, b: JSONContent, schema = tiptapSchema) {
  try {
    const node1 = schema.nodeFromJSON(a)
    const node2 = schema.nodeFromJSON(b)
    return node1.eq(node2)
  } catch (e) {
    console.error("Gagal membandingkan JSON. Data A:", a, "Data B:", b, "Error:", e);
    return false;
  }
}