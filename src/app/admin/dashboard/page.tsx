"use client"

import { StatCard } from "@/components/shared/StatCard"
import { RecentReportsSection } from "@/components/admin/RecentReportsSection"
import { RecentUsersSection } from "@/components/admin/RecentUsersSection"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LucideUsers,
  LucideFileText,
  LucideSquareStack,
  LucideAlertTriangle,
  LucideUserCheck,
  LucideUserX,
  LucideEye,
  LucideClock,
  LucideShieldAlert,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import type { AdminDashboardData } from "@/types/shared/dashboard"

const INITIAL_DATA: AdminDashboardData = {
  stats: {
    users: { total: 0, active: 0, suspended: 0, banned: 0 },
    content: { totalNotes: 0, totalFlashcards: 0, publicNotes: 0, publicFlashcards: 0 },
    reports: { total: 0, pending: 0, reviewed: 0 },
  },
  recents: {
    reports: [],
    users: [],
  },
  categories: {
    notes: [],
    flashcards: [],
  },
}

export default function AdminDashboardPage() {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState<AdminDashboardData>(INITIAL_DATA)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/dashboard/admin")
        const result = await response.json()
        if (response.ok && result.data) {
          setDashboardData(result.data)
        }
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const { users, content, reports } = dashboardData.stats

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {session?.user?.name || "Admin"}!
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <section>
          <h2 className="text-lg font-semibold mb-4">User Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<LucideUsers className="h-5 w-5" />}
              label="Total Users"
              value={users.total}
              loading={loading}
            />
            <StatCard
              icon={<LucideUserCheck className="h-5 w-5" />}
              label="Active Users"
              value={users.active}
              loading={loading}
              variant="success"
            />
            <StatCard
              icon={<LucideShieldAlert className="h-5 w-5" />}
              label="Suspended"
              value={users.suspended}
              loading={loading}
              variant="warning"
            />
            <StatCard
              icon={<LucideUserX className="h-5 w-5" />}
              label="Banned"
              value={users.banned}
              loading={loading}
              variant="danger"
            />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Content Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<LucideFileText className="h-5 w-5" />}
              label="Total Notes"
              value={content.totalNotes}
              loading={loading}
            />
            <StatCard
              icon={<LucideSquareStack className="h-5 w-5" />}
              label="Total Flashcards"
              value={content.totalFlashcards}
              loading={loading}
            />
            <StatCard
              icon={<LucideEye className="h-5 w-5" />}
              label="Public Notes"
              value={content.publicNotes}
              loading={loading}
            />
            <StatCard
              icon={<LucideEye className="h-5 w-5" />}
              label="Public Flashcards"
              value={content.publicFlashcards}
              loading={loading}
            />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Reports Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              icon={<LucideAlertTriangle className="h-5 w-5" />}
              label="Total Reports"
              value={reports.total}
              loading={loading}
            />
            <StatCard
              icon={<LucideClock className="h-5 w-5" />}
              label="Pending Reports"
              value={reports.pending}
              loading={loading}
              variant="warning"
            />
            <StatCard
              icon={<LucideFileText className="h-5 w-5" />}
              label="Reviewed Reports"
              value={reports.reviewed}
              loading={loading}
              variant="success"
            />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentReportsSection
            reports={dashboardData.recents.reports}
            loading={loading}
          />
          <RecentUsersSection
            users={dashboardData.recents.users}
            loading={loading}
          />
        </div>

        <section>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href="/admin/reports?status=pending">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <LucideClock className="h-5 w-5" />
                    Pending Reports
                  </CardTitle>
                  <CardDescription>
                    Review and manage pending content reports
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href="/admin/reports">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <LucideAlertTriangle className="h-5 w-5" />
                    All Reports
                  </CardTitle>
                  <CardDescription>
                    View all reports and their status
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