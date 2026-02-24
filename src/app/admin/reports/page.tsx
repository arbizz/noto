"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { ReportReason, ReportStatus } from "@/generated/prisma/enums"
import { FilterConfig, InputFilter } from "@/components/shared/InputFilter"
import { PagePagination } from "@/components/shared/PagePagination"
import { PaginationMeta } from "@/types/shared/pagination"
import { formatDate } from "@/lib/utils"
import { getStatusBadgeVariant, formatReasonLabel } from "@/lib/report-utils"
import { GroupedReport } from "@/types/admin/report"
import { StatusFilter, ReasonFilter } from "@/types/shared/filter"

export default function AdminReportsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [reports, setReports] = useState<GroupedReport[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reviewingId, setReviewingId] = useState<string | null>(null)

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

  const handleUpdateQuery = useCallback((
    paramsObj: Record<string, string | undefined>
  ) => {
    const params = new URLSearchParams(searchParams.toString())

    for (const [key, value] of Object.entries(paramsObj)) {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    }

    router.push(`?${params.toString()}`)
  }, [searchParams, router])

  function getContentIdentifier(report: GroupedReport): string {
    return `${report.contentType}-${report.contentId}`
  }

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
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
        }: { reports: GroupedReport[], pagination: PaginationMeta } = data

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
        setIsLoading(false)
      }
    }

    fetchData()
  }, [searchParams, handleUpdateQuery])

  const filters: FilterConfig[] = [
    {
      type: "status",
      value: status,
      onChange: (value) => {
        const v = value as StatusFilter
        setStatus(v)
        handleUpdateQuery({
          status: v === "all" ? undefined : v,
        })
      }
    },
    {
      type: "reason",
      value: reason,
      onChange: (value) => {
        const v = value as ReasonFilter
        setReason(v)
        handleUpdateQuery({
          reason: v === "all" ? undefined : v,
        })
      }
    },
    {
      type: "order",
      value: order,
      onChange: (value) => {
        const v = value as "asc" | "desc"
        setOrder(v)
        handleUpdateQuery({ order: v })
      }
    }
  ]

  async function handleReviewClick(identifier: string) {
    setReviewingId(identifier)
    try {
      await fetch(`/api/reports/${identifier}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_reviewed" })
      })
    } catch (error) {
      console.error("Failed to set reviewed:", error)
    } finally {
      setReviewingId(null)
      router.push(`/admin/reports/${identifier}`)
    }
  }

  return (
    <>
      <section className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Reports Management</h1>
        <p className="text-muted-foreground">
          Manage and review all user reports (grouped by content)
        </p>
      </section>

      <section className="mb-8 flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm">
        <InputFilter
          filters={filters}
          showStatus
          showReason
          showOrder
        />
      </section>

      <section className="flex flex-col gap-4">
        <div className="rounded-xl border bg-card shadow-sm">
          {isLoading ? (
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
                  <TableHead>Content</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reports</TableHead>
                  <TableHead>Reasons</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Latest Report</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={getContentIdentifier(report)}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {report.content?.title || "Content Deleted"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ID: {report.contentId}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {report.contentOwner ? (
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {report.contentOwner.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {report.contentOwner.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {report.contentType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {report.totalReports} {report.totalReports === 1 ? "report" : "reports"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(report.reasons).map(([reason, count]) => (
                          <Badge key={reason} variant="outline" className="text-xs">
                            {formatReasonLabel(reason)}: {count}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(report.primaryStatus)}>
                        {report.primaryStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(report.latestReportDate)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={reviewingId === getContentIdentifier(report)}
                        onClick={() => handleReviewClick(getContentIdentifier(report))}
                      >
                        {reviewingId === getContentIdentifier(report) ? "Loading..." : "Review"}
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
        {pagination && pagination.totalPages > 1 && !isLoading && (
          <PagePagination pagination={pagination} searchParams={searchParams} />
        )}
      </section>
    </>
  )
}