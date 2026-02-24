import { ContentCategory, ReportReason, ReportStatus, Visibility } from "@/generated/prisma/enums"

export type CategoryFilter = ContentCategory | "all"

export type VisibilityFilter = Visibility | "all"

export type StatusFilter = ReportStatus | "all"

export type ReasonFilter = ReportReason | "all"