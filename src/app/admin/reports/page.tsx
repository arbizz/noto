"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LucideSearch } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

import { ReportReason, ReportStatus, ContentType } from "@/generated/prisma/enums"

type ReportWithRelations = {
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
    score: number
    role: string
    status: string
  }
  note?: {
    id: number
    title: string
    category: string
    visibility: string
  } | null
  flashcardSet?: {
    id: number
    title: string
    category: string
    visibility: string
  } | null
}

type StatusFilter = ReportStatus | "all"
type ReasonFilter = ReportReason | "all"

type PaginationMeta = {
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

const reportStatuses = [
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
]

const reportReasons = [
  { value: "inappropriate_content", label: "Inappropriate Content" },
  { value: "incorrect_information", label: "Incorrect Information" },
  { value: "misleading_explanation", label: "Misleading Explanation" },
  { value: "plagiarism", label: "Plagiarism" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Other" },
]

export default function AdminReportsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [reports, setReports] = useState<ReportWithRelations[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)

  const [status, setStatus] = useState<StatusFilter>(() => {
    return searchParams.get("status") as ReportStatus ?? "all"
  })

  const [reason, setReason] = useState<ReasonFilter>(() => {
    return searchParams.get("reason") as ReportReason ?? "all"
  })

  const [order, setOrder] = useState<"asc" | "desc">(() => {
    const value = searchParams.get("order")
    return value === "asc" || value === "desc" ? value : "desc"
  })

  function handleUpdateQuery(
    paramsObj: Record<string, string | undefined>
  ) {
    const params = new URLSearchParams(searchParams.toString())

    for (const [key, value] of Object.entries(paramsObj)) {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    }

    router.push(`?${params.toString()}`)
  }

  function createPageUrl(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    return `?${params.toString()}`
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  function getStatusBadgeVariant(status: ReportStatus) {
    switch (status) {
      case "pending":
        return "default"
      case "reviewed":
        return "secondary"
      case "resolved":
        return "outline"
      case "rejected":
        return "destructive"
      default:
        return "default"
    }
  }

  function formatReasonLabel(reason: string) {
    return reason
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/reports?${searchParams.toString()}`,
          { method: "GET" }
        )

        if (!res.ok) {
          throw new Error("Failed to fetch reports")
        }

        const data = await res.json()

        const {
          reports,
          pagination,
        }: { reports: ReportWithRelations[], pagination: PaginationMeta } = data

        const requestedPage = parseInt(
          searchParams.get("page") ?? "1"
        )

        if (
          requestedPage > pagination.totalPages &&
          pagination.totalPages > 0
        ) {
          handleUpdateQuery({
            page: String(pagination.totalPages),
          })
          return
        }

        if (requestedPage < 1) {
          handleUpdateQuery({ page: "1" })
          return
        }

        setReports(reports)
        setPagination(pagination)
      } catch (error) {
        console.error("Error fetching reports:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchParams])

  return (
    <>
      <section className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Reports Management</h1>
        <p className="text-muted-foreground">
          Manage and review all user reports
        </p>
      </section>

      <section className="mb-8 flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm">
        <div className="grid grid-cols-3 w-full gap-4">
          <Select
            value={status}
            onValueChange={(value) => {
              const v = value as StatusFilter
              setStatus(v)
              handleUpdateQuery({
                status: v === "all" ? undefined : v,
              })
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {reportStatuses.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={reason}
            onValueChange={(value) => {
              const v = value as ReasonFilter
              setReason(v)
              handleUpdateQuery({
                reason: v === "all" ? undefined : v,
              })
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Reason" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Reasons</SelectItem>
              {reportReasons.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={order}
            onValueChange={(value) => {
              const v = value as "asc" | "desc"
              setOrder(v)
              handleUpdateQuery({ order: v })
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Order" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="desc">Newest</SelectItem>
              <SelectItem value="asc">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="rounded-xl border bg-card shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading reports...
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No reports found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      #{report.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {report.user.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {report.user.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {report.note?.title || report.flashcardSet?.title || "N/A"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ID: {report.noteId || report.flashcardSetId}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {report.contentType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {formatReasonLabel(report.reason)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(report.status)}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(report.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/reports/${report.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </section>

      <section className="mt-10 flex justify-center">
        {pagination && pagination.totalPages > 1 && (
          <Pagination>
            <PaginationContent className="gap-1">
              <PaginationItem>
                <PaginationPrevious
                  href={
                    pagination.hasPreviousPage
                      ? createPageUrl(
                          pagination.currentPage - 1
                        )
                      : "#"
                  }
                  aria-disabled={
                    !pagination.hasPreviousPage
                  }
                  className={
                    !pagination.hasPreviousPage
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {(() => {
                const total = pagination.totalPages
                const current = pagination.currentPage
                const pages: (number | string)[] = []

                pages.push(1)

                if (current > 3) {
                  pages.push("ellipsis-start")
                }

                const neighbors = [
                  current - 1,
                  current,
                  current + 1,
                ].filter(
                  (p) => p > 1 && p < total
                )

                pages.push(...neighbors)

                if (current < total - 2) {
                  pages.push("ellipsis-end")
                }

                if (total > 1) {
                  pages.push(total)
                }

                return pages.map((page, index) => {
                  if (
                    page === "ellipsis-start" ||
                    page === "ellipsis-end"
                  ) {
                    return (
                      <PaginationItem
                        key={`ellipsis-${index}`}
                      >
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }

                  const pageNumber = page as number

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href={createPageUrl(pageNumber)}
                        isActive={
                          pagination.currentPage ===
                          pageNumber
                        }
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })
              })()}

              <PaginationItem>
                <PaginationNext
                  href={
                    pagination.hasNextPage
                      ? createPageUrl(
                          pagination.currentPage + 1
                        )
                      : "#"
                  }
                  aria-disabled={!pagination.hasNextPage}
                  className={
                    !pagination.hasNextPage
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </section>
    </>
  )
}