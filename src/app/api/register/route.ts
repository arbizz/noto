import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {name, email, password} = body

    const userExist = await prisma.user.findUnique({
      where: { email },
    })

    if (userExist) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      )
    }

    const hash = await bcrypt.hash(password, 10)
  
    await prisma.user.create({
      data: {
        name,
        email,
        password: hash
      }
    })
    
    return NextResponse.json(
      { message: "Success" },
      { status: 201 },
    )
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 },
    )
  }
}