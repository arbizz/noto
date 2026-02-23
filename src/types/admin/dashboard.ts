export interface AdminDashboardData {
  stats: {
    users: {
      total: number
      active: number
      suspended: number
      banned: number
    }
    content: {
      totalNotes: number
      totalFlashcards: number
      publicNotes: number
      publicFlashcards: number
    }
    reports: {
      total: number
      pending: number
      reviewed: number
    }
  }
  recents: {
    reports: RecentReport[]
    users: RecentUser[]
  }
  categories: {
    notes: CategoryCount[]
    flashcards: CategoryCount[]
  }
}

export interface RecentReport {
  id: number
  contentType: "note" | "flashcard"
  reason: string
  status: string
  createdAt: string
  user: {
    id: number
    name: string
    email: string
  }
  note?: {
    id: number
    title: string
    user: {
      id: number
      name: string
    }
  }
  flashcardSet?: {
    id: number
    title: string
    user: {
      id: number
      name: string
    }
  }
}

export interface RecentUser {
  id: number
  name: string
  email: string
  role: string
  status: string
  createdAt: string
  _count: {
    notes: number
    flashcardSets: number
  }
}

export interface CategoryCount {
  category: string
  _count: {
    id: number
  }
}