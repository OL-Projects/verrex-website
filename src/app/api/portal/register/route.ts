import { NextResponse } from "next/server"
import { isEmailTaken, registerUser } from "@/lib/auth"
import { sendWelcomeEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, role, company, phone } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const taken = await isEmailTaken(email)
    if (taken) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const user = await registerUser({ name, email, password, role, company, phone })

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.name).catch(console.error)

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (error: unknown) {
    const err = error as Error
    console.error("Registration error:", err)
    return NextResponse.json({ 
      error: "Registration failed. Please try again.",
      debug: process.env.NODE_ENV === "development" ? undefined : `${err.name}: ${err.message?.substring(0, 300)}`
    }, { status: 500 })
  }
}
