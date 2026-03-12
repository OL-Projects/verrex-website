import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // Prevent self-deletion
  if (session.user.id === id) {
    return NextResponse.json(
      { error: "Cannot delete your own account" },
      { status: 400 }
    )
  }

  try {
    // Check user exists
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Cascade delete — Prisma schema has onDelete: Cascade for most relations
    // Delete password resets first (explicit)
    await prisma.passwordReset.deleteMany({ where: { userId: id } })

    // Delete the user (cascades projects, appointments, invoices, messages, etc.)
    await prisma.user.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: `User "${user.name}" (${user.email}) and all associated data deleted`,
      deletedUser: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete user" },
      { status: 500 }
    )
  }
}
