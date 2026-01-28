import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { registerSchema } from "@/lib/validations/auth"
import { ZodError } from "zod"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const validated = registerSchema.parse(body)
    const { name, email, password } = validated

    const userExists = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    })

    if (userExists) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword
      }
    })
    
    return NextResponse.json(
      { message: "Account created successfully" },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          error: "Invalid input",
          details: error.issues.map(e => ({
            field: e.path.join("."),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }

    console.error("Register error:", error)
    
    return NextResponse.json(
      { error: "An error occurred during registration. Please try again later." },
      { status: 500 }
    )
  }
}