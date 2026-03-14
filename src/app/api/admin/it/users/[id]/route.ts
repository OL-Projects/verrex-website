import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * PATCH /api/admin/it/users/[id]
 * Admin can edit any user's profile fields:
 * name, displayName, displayEmail, phone, company, address, city, postalCode,
 * role, notes, image (profile photo), status (active/suspended)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()

    // Whitelist of editable fields
    const allowedFields = [
      "name", "displayName", "displayEmail", "phone", "company",
      "address", "city", "postalCode", "role", "notes", "image", "status",
    ]

    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) {
        // Validate role values
        if (field === "role" && !["admin", "client", "contractor", "partner", "supplier", "inspector"].includes(body[field])) {
          return NextResponse.json({ error: `Invalid role: ${body[field]}` }, { status: 400 })
        }
        // Validate status values
        if (field === "status" && !["active", "suspended"].includes(body[field])) {
          return NextResponse.json({ error: `Invalid status: ${body[field]}` }, { status: 400 })
        }
        // Allow null to clear optional fields
        updateData[field] = body[field] === "" ? null : body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true, name: true, email: true, role: true, company: true,
        phone: true, address: true, city: true, postalCode: true,
        notes: true, image: true, displayName: true, displayEmail: true,
        status: true, lastLoginAt: true, createdAt: true, updatedAt: true,
      },
    })

    return NextResponse.json({ success: true, user: updated })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update user" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/it/users/[id]
 * Get full user detail with activity summary
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, role: true, company: true,
        phone: true, address: true, city: true, postalCode: true,
        notes: true, image: true, displayName: true, displayEmail: true,
        status: true, lastLoginAt: true, isDemo: true, createdAt: true, updatedAt: true,
        _count: {
          select: {
            projects: true, appointments: true, invoices: true,
            sentMessages: true, leads: true, sentDocuments: true,
            receivedDocuments: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch user" },
      { status: 500 }
    )
  }
}

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
