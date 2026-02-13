import { z } from "zod"

export const magicLinkSchema = z.object({
  email: z
    .email("Please enter a vaid email address")
    .max(100, "Email must be less than 100 characters")
})

export type magicLinkInput = z.infer<typeof magicLinkSchema>