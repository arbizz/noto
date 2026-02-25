import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LucideAlertTriangle, LucideFileText, LucideSquareStack } from "lucide-react"
import Link from "next/link"
import type { AdminDashboardReport } from "@/types/shared/dashboard"

interface RecentReportsSectionProps {
  reports: AdminDashboardReport[]
  loading: boolean
}

function getStatusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    suspended: "secondary",
    banned: "destructive",
    pending: "outline",
    reviewed: "secondary",
    resolved: "default",
    rejected: "destructive",
  }
  return <Badge variant={variants[status] || "outline"}>{status}</Badge>
}

function formatReason(reason: string) {
  return reason.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}

export function RecentReportsSection({ reports, loading }: RecentReportsSectionProps) {
  return (
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
      <Card className="overflow-hidden p-0">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : reports.length === 0 ? (
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
                {reports.map((report) => (
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
                        {formatReason(report.reason)}
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
  )
}