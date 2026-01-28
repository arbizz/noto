"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { ReportReason, ReportStatus, ContentType } from "@/generated/prisma/enums"

type FlashcardData = {
  id: string
  question: string
  answer: string
}

type ReportDetail = {
  id: number
  userId: number
  noteId: number | null
  flashcardSetId: number | null
  contentType: ContentType
  reason: ReportReason
  description: string | null
  status: ReportStatus
  createdAt: Date
  user: {
    id: number
    name: string
    email: string
    image: string | null
    role: string
    status: string
  }
  note?: {
    id: number
    title: string
    description: string | null
    content: any
    category: string
    visibility: string
    createdAt: Date
    updatedAt: Date
    user: {
      id: number
      name: string
      email: string
      image: string | null
    }
    _count: {
      likes: number
      bookmarks: number
      reports: number
    }
  } | null
  flashcardSet?: {
    id: number
    title: string
    description: string | null
    flashcards: FlashcardData[] | any
    category: string
    visibility: string
    createdAt: Date
    updatedAt: Date
    user: {
      id: number
      name: string
      email: string
      image: string | null
    }
    _count: {
      likes: number
      bookmarks: number
      reports: number
    }
  } | null
}

export default function AdminReportDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [report, setReport] = useState<ReportDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>("pending")

  useEffect(() => {
    fetchReport()
  }, [resolvedParams.id])

  async function fetchReport() {
    setLoading(true)
    try {
      const res = await fetch(`/api/reports/${resolvedParams.id}`)
      if (!res.ok) throw new Error("Failed to fetch report")
      
      const data = await res.json()
      setReport(data.report)
      setSelectedStatus(data.report.status)
    } catch (error) {
      console.error("Error fetching report:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(action: string) {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/reports/${resolvedParams.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          status: action === "update_status" ? selectedStatus : undefined
        })
      })

      if (!res.ok) throw new Error("Action failed")

      const data = await res.json()
      
      if (action === "delete_content") {
        // Redirect back to reports list after deletion
        router.push("/admin/reports")
      } else {
        // Refresh the report data
        await fetchReport()
      }
    } catch (error) {
      console.error("Error performing action:", error)
    } finally {
      setActionLoading(false)
    }
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  function formatReasonLabel(reason: string) {
    return reason
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  function getStatusBadgeVariant(status: ReportStatus) {
    switch (status) {
      case "pending": return "default"
      case "reviewed": return "secondary"
      case "resolved": return "outline"
      case "rejected": return "destructive"
      default: return "default"
    }
  }

  function renderNoteContent(content: any) {
    try {
      if (typeof content === 'string') {
        return content
      }
      // If it's TipTap JSON format
      if (content?.type === 'doc' && content?.content) {
        return JSON.stringify(content, null, 2)
      }
      return JSON.stringify(content, null, 2)
    } catch {
      return String(content)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading report...</p>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Report not found</p>
      </div>
    )
  }

  const content = report.note || report.flashcardSet
  const flashcards = report.flashcardSet?.flashcards 
    ? (Array.isArray(report.flashcardSet.flashcards) 
        ? report.flashcardSet.flashcards 
        : [])
    : []

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => router.push("/admin/reports")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Reports
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Report #{report.id}</CardTitle>
                  <CardDescription>
                    Reported on {formatDate(report.createdAt)}
                  </CardDescription>
                </div>
                <Badge variant={getStatusBadgeVariant(report.status)}>
                  {report.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Reporter</Label>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    {report.user.image ? (
                      <img 
                        src={report.user.image} 
                        alt={report.user.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-medium">
                        {report.user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{report.user.name}</p>
                    <p className="text-sm text-muted-foreground">{report.user.email}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-semibold">Reason</Label>
                <p className="mt-2">{formatReasonLabel(report.reason)}</p>
              </div>

              {report.description && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-semibold">Description</Label>
                    <p className="mt-2 text-muted-foreground">{report.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Reported Content */}
          <Card>
            <CardHeader>
              <CardTitle>Reported {report.contentType === "note" ? "Note" : "Flashcard Set"}</CardTitle>
              {content && (
                <CardDescription>
                  Created by {content.user.name} • {content._count.reports} total reports
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {content ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold">Title</Label>
                    <p className="mt-2 text-lg font-medium">{content.title}</p>
                  </div>

                  {content.description && (
                    <div>
                      <Label className="text-sm font-semibold">Description</Label>
                      <p className="mt-2 text-muted-foreground">{content.description}</p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <div>
                      <Label className="text-sm font-semibold">Category</Label>
                      <Badge variant="outline" className="mt-2">
                        {content.category}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Visibility</Label>
                      <Badge variant="outline" className="mt-2">
                        {content.visibility}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-6 text-sm text-muted-foreground">
                    <span>👍 {content._count.likes} likes</span>
                    <span>🔖 {content._count.bookmarks} bookmarks</span>
                    <span>🚩 {content._count.reports} reports</span>
                  </div>

                  {report.contentType === "note" && report.note && (
                    <div>
                      <Label className="text-sm font-semibold">Content Preview</Label>
                      <div className="mt-2 p-4 bg-muted rounded-lg max-h-96 overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap font-mono">
                          {renderNoteContent(report.note.content)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {report.contentType === "flashcard" && flashcards.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold">
                        Flashcards ({flashcards.length})
                      </Label>
                      <div className="mt-2 space-y-2 max-h-96 overflow-y-auto">
                        {flashcards.map((card: FlashcardData, index: number) => (
                          <div key={card.id || index} className="p-3 bg-muted rounded-lg">
                            <p className="font-medium text-sm">Q: {card.question}</p>
                            <p className="text-sm text-muted-foreground mt-1">A: {card.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <Label className="text-sm font-semibold">Content Owner</Label>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        {content.user.image ? (
                          <img 
                            src={content.user.image} 
                            alt={content.user.name}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {content.user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{content.user.name}</p>
                        <p className="text-xs text-muted-foreground">{content.user.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Content has been deleted</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Update Status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => setSelectedStatus(value as ReportStatus)}
                >
                  <SelectTrigger id="status" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => handleAction("update_status")}
                disabled={actionLoading || selectedStatus === report.status}
                className="w-full"
              >
                Update Status
              </Button>

              <Separator />

              {content && (
                <>
                  <Button
                    onClick={() => handleAction("validate_content")}
                    disabled={actionLoading}
                    variant="outline"
                    className="w-full"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Validate Content
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full"
                        disabled={actionLoading}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete {report.contentType === "note" ? "Note" : "Flashcard Set"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the{" "}
                          {report.contentType} and all related data. All reports for this content
                          will be marked as resolved.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleAction("delete_content")}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </CardContent>
          </Card>

          {/* Report Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Report Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">Report ID</Label>
                <p className="font-medium">#{report.id}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Content Type</Label>
                <p className="font-medium capitalize">{report.contentType}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Content ID</Label>
                <p className="font-medium">
                  #{report.noteId || report.flashcardSetId || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Created At</Label>
                <p className="font-medium">{formatDate(report.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}