"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  LucideUsers,
  LucideFileText,
  LucideSquareStack,
  LucideAlertTriangle,
  LucideUserCheck,
  LucideUserX,
  LucideEye,
  LucideClock,
  LucideShieldAlert
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

interface AdminDashboardData {
  stats: {
    users: {
      total: number
      active: number
      suspended: number
      banned: number
    }
    content: {
      totalNotes: number
      totalFlashcards: number
      publicNotes: number
      publicFlashcards: number
    }
    reports: {
      total: number
      pending: number
      reviewed: number
    }
  }
  recents: {
    reports: RecentReport[]
    users: RecentUser[]
  }
  categories: {
    notes: CategoryCount[]
    flashcards: CategoryCount[]
  }
}

interface RecentReport {
  id: number
  contentType: "note" | "flashcard"
  reason: string
  status: string
  createdAt: string
  user: {
    id: number
    name: string
    email: string
  }
  note?: {
    id: number
    title: string
    user: {
      id: number
      name: string
    }
  }
  flashcardSet?: {
    id: number
    title: string
    user: {
      id: number
      name: string
    }
  }
}

interface RecentUser {
  id: number
  name: string
  email: string
  role: string
  status: string
  createdAt: string
  _count: {
    notes: number
    flashcardSets: number
  }
}

interface CategoryCount {
  category: string
  _count: {
    id: number
  }
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState<AdminDashboardData>({
    stats: {
      users: {
        total: 0,
        active: 0,
        suspended: 0,
        banned: 0
      },
      content: {
        totalNotes: 0,
        totalFlashcards: 0,
        publicNotes: 0,
        publicFlashcards: 0
      },
      reports: {
        total: 0,
        pending: 0,
        reviewed: 0
      }
    },
    recents: {
      reports: [],
      users: []
    },
    categories: {
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
      const response = await fetch('/api/dashboard/admin')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.data) {
        setDashboardData(result.data)
      }
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      suspended: "secondary",
      banned: "destructive",
      pending: "outline",
      reviewed: "secondary",
      resolved: "default",
      rejected: "destructive"
    }
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>
  }

  const getReasonLabel = (reason: string) => {
    return reason.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
        {/* User Statistics */}
        <section>
          <h2 className="text-lg font-semibold mb-4">User Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<LucideUsers className="h-5 w-5" />}
              label="Total Users"
              value={dashboardData.stats.users.total}
              loading={loading}
              variant="default"
            />
            <StatCard
              icon={<LucideUserCheck className="h-5 w-5" />}
              label="Active Users"
              value={dashboardData.stats.users.active}
              loading={loading}
              variant="success"
            />
            <StatCard
              icon={<LucideShieldAlert className="h-5 w-5" />}
              label="Suspended"
              value={dashboardData.stats.users.suspended}
              loading={loading}
              variant="warning"
            />
            <StatCard
              icon={<LucideUserX className="h-5 w-5" />}
              label="Banned"
              value={dashboardData.stats.users.banned}
              loading={loading}
              variant="danger"
            />
          </div>
        </section>

        {/* Content Statistics */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Content Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<LucideFileText className="h-5 w-5" />}
              label="Total Notes"
              value={dashboardData.stats.content.totalNotes}
              loading={loading}
            />
            <StatCard
              icon={<LucideSquareStack className="h-5 w-5" />}
              label="Total Flashcards"
              value={dashboardData.stats.content.totalFlashcards}
              loading={loading}
            />
            <StatCard
              icon={<LucideEye className="h-5 w-5" />}
              label="Public Notes"
              value={dashboardData.stats.content.publicNotes}
              loading={loading}
            />
            <StatCard
              icon={<LucideEye className="h-5 w-5" />}
              label="Public Flashcards"
              value={dashboardData.stats.content.publicFlashcards}
              loading={loading}
            />
          </div>
        </section>

        {/* Reports Statistics */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Reports Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              icon={<LucideAlertTriangle className="h-5 w-5" />}
              label="Total Reports"
              value={dashboardData.stats.reports.total}
              loading={loading}
            />
            <StatCard
              icon={<LucideClock className="h-5 w-5" />}
              label="Pending Reports"
              value={dashboardData.stats.reports.pending}
              loading={loading}
              variant="warning"
            />
            <StatCard
              icon={<LucideFileText className="h-5 w-5" />}
              label="Reviewed Reports"
              value={dashboardData.stats.reports.reviewed}
              loading={loading}
              variant="success"
            />
          </div>
        </section>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Reports */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <LucideAlertTriangle className="h-5 w-5" />
                Recent Reports
              </h2>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/reports">View All</Link>
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Loading...
                  </div>
                ) : dashboardData.recents.reports.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <LucideAlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No reports yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData.recents.reports.map((report) => (
                        <TableRow key={report.id} className="cursor-pointer hover:bg-accent/50">
                          <TableCell>
                            <Link href={`/admin/reports/${report.id}`} className="flex items-center gap-2">
                              {report.contentType === "note" ? (
                                <LucideFileText className="h-4 w-4" />
                              ) : (
                                <LucideSquareStack className="h-4 w-4" />
                              )}
                              <span className="capitalize">{report.contentType}</span>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link href={`/admin/reports/${report.id}`}>
                              {getReasonLabel(report.reason)}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link href={`/admin/reports/${report.id}`}>
                              {getStatusBadge(report.status)}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link href={`/admin/reports/${report.id}`} className="text-sm text-muted-foreground">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Recent Users */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <LucideUsers className="h-5 w-5" />
                Recent Users
              </h2>
            </div>
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Loading...
                  </div>
                ) : dashboardData.recents.users.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <LucideUsers className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No users yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        {/* <TableHead>Content</TableHead> */}
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData.recents.users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(user.status)}
                          </TableCell>
                          {/* <TableCell>
                            <div className="text-sm">
                              <div>{user._count.notes} notes</div>
                              <div className="text-muted-foreground">{user._count.flashcardSets} flashcards</div>
                            </div>
                          </TableCell> */}
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Quick Actions */}
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

// Stat Card Component
function StatCard({ 
  icon, 
  label, 
  value, 
  loading,
  variant = "default"
}: { 
  icon: React.ReactNode
  label: string
  value: number
  loading: boolean
  variant?: "default" | "success" | "warning" | "danger"
}) {
  const bgColors = {
    default: "bg-primary/10",
    success: "bg-green-500/10",
    warning: "bg-yellow-500/10",
    danger: "bg-red-500/10"
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className={`p-2 ${bgColors[variant]} rounded-lg`}>
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
}