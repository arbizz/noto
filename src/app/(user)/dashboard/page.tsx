"use client"

import { NotificationBell } from "@/components/shared/NotificationBell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  LucideBookOpen, 
  LucideSquareStack, 
  LucideFileText,
  LucideClock,
  LucideBookmark,
  LucideHeart,
  LucideTrendingUp
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

interface DashboardData {
  stats: {
    totalNotes: number
    totalFlashcards: number
    totalBookmarks: number
    totalLikes: number
  }
  recents: {
    notes: RecentItem[]
    flashcards: RecentItem[]
  }
}

interface RecentItem {
  id: number
  title: string
  category: string
  createdAt: string
  visibility: "public" | "private"
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: {
      totalNotes: 0,
      totalFlashcards: 0,
      totalBookmarks: 0,
      totalLikes: 0
    },
    recents: {
      notes: [],
      flashcards: []
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/user')
      const result = await response.json()
      
      if (response.ok && result.data) {
        setDashboardData(result.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {session?.user?.name || "User"}!
            </p>
          </div>
          <NotificationBell />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button asChild size="lg" className="h-auto py-6">
              <Link href="/notes/new" className="flex items-center gap-3">
                <LucideFileText className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Create New Note</div>
                  <div className="text-xs opacity-80">Start writing your notes</div>
                </div>
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="h-auto py-6">
              <Link href="/flashcards/new" className="flex items-center gap-3">
                <LucideSquareStack className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Create Flashcard Set</div>
                  <div className="text-xs opacity-80">Build your study cards</div>
                </div>
              </Link>
            </Button>
          </div>
        </section>

        {/* Statistics Cards */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Your Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<LucideBookOpen className="h-5 w-5" />}
              label="Total Notes"
              value={dashboardData.stats.totalNotes}
              loading={loading}
              href="/notes"
            />
            <StatCard
              icon={<LucideSquareStack className="h-5 w-5" />}
              label="Total Flashcards"
              value={dashboardData.stats.totalFlashcards}
              loading={loading}
              href="/flashcards"
            />
            <StatCard
              icon={<LucideBookmark className="h-5 w-5" />}
              label="Bookmarks"
              value={dashboardData.stats.totalBookmarks}
              loading={loading}
              href="/bookmarks"
            />
            <StatCard
              icon={<LucideHeart className="h-5 w-5" />}
              label="Likes Given"
              value={dashboardData.stats.totalLikes}
              loading={loading}
            />
          </div>
        </section>

        {/* Recent Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Notes */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <LucideClock className="h-5 w-5" />
                Recent Notes
              </h2>
              <Button asChild variant="ghost" size="sm">
                <Link href="/notes">View All</Link>
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Loading...
                  </div>
                ) : dashboardData.recents.notes.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <LucideFileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No notes yet</p>
                    <Button asChild variant="link" size="sm" className="mt-2">
                      <Link href="/notes/new">Create your first note</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {dashboardData.recents.notes.map((note) => (
                      <RecentItemCard
                        key={note.id}
                        item={note}
                        type="note"
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Recent Flashcards */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <LucideClock className="h-5 w-5" />
                Recent Flashcards
              </h2>
              <Button asChild variant="ghost" size="sm">
                <Link href="/flashcards">View All</Link>
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Loading...
                  </div>
                ) : dashboardData.recents.flashcards.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <LucideSquareStack className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No flashcard sets yet</p>
                    <Button asChild variant="link" size="sm" className="mt-2">
                      <Link href="/flashcards/new">Create your first set</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {dashboardData.recents.flashcards.map((flashcard) => (
                      <RecentItemCard
                        key={flashcard.id}
                        item={flashcard}
                        type="flashcard"
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Additional Quick Links */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Explore</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href="/discover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <LucideTrendingUp className="h-5 w-5" />
                    Discover Content
                  </CardTitle>
                  <CardDescription>
                    Explore public notes and flashcards from the community
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href="/bookmarks">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <LucideBookmark className="h-5 w-5" />
                    My Bookmarks
                  </CardTitle>
                  <CardDescription>
                    Access your saved notes and flashcard sets
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href="/notes">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <LucideFileText className="h-5 w-5" />
                    All My Notes
                  </CardTitle>
                  <CardDescription>
                    View and manage all your notes in one place
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ 
  icon, 
  label, 
  value, 
  loading,
  href 
}: { 
  icon: React.ReactNode
  label: string
  value: number
  loading: boolean
  href?: string
}) {
  const content = (
    <Card className={href ? "hover:shadow-md transition-shadow cursor-pointer" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-primary/10 rounded-lg">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? "..." : value}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}

// Recent Item Card Component
function RecentItemCard({ 
  item, 
  type
}: { 
  item: RecentItem
  type: "note" | "flashcard"
}) {
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