"use client"

import { FlashcardSet, Note } from "@/generated/prisma/client"
import { LucideEye, LucideHeart, LucideBookmark } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardAction } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"

type NoteWithExtras = Note & {
  user?: {
    id: number
    name: string
    image: string | null
  }
  _count?: {
    likes: number
  }
  isBookmarked?: boolean
  isLiked?: boolean
}

type FlashcardSetWithExtras = FlashcardSet & {
  user?: {
    id: number
    name: string
    image: string | null
  }
  _count?: {
    likes: number
  }
  isBookmarked?: boolean
  isLiked?: boolean
}

function NFCard({
  content,
  onClick,
  onBookmark,
  onLike,
  showBookmark = false,
  showLike = false,
  ...props
}: {
  content: NoteWithExtras | FlashcardSetWithExtras
  onClick: () => void
  onBookmark?: (e: React.MouseEvent) => void
  onLike?: (e: React.MouseEvent) => void
  showBookmark?: boolean
  showLike?: boolean
}) {
  const likesCount = content._count?.likes ?? 0
  const isBookmarked = content.isBookmarked ?? false
  const isLiked = content.isLiked ?? false

  return (
    <Card
      onClick={onClick}
      className="
        group cursor-pointer
        transition-all
        hover:border-primary/40
        hover:shadow-md
        focus-visible:ring-2 focus-visible:ring-ring
      "
      {...props}
    >
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-base font-semibold">
            {content.title}
          </CardTitle>
        </div>
          
        {content.description && (
          <CardDescription className="line-clamp-3 text-sm">
            {content.description}
          </CardDescription>
        )}

        {(showBookmark || showLike) && (
          <CardAction>
            <div className="flex gap-1">
              {showLike && onLike && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onLike}
                  className={isLiked ? "text-red-500" : ""}
                >
                  <LucideHeart className={isLiked ? "fill-current" : ""} />
                </Button>
              )}
              
              {showBookmark && onBookmark && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBookmark}
                  className={isBookmarked ? "text-primary" : ""}
                >
                  <LucideBookmark className={isBookmarked ? "fill-current" : ""} />
                </Button>
              )}
            </div>
          </CardAction>
        )}
      </CardHeader>
      
      <CardFooter className="flex items-center justify-between pt-3 text-sm">
        <div className="flex flex-wrap gap-2">
          <Badge className="capitalize">
            {content.category.replaceAll("_", " ")}
          </Badge>
      
          <Badge
            variant="secondary"
            className="capitalize"
          >
            <LucideEye />
            {content.visibility}
          </Badge>
        </div>

        {content.visibility === "public" && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <LucideHeart className="h-4 w-4 group-hover:text-red-500 transition-colors" />
            <span className="text-xs font-medium">{likesCount}</span>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

export { NFCard }