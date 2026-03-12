import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    // Check user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate secure temporary password
    const tempPassword = generateTempPassword()
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    // Update user's password
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    })

    // Clear any existing password reset tokens
    await prisma.passwordReset.deleteMany({ where: { userId: id } })

    return NextResponse.json({
      success: true,
      message: `Password reset for "${user.name}" (${user.email})`,
      temporaryPassword: tempPassword,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      note: "Share this temporary password securely. The user should change it upon next login.",
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to reset password" },
      { status: 500 }
    )
  }
}

function generateTempPassword(): string {
  // Generate a readable temporary password: 3 words + 2 digits + special char
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
  const special = "!@#$%"
  let password = ""
  const bytes = crypto.randomBytes(12)
  for (let i = 0; i < 10; i++) {
    password += chars[bytes[i] % chars.length]
  }
  password += special[bytes[10] % special.length]
  password += bytes[11] % 10
  return password
}
