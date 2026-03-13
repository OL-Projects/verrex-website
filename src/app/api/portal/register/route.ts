import { NextResponse } from "next/server"
import { isEmailTaken, registerUser } from "@/lib/auth"
import { sendWelcomeEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, company, phone } = body

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

    // SECURITY: Always force role to "client" — never trust client-supplied role
    const user = await registerUser({ name, email, password, role: "client", company, phone })

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.name).catch(console.error)

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 })
  }
}
