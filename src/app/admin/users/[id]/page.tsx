"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { UserStatus } from "@/generated/prisma/enums"
import { LucideArrowLeft, LucideShieldBan, LucideShieldOff, LucideShieldCheck } from "lucide-react"

type UserDetail = {
  id: number
  name: string | null
  email: string
  image: string | null
  role: "user" | "admin"
  status: UserStatus
  score: number
  createdAt: Date
  updatedAt: Date
  _count: {
    contents: number
    reports: number
    bookmarks: number
    likes: number
  }
  contents: Array<{
    id: number
    title: string
    contentType: "note" | "flashcard"
    visibility: string
    category: string
    createdAt: Date
  }>
  reports: Array<{
    id: number
    contentId: number
    contentType: "note" | "flashcard"
    reason: string
    status: string
    createdAt: Date
  }>
  notifications: Array<{
    id: number
    type: string
    title: string
    message: string
    isRead: boolean
    createdAt: Date
  }>
}

type ActionType = "ban" | "suspend" | "activate"

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<UserDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionReason, setActionReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  function getStatusBadgeVariant(status: UserStatus) {
    switch (status) {
      case "active": return "outline"
      case "suspended": return "secondary"
      case "banned": return "destructive"
      default: return "default"
    }
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  function formatReasonLabel(reason: string) {
    return reason.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  }

  async function handleAction(action: ActionType) {
    if (!user) return
    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/users/${user.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: actionReason || undefined }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? "Action failed")
        return
      }

      toast.success(data.message)
      setUser((prev) => prev ? { ...prev, status: data.user.status } : prev)
      setActionReason("")
    } catch (err) {
      console.error(err)
      toast.error("Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    async function fetchUser() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/users/${userId}`)
        if (!res.ok) throw new Error("Failed to fetch user")
        const data = await res.json()
        setUser(data.user)
      } catch (err) {
        console.error(err)
        toast.error("Failed to load user data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading user data...</div>
    )
  }

  if (!user) {
    return (
      <div className="p-8 text-center text-muted-foreground">User not found</div>
    )
  }

  return (
    <>
      <section className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/users")}>
          <LucideArrowLeft />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">User Detail</h1>
          <p className="text-muted-foreground">Manage user account and actions</p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: user info + actions */}
        <div className="flex flex-col gap-6 lg:col-span-1">

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xl font-semibold">{user.name ?? "(no name)"}</span>
                <span className="text-sm text-muted-foreground">{user.email}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant={user.role === "admin" ? "default" : "outline"} className="capitalize">
                  {user.role}
                </Badge>
                <Badge variant={getStatusBadgeVariant(user.status)} className="capitalize">
                  {user.status}
                </Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Score</p>
                  <p className={`text-lg font-bold font-mono ${
                    user.score <= 15
                      ? "text-destructive"
                      : user.score <= 30
                      ? "text-yellow-500"
                      : "text-green-600"
                  }`}>
                    {user.score}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Contents</p>
                  <p className="text-lg font-bold">{user._count.contents}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reports made</p>
                  <p className="text-lg font-bold">{user._count.reports}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Bookmarks</p>
                  <p className="text-lg font-bold">{user._count.bookmarks}</p>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <span>Joined: {formatDate(user.createdAt)}</span>
                <span>Updated: {formatDate(user.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          {user.role !== "admin" && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>
                  Perform account management actions. User will be notified.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label>Reason (optional)</Label>
                  <Textarea
                    placeholder="Provide a reason for this action..."
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    rows={3}
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {actionReason.length}/200
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  {/* Suspend */}
                  {user.status !== "suspended" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="secondary"
                          className="w-full gap-2"
                          disabled={isSubmitting}
                        >
                          <LucideShieldOff className="h-4 w-4" />
                          Suspend Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Suspend this user?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {user.name ?? user.email} will be suspended. They can be reactivated later.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleAction("suspend")} variant="destructive">
                            Suspend
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {/* Ban */}
                  {user.status !== "banned" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="w-full gap-2"
                          disabled={isSubmitting}
                        >
                          <LucideShieldBan className="h-4 w-4" />
                          Ban Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Ban this user?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {user.name ?? user.email} will be permanently banned. This is a serious action.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleAction("ban")}
                            variant="destructive"
                          >
                            Ban
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {/* Activate */}
                  {user.status !== "active" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full gap-2 text-green-600 border-green-600 hover:bg-green-50"
                          disabled={isSubmitting}
                        >
                          <LucideShieldCheck className="h-4 w-4" />
                          Activate Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Activate this user?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {user.name ?? user.email}&apos;s account will be restored to active.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleAction("activate")}>
                            Activate
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: contents, reports, notifications */}
        <div className="flex flex-col gap-6 lg:col-span-2">

          {/* Recent Contents */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Contents</CardTitle>
              <CardDescription>Last 5 contents created by this user</CardDescription>
            </CardHeader>
            <CardContent>
              {user.contents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No contents yet</p>
              ) : (
                <div className="flex flex-col divide-y">
                  {user.contents.map((content) => (
                    <div key={content.id} className="flex items-center justify-between py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{content.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(content.createdAt)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="capitalize text-xs">
                          {content.contentType}
                        </Badge>
                        <Badge variant="secondary" className="capitalize text-xs">
                          {content.visibility}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Reports Made */}
          <Card>
            <CardHeader>
              <CardTitle>Reports Made</CardTitle>
              <CardDescription>Last 5 reports submitted by this user</CardDescription>
            </CardHeader>
            <CardContent>
              {user.reports.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reports submitted</p>
              ) : (
                <div className="flex flex-col divide-y">
                  {user.reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm capitalize">
                          {formatReasonLabel(report.reason)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {report.contentType} #{report.contentId} · {formatDate(report.createdAt)}
                        </span>
                      </div>
                      <Badge variant="outline" className="capitalize text-xs">
                        {report.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Last 5 system notifications sent to this user</CardDescription>
            </CardHeader>
            <CardContent>
              {user.notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notifications</p>
              ) : (
                <div className="flex flex-col divide-y">
                  {user.notifications.map((notif) => (
                    <div key={notif.id} className="flex items-start justify-between py-3 gap-4">
                      <div className="flex flex-col flex-1">
                        <span className="font-medium text-sm">{notif.title}</span>
                        <span className="text-xs text-muted-foreground">{notif.message}</span>
                        <span className="text-xs text-muted-foreground mt-1">
                          {formatDate(notif.createdAt)}
                        </span>
                      </div>
                      <Badge variant={notif.isRead ? "outline" : "default"} className="text-xs shrink-0">
                        {notif.isRead ? "Read" : "Unread"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  )
}