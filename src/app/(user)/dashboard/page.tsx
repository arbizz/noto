"use client"

import { NotificationBell } from "@/components/shared/NotificationBell"
import { StatCard } from "@/components/shared/StatCard"
import { RecentContentSection } from "@/components/user/RecentContentSection"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LucideBookOpen,
  LucideSquareStack,
  LucideFileText,
  LucideBookmark,
  LucideHeart,
  LucideTrendingUp,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import type { UserDashboardData } from "@/types/shared/dashboard"

const INITIAL_DATA: UserDashboardData = {
  stats: {
    totalNotes: 0,
    totalFlashcards: 0,
    totalBookmarks: 0,
    totalLikes: 0,
  },
  recents: {
    notes: [],
    flashcards: [],
  },
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState<UserDashboardData>(INITIAL_DATA)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/dashboard/user")
        const result = await response.json()
        if (response.ok && result.data) {
          setDashboardData(result.data)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="min-h-screen bg-background">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentContentSection
            type="note"
            items={dashboardData.recents.notes}
            loading={loading}
          />
          <RecentContentSection
            type="flashcard"
            items={dashboardData.recents.flashcards}
            loading={loading}
          />
        </div>

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