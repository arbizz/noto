import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LucideClock, LucideFileText, LucideSquareStack } from "lucide-react"
import Link from "next/link"
import type { DashboardRecentItem } from "@/types/shared/dashboard"
import { RecentItemCard } from "@/components/user/RecentItemCard"

interface RecentContentSectionProps {
  type: "note" | "flashcard"
  items: DashboardRecentItem[]
  loading: boolean
}

const config = {
  note: {
    label: "Recent Notes",
    viewAllHref: "/notes",
    newHref: "/notes/new",
    emptyLabel: "No notes yet",
    emptyAction: "Create your first note",
    EmptyIcon: LucideFileText,
  },
  flashcard: {
    label: "Recent Flashcards",
    viewAllHref: "/flashcards",
    newHref: "/flashcards/new",
    emptyLabel: "No flashcard sets yet",
    emptyAction: "Create your first set",
    EmptyIcon: LucideSquareStack,
  },
}

export function RecentContentSection({ type, items, loading }: RecentContentSectionProps) {
  const { label, viewAllHref, newHref, emptyLabel, emptyAction, EmptyIcon } = config[type]

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <LucideClock className="h-5 w-5" />
          {label}
        </h2>
        <Button asChild variant="ghost" size="sm">
          <Link href={viewAllHref}>View All</Link>
        </Button>
      </div>
      <Card className="overflow-hidden p-0">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <EmptyIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>{emptyLabel}</p>
              <Button asChild variant="link" size="sm" className="mt-2">
                <Link href={newHref}>{emptyAction}</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {items.map((item) => (
                <RecentItemCard key={item.id} item={item} type={type} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}