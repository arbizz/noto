import { LucideFileText, LucideSquareStack } from "lucide-react"
import Link from "next/link"
import type { DashboardRecentItem } from "@/types/shared/dashboard"

interface RecentItemCardProps {
  item: DashboardRecentItem
  type: "note" | "flashcard"
}

export function RecentItemCard({ item, type }: RecentItemCardProps) {
  const href = type === "note" ? `/notes/${item.id}` : `/flashcards/${item.id}`
  const Icon = type === "note" ? LucideFileText : LucideSquareStack

  return (
    <Link href={href}>
      <div className="p-4 hover:bg-accent/50 transition-colors">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg mt-1">
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{item.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground capitalize">
                {item.category.replace(/_/g, " ")}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground capitalize">
                {item.visibility}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}