import NextAuth, { DefaultSession } from "next-auth"
import { UserRole } from "@/generated/prisma/enums"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      name: string
    }
  }

  interface User {
    id: string
    role: UserRole
    name: string
  }

}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    name: string
  }
}