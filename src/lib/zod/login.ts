import * as z from "zod"

export const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(8, "Need atleast 8 characters")
})