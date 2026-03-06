import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 })

    // Always return success to prevent email enumeration
    const successMsg = { success: true, message: "If that email exists, we sent a reset link." }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (!user) return NextResponse.json(successMsg)

    // Delete any existing reset tokens for this user
    await prisma.passwordReset.deleteMany({ where: { userId: user.id } })

    // Create new reset token (1 hour expiry)
    const token = crypto.randomUUID()
    await prisma.passwordReset.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    })

    // Send reset email — AWAIT so we catch failures
    try {
      await sendPasswordResetEmail(user.email, user.name, token)
      console.log("✅ Reset email sent to", user.email)
    } catch (emailErr) {
      console.error("❌ Failed to send reset email:", emailErr)
      // Still return success to prevent email enumeration
    }

    return NextResponse.json(successMsg)
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
