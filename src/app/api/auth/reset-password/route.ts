import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPasswordChangedEmail } from "@/lib/email"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()
    if (!token || !password) return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })

    // Find valid token
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!resetRecord) return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 })
    if (resetRecord.expiresAt < new Date()) {
      await prisma.passwordReset.delete({ where: { id: resetRecord.id } })
      return NextResponse.json({ error: "Reset link has expired. Please request a new one." }, { status: 400 })
    }

    // Update password
    const hashed = await bcrypt.hash(password, 12)
    await prisma.user.update({ where: { id: resetRecord.userId }, data: { password: hashed } })

    // Delete used token
    await prisma.passwordReset.delete({ where: { id: resetRecord.id } })

    // Send confirmation email (non-blocking)
    sendPasswordChangedEmail(resetRecord.user.email, resetRecord.user.name).catch(console.error)

    return NextResponse.json({ success: true, message: "Password reset successfully." })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
