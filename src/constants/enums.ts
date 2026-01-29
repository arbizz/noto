import { ContentCategory, Visibility, ReportReason, ReportStatus } from "@/generated/prisma/enums"

export const categoryOptions = [
  { value: ContentCategory.mathematics, label: "Mathematics" },
  { value: ContentCategory.science, label: "Science" },
  { value: ContentCategory.language, label: "Language" },
  { value: ContentCategory.social_science, label: "Social Science" },
  { value: ContentCategory.computer_science, label: "Computer Science" },
  { value: ContentCategory.business_economics, label: "Business Economics" },
  { value: ContentCategory.engineering, label: "Engineering" },
  { value: ContentCategory.arts_humanities, label: "Arts Humanities" },
  { value: ContentCategory.health_medicine, label: "Health Medicine" },
  { value: ContentCategory.test_preparation, label: "Test Preparation" },
  { value: ContentCategory.other, label: "Other" },
]

// export const visibilityOptions = [
//   { value: Visibility.public, label: "Public" },
//   { value: Visibility.private, label: "Private" },
// ]

export const reportReasonOptions = [
  { value: ReportReason.inappropriate_content, label: "Inappropriate Content" },
  { value: ReportReason.incorrect_information, label: "Incorrect Information" },
  { value: ReportReason.misleading_explanation, label: "Misleading Explanation" },
  { value: ReportReason.plagiarism, label: "Plagiarism" },
  { value: ReportReason.spam, label: "Spam" },
  { value: ReportReason.other, label: "Other" },
]

export const reportStatusOptions = [
  { value: ReportStatus.pending, label: "Pending" },
  { value: ReportStatus.reviewed, label: "Reviewed" },
  { value: ReportStatus.resolved, label: "Resolved" },
  { value: ReportStatus.rejected, label: "Rejected" },
]

// export const orderOptions = [
//   { value: "desc" as const, label: "Newest First" },
//   { value: "asc" as const, label: "Oldest First" },
// ]

// export const orderOptionsShort = [
//   { value: "desc" as const, label: "Newest" },
//   { value: "asc" as const, label: "Oldest" },
// ]