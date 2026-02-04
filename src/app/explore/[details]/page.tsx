"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { 
  ArrowLeft, 
  Heart,
  Calendar,
  User as UserIcon,
  LucideRepeat,
  LogIn
} from "lucide-react"

import { TiptapEditor } from "@/components/user/TiptapEditor"
import { JSONContent } from "@tiptap/core"
import { cn } from "@/lib/utils"

interface Flashcard {
  front: string
  back: string
}

type ExploreContent = {
  id: number
  userId: number
  contentType: "note" | "flashcard"
  title: string
  description: string | null
  content: any
  visibility: string
  category: string
  createdAt: Date | string
  updatedAt: Date | string
  user: {
    id: number
    name: string | null
    image: string | null
  }
  _count: {
    likes: number
  }
}

export default function ExploreDetailPage() {
  const router = useRouter()
  const params = useParams()
  const details = params.details as string

  const [content, setContent] = useState<ExploreContent | null>(null)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [note, setNote] = useState<JSONContent>({})
  const [isLoading, setIsLoading] = useState(true)

  // Flashcard viewer states
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  useEffect(() => {
    async function fetchContent() {
      setIsLoading(true)
      try {
        console.log("Fetching content for details:", details)
        
        const res = await fetch(`/api/explore/${details}`)
        
        console.log("Response status:", res.status)
        
        if (!res.ok) {
          const errorData = await res.json()
          console.error("API Error:", errorData)
          throw new Error(errorData.error || "Failed to fetch content")
        }

        const data = await res.json()
        console.log("Content data received:", data)
        
        setContent(data.content)
        const { content: contentData } = data.content

        if (data.content.contentType === "flashcard") {
          setFlashcards(contentData as Flashcard[])
        } else {
          setNote(contentData as JSONContent)
        }
      } catch (error) {
        console.error("Error fetching content:", error)
        toast.error(error instanceof Error ? error.message : "Failed to load content")
        
        setTimeout(() => {
          router.push("/explore")
        }, 1500)
      } finally {
        setIsLoading(false)
      }
    }

    if (details) {
      fetchContent()
    }
  }, [details, router])

  function nextCard() {
    setIsFlipped(false)
    setCurrentIndex((i) => Math.min(i + 1, (flashcards.length || 1) - 1))
  }

  function prevCard() {
    setIsFlipped(false)
    setCurrentIndex((i) => Math.max(i - 1, 0))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!content) {
    return null
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  const getCategoryLabel = (category: string) => {
    return category
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const currentCard = flashcards[currentIndex]

  return (
    <>
      <section className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Explore
        </Button>

        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">
                  {content.contentType === "note" ? "Note" : "Flashcard"}
                </Badge>
                <Badge variant="outline">
                  {getCategoryLabel(content.category)}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold">{content.title}</h1>
              {content.description && (
                <p className="text-muted-foreground mt-2">
                  {content.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={content.user.image || undefined} />
                <AvatarFallback>
                  <UserIcon className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{content.user.name}</span>
            </div>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDate(content.createdAt)}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Heart className="h-4 w-4" />
                {content._count.likes} {content._count.likes === 1 ? 'like' : 'likes'}
              </div>

              <Button
                variant="default"
                size="sm"
                onClick={() => router.push("/auth/signin")}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In to Interact
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        {content.contentType === "note" ? (
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Content Type: Note</p>
              <TiptapEditor
                content={note}
                onChange={() => {}}
                readonly
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div 
              className="w-full max-w-2xl h-80 cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <Card 
                className={cn(
                  "h-full w-full flex items-center justify-center transition-colors duration-200 hover:bg-muted/30 border-2",
                  isFlipped ? "border-primary/50 bg-muted/10" : "border-border"
                )}
              >
                <CardContent className="text-center p-8 w-full">
                  <div className="flex flex-col items-center gap-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider",
                      isFlipped 
                        ? "bg-primary/10 text-primary" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {isFlipped ? "Answer / Back" : "Question / Front"}
                    </span>

                    <p className="text-2xl font-medium whitespace-pre-wrap animate-in fade-in zoom-in-95 duration-200">
                      {currentCard && (isFlipped ? currentCard.back : currentCard.front)}
                    </p>

                    <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1 opacity-70">
                      <LucideRepeat className="w-3 h-3" />
                      Click card to {isFlipped ? "see question" : "reveal answer"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={prevCard}
                disabled={currentIndex === 0}
                size="lg"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={nextCard}
                disabled={currentIndex === flashcards.length - 1}
                size="lg"
              >
                Next
              </Button>
            </div>

            <p className="text-lg font-semibold">
              {currentIndex + 1} / {flashcards.length}
            </p>
          </div>
        )}
      </section>
    </>
  )
}