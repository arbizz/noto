"use client"

import { FlashcardSet, Note } from "@/generated/prisma/client"
import { LucideEye, LucideHeart, LucideBookmark } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardAction } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { useSession } from "next-auth/react"

function NFCard({
  content,
  onClick,
  onBookmark,
  ...props
}: {
  content: Note | FlashcardSet
  onClick: () => void
  onBookmark?: () => void
  onLike?: () => void
}) {
  const { data: session } = useSession()
  const isOwner = Number(session?.user.id) === content.userId

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

        <CardAction>
          {isOwner && <Button
            variant="ghost"
            size="icon"
            onClick={onBookmark}
          >
            <LucideBookmark />
          </Button>}
        </CardAction>
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

        {content.visibility === "public" && <div className="flex items-center gap-1 text-muted-foreground">
          <LucideHeart className="h-4 w-4 group-hover:text-primary transition-colors" />
          <span className="text-xs font-medium">{}</span>
        </div>}
      </CardFooter>
    </Card>
  )
}

export { NFCard }