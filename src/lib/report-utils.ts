import { ReportStatus } from "@/generated/prisma/enums"

export function formatReasonLabel(reason: string): string {
  return reason
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function getStatusBadgeVariant(status: ReportStatus) {
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

export function getUserStatusColor(score: number): string {
  if (score <= 15) return "text-red-600 font-semibold"
  if (score <= 30) return "text-orange-600 font-semibold"
  if (score <= 50) return "text-yellow-600 font-semibold"
  return "text-green-600 font-semibold"
}