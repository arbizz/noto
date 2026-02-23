// User

export interface UserDashboardStats {
  totalNotes: number
  totalFlashcards: number
  totalBookmarks: number
  totalLikes: number
}

export interface DashboardRecentItem {
  id: number
  title: string
  category: string
  createdAt: string
  visibility: "public" | "private"
}

export interface UserDashboardData {
  stats: UserDashboardStats
  recents: {
    notes: DashboardRecentItem[]
    flashcards: DashboardRecentItem[]
  }
}

// Admin

export interface AdminDashboardStats {
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

export interface AdminDashboardReport {
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
    user: { id: number; name: string }
  }
  flashcardSet?: {
    id: number
    title: string
    user: { id: number; name: string }
  }
}

export interface AdminDashboardUser {
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

export interface AdminDashboardCategoryCount {
  category: string
  _count: { id: number }
}

export interface AdminDashboardData {
  stats: AdminDashboardStats
  recents: {
    reports: AdminDashboardReport[]
    users: AdminDashboardUser[]
  }
  categories: {
    notes: AdminDashboardCategoryCount[]
    flashcards: AdminDashboardCategoryCount[]
  }
}