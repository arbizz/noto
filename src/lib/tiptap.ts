import { JSONContent } from "@tiptap/react"
import { schema as basicSchema } from "prosemirror-schema-basic"

export function compareProseMirrorJSON(a: JSONContent, b: JSONContent, schema = basicSchema) {
  try {
    const node1 = schema.nodeFromJSON(a)
    const node2 = schema.nodeFromJSON(b)
    return node1.eq(node2) 
  } catch (e) {
    console.error("Gagal membandingkan JSON. Data A:", a, "Data B:", b, "Error:", e);
    return false;
  }
}