"use client"

import { useRouter } from "next/navigation"
import { LucideEye, LucideHeart, LucideBookmark, LucideFlag, LucideMoreVertical, LucideUser } from "lucide-react"
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
import { ContentWithExtras } from "@/types/shared/nf-extras"

function NFCard({
  content,
  onClick,
  onBookmark,
  onLike,
  onReport,
  showActions = false,
  showLikeOnly = false,
  hideBadge = false,
  hideLike = false,
  hideAuthor = false,
  ...props
}: {
  content: ContentWithExtras
  onClick: () => void
  onBookmark?: (e: React.MouseEvent) => void
  onLike?: (e: React.MouseEvent) => void
  onReport?: (e: React.MouseEvent) => void
  showActions?: boolean
  showLikeOnly?: boolean
  hideBadge?: boolean
  hideLike?: boolean
  hideAuthor?: boolean
}) {
  const router = useRouter()
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

      <CardFooter className="flex flex-col items-start gap-2 pt-3 text-sm">
        {/* Author chip — navigates to user public profile */}
        {!hideAuthor && content.user && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/user/${content.user.id}`)
            }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <LucideUser className="h-3 w-3" />
            <span>{content.user.name || "Unknown"}</span>
          </button>
        )}

        <div className="flex items-center justify-between w-full">
          <div className="flex flex-wrap gap-2">
            <Badge className="capitalize">
              {content.category.replaceAll("_", " ")}
            </Badge>

            {content.visibility === "public" && !hideBadge && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 capitalize"
              >
                <LucideEye className="h-3 w-3" />
                {content.visibility}
              </Badge>
            )}
          </div>

          {content.visibility === "public" && !hideLike && (
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
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

export { NFCard }