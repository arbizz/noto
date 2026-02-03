"use client"

import { FlashcardSet, Note } from "@/generated/prisma/client"
import { LucideEye, LucideHeart, LucideBookmark, LucideFlag, LucideMoreVertical } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardAction } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "../ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

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
  isReported?: boolean
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
  isReported?: boolean
}

function NFCard({
  content,
  onClick,
  onBookmark,
  onLike,
  onReport,
  showActions = false,
  showLikeOnly = false,
  ...props
}: {
  content: NoteWithExtras | FlashcardSetWithExtras
  onClick: () => void
  onBookmark?: (e: React.MouseEvent) => void
  onLike?: (e: React.MouseEvent) => void
  onReport?: (e: React.MouseEvent) => void
  showActions?: boolean
  showLikeOnly?: boolean
}) {
  const likesCount = content._count?.likes ?? 0
  const isBookmarked = content.isBookmarked ?? false
  const isLiked = content.isLiked ?? false
  const isReported = content.isReported ?? false

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

        {showActions && (
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <LucideMoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                {onBookmark && (
                  <DropdownMenuItem onClick={onBookmark} className="gap-2 cursor-pointer">
                    <LucideBookmark 
                      className={`h-4 w-4 ${isBookmarked ? "fill-primary text-primary" : ""}`} 
                    />
                    <span>{isBookmarked ? "Remove Bookmark" : "Bookmark"}</span>
                  </DropdownMenuItem>
                )}

                {onReport && !isReported && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={onReport} 
                      className="gap-2 cursor-pointer text-red-600 dark:text-red-500"
                    >
                      <LucideFlag className="h-4 w-4" />
                      <span>Report</span>
                    </DropdownMenuItem>
                  </>
                )}

                {onReport && isReported && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={onReport} 
                      disabled
                      className="gap-2 cursor-not-allowed text-orange-600 dark:text-orange-500 opacity-60"
                    >
                      <LucideFlag className="h-4 w-4 fill-current" />
                      <span>Reported</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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
            className="flex items-center gap-1 capitalize"
          >
            <LucideEye className="h-3 w-3" />
            {content.visibility}
          </Badge>
        </div>

        {content.visibility === "public" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={showLikeOnly ? undefined : onLike}>
                  <LucideHeart 
                    className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} 
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <span className="text-xs font-medium">{likesCount}</span>
              </TooltipContent>
            </Tooltip>
          )          
        }
      </CardFooter>
    </Card>
  )
}

export { NFCard }