/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { use, useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Trash2, AlertTriangle, XCircle } from "lucide-react"
import Image from "next/image"

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
import { toast } from "sonner"

import { ReportStatus } from "@/generated/prisma/enums"
import { TiptapEditor } from "@/components/user/TiptapEditor"
import { penaltyLevels } from "@/constants/admin"
import { formatDate } from "@/lib/utils"
import { FlashcardData, ReportDetail } from "@/types/admin/report"
import { formatReasonLabel, getStatusBadgeVariant, getUserStatusColor } from "@/lib/report-utils"

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
  const [selectedPenalty, setSelectedPenalty] = useState<1 | 2 | 3>(1)

  const fetchReport = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reports/${resolvedParams.id}`)
      if (!res.ok) throw new Error("Failed to fetch report")
      
      const data = await res.json()
      setReport(data)
    } catch (error) {
      console.error("Error fetching report:", error)
      toast.error("Failed to load report")
    } finally {
      setLoading(false)
    }
  }, [resolvedParams.id])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  async function handleAction(action: string, penaltyLevel?: 1 | 2 | 3) {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/reports/${resolvedParams.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          ...(penaltyLevel && { penaltyLevel })
        })
      })

      if (!res.ok) throw new Error("Action failed")

      const data = await res.json()
      
      if (action === "delete_content") {
        toast.success(data.message)
        setTimeout(() => router.push("/admin/reports"), 1000)
      } else if (action === "reduce_score") {
        toast.success(data.message, {
          description: `User score: ${data.previousScore} → ${data.newScore}${data.statusChanged ? ` | Status: ${data.newStatus}` : ""}`
        })
        await fetchReport()
      } else {
        toast.success(data.message)
        await fetchReport()
      }
    } catch (error) {
      console.error("Error performing action:", error)
      toast.error("Action failed")
    } finally {
      setActionLoading(false)
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

  const content = report.content
  const flashcards = content && report.contentType === "flashcard" && content.flashcards
    ? (Array.isArray(content.flashcards) ? content.flashcards : [])
    : []

  const isSettled = !report.statusCounts["pending"] && !report.statusCounts["reviewed"]

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
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reports Summary</CardTitle>
              <CardDescription>
                {report.totalReports} {report.totalReports === 1 ? "person has" : "people have"} reported this content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Report Reasons</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(report.reasonCounts).map(([reason, count]) => (
                    <Badge key={reason} variant="outline">
                      {formatReasonLabel(reason)}: {count}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-semibold">Status Distribution</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(report.statusCounts).map(([status, count]) => (
                    <Badge key={status} variant={getStatusBadgeVariant(status as ReportStatus)}>
                      {status}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Individual Reports ({report.reports.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {report.reports.map((r) => (
                <div key={r.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        {r.user.image ? (
                          <div className="relative h-10 w-10">
                            <Image
                              src={r.user.image}
                              alt={r.user.name}
                              fill
                              className="rounded-full object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>
                        ) : (
                          <span className="text-lg font-medium">
                            {r.user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{r.user.name}</p>
                        <p className="text-xs text-muted-foreground">{r.user.email}</p>
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(r.status)}>
                      {r.status}
                    </Badge>
                  </div>
                  <div className="ml-13">
                    <p className="text-sm"><span className="font-semibold">Reason:</span> {formatReasonLabel(r.reason)}</p>
                    {r.description && (
                      <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Reported on {formatDate(r.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

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

                  {report.contentType === "note" && content.content && (
                    <div>
                      <Label className="text-sm font-semibold">Content Preview</Label>
                      <TiptapEditor
                        content={content.content}
                        onChange={() => {}}
                        readonly
                      />
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
                          <div className="relative h-8 w-8">
                            <Image
                              src={content.user.image}
                              alt={content.user.name}
                              fill
                              className="rounded-full object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>
                        ) : (
                          <span className="text-sm font-medium">
                            {content.user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{content.user.name}</p>
                        <p className="text-xs text-muted-foreground">{content.user.email}</p>
                        <p className={`text-xs ${getUserStatusColor(content.user.score)}`}>
                          Score: {content.user.score} | Status: {content.user.status}
                        </p>
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

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => handleAction("set_rejected")}
                disabled={actionLoading || isSettled}
                variant="outline"
                className="w-full"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject Reports
              </Button>

              <Separator />

              {content && (
                <>
                  <div>
                    <Label htmlFor="penalty">Apply Penalty</Label>
                    <Select
                      value={String(selectedPenalty)}
                      onValueChange={(value) => setSelectedPenalty(Number(value) as 1 | 2 | 3)}
                    >
                      <SelectTrigger id="penalty" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(penaltyLevels).map(([level, data]) => (
                          <SelectItem key={level} value={level}>
                            {data.label} (-{data.points} pts)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {penaltyLevels[selectedPenalty].description}
                    </p>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full"
                        disabled={actionLoading || !content || isSettled}
                      >
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Reduce Score (-{penaltyLevels[selectedPenalty].points} pts)
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Apply Penalty?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will reduce <strong>{content.user.name}</strong>&apos;s score by{" "}
                          <strong>{penaltyLevels[selectedPenalty].points} points</strong> ({penaltyLevels[selectedPenalty].label}).
                          <br /><br />
                          Current score: <strong>{content.user.score}</strong><br />
                          New score: <strong>{Math.max(0, content.user.score - penaltyLevels[selectedPenalty].points)}</strong>
                          <br /><br />
                          All reports for this content will be marked as resolved.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleAction("reduce_score", selectedPenalty)}
                          variant="destructive"
                        >
                          Apply Penalty
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Separator />

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full"
                        disabled={actionLoading || !content || isSettled}
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
                          {report.contentType} and all related data. All {report.totalReports} reports for this content
                          will be marked as resolved.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleAction("delete_content")}
                          variant="destructive"
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Report Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">Content Type</Label>
                <p className="font-medium capitalize">{report.contentType}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Content ID</Label>
                <p className="font-medium">#{report.contentId}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Total Reports</Label>
                <p className="font-medium">{report.totalReports}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Latest Report</Label>
                <p className="font-medium">{formatDate(report.latestReport.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}