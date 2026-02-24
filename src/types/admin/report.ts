import { ReportReason, ReportStatus } from "@/generated/prisma/enums"
import { JSONContent } from "@tiptap/core"

export type FlashcardData = {
  id: string
  question: string
  answer: string
}

export type Reporter = {
  id: number
  userId: number
  user: {
    id: number
    name: string
    email: string
    image: string | null
    score: number
  }
  reason: ReportReason
  description: string | null
  status: ReportStatus
  createdAt: Date
}

export type ReportDetail = {
  contentId: number
  contentType: "note" | "flashcard"
  content: {
    id: number
    title: string
    description: string | null
    content?: JSONContent
    flashcards?: FlashcardData[]
    category: string
    visibility: string
    createdAt: Date
    updatedAt: Date
    userId: number
    user: {
      id: number
      name: string
      email: string
      image: string | null
      score: number
      status: string
    }
    _count: {
      likes: number
      bookmarks: number
      reports: number
    }
  } | null
  totalReports: number
  reasonCounts: Record<ReportReason, number>
  statusCounts: Record<ReportStatus, number>
  reports: Reporter[]
  latestReport: Reporter
}

export type GroupedReport = {
  contentId: number
  contentType: "note" | "flashcard"
  content: {
    id: number
    title: string
    category: string
    visibility: string
    userId: number
  } | null
  contentOwner: {
    id: number
    name: string
    email: string
    image: string | null
  } | null
  totalReports: number
  latestReportDate: Date
  statuses: ReportStatus[]
  reasons: Record<ReportReason, number>
  reporters: Array<{
    id: number
    userId: number
    userName: string
    userEmail: string
    userImage: string | null
    reason: ReportReason
    description: string | null
    status: ReportStatus
    createdAt: Date
  }>
  primaryStatus: ReportStatus
}