import * as z from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.email("Email invalid"),
  password: z.string().min(8, "Need atleast 8 characters")
})