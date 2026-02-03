import { Note, FlashcardSet } from "@/generated/prisma/client"

export type NoteWithExtras = Note & {
  user: {
    id: number
    name: string
    image: string | null
  }
  _count: {
    likes: number
  }
  isBookmarked: boolean
  isLiked: boolean
  isReported: boolean
}

export type FlashcardSetWithExtras = FlashcardSet & {
  user: {
    id: number
    name: string
    image: string | null
  }
  _count: {
    likes: number
  }
  isBookmarked: boolean
  isLiked: boolean
  isReported: boolean
}
