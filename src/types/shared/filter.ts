import { ContentCategory, Visibility } from "@/generated/prisma/enums"

export type CategoryFilter = ContentCategory | "all"

export type VisibilityFilter = Visibility | "all"