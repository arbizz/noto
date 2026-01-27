"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ReportReason } from "@/generated/prisma/enums"
import { LucideAlertTriangle } from "lucide-react"

const reportReasons = [
  { value: ReportReason.inappropriate_content, label: "Inappropriate Content" },
  { value: ReportReason.incorrect_information, label: "Incorrect Information" },
  { value: ReportReason.misleading_explanation, label: "Misleading Explanation" },
  { value: ReportReason.plagiarism, label: "Plagiarism" },
  { value: ReportReason.spam, label: "Spam" },
  { value: ReportReason.other, label: "Other" },
]

interface ReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (reason: ReportReason, description?: string) => Promise<void>
  contentTitle: string
  contentType: "note" | "flashcard"
}

export function ReportDialog({
  open,
  onOpenChange,
  onSubmit,
  contentTitle,
  contentType,
}: ReportDialogProps) {
  const [reason, setReason] = useState<ReportReason>(ReportReason.spam)
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit(reason, description.trim() || undefined)
      // Reset form
      setReason(ReportReason.spam)
      setDescription("")
      onOpenChange(false)
    } catch (error) {
      console.error("Error submitting report:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <LucideAlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500" />
            </div>
            <div>
              <DialogTitle>Report Content</DialogTitle>
              <DialogDescription className="mt-1">
                Report this {contentType}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-sm font-medium text-muted-foreground">
              {contentType === "note" ? "Note" : "Flashcard Set"}:
            </p>
            <p className="mt-1 line-clamp-2 text-sm font-semibold">
              {contentTitle}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason <span className="text-red-500">*</span>
            </Label>
            <Select
              value={reason}
              onValueChange={(value) => setReason(value as ReportReason)}
            >
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {reportReasons.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Additional Details <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Provide additional context about your report..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={100}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/100 characters
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-900/10">
            <p className="text-xs text-amber-800 dark:text-amber-500">
              <strong>Note:</strong> False reports may result in penalties to your account.
              Please only report content that genuinely violates our community guidelines.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}