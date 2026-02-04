import { Content } from "@/generated/prisma/client"

export type ContentWithExtras = Content & {
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