import { UserRole } from "@/generated/prisma/enums"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      name: string
      status: string
    }
  }

  interface User {
    id: string
    role: UserRole
    name: string
    status: string
  }

}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    name: string
    status: string
  }
}