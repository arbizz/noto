export interface DashboardData {
  stats: {
    totalNotes: number
    totalFlashcards: number
    totalBookmarks: number
    totalLikes: number
  }
  recents: {
    notes: RecentItem[]
    flashcards: RecentItem[]
  }
}

export interface RecentItem {
  id: number
  title: string
  category: string
  createdAt: string
  visibility: "public" | "private"
}