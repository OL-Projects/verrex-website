import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, unauthorized } from "@/lib/rbac"

// PATCH /api/portal/documents/[id] — Mark as read OR unsend
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (!session) return unauthorized()
  const { id } = await params
  const body = await req.json()
  const { action } = body as { action: "read" | "unsend" }

  const doc = await prisma.document.findUnique({ where: { id } })
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Mark as read (client opens the document)
  if (action === "read") {
    if (doc.recipientId !== session.user.id) {
      return NextResponse.json({ error: "Not your document" }, { status: 403 })
    }
    const updated = await prisma.document.update({
      where: { id },
      data: { readAt: new Date(), status: doc.status === "sent" ? "viewed" : doc.status },
    })
    return NextResponse.json(updated)
  }

  // Unsend (admin only, within 25 minutes)
  if (action === "unsend") {
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 })
    }
    if (doc.senderId !== session.user.id) {
      return NextResponse.json({ error: "Not your document" }, { status: 403 })
    }
    const elapsed = Date.now() - doc.createdAt.getTime()
    if (elapsed > 25 * 60 * 1000) {
      return NextResponse.json({ error: "Unsend window expired (25 min)" }, { status: 403 })
    }
    const updated = await prisma.document.update({
      where: { id },
      data: { recalledAt: new Date(), status: "draft" },
    })
    return NextResponse.json(updated)
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}

// GET /api/portal/documents/[id] — Get document with recipient info
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (!session) return unauthorized()
  const { id } = await params

  const doc = await prisma.document.findUnique({
    where: { id },
    include: {
      sender: { select: { id: true, name: true, role: true, image: true } },
      recipient: { select: { id: true, name: true, role: true, company: true } },
      project: { select: { id: true, title: true } },
    },
  })

  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Only sender or recipient can view
  if (doc.senderId !== session.user.id && doc.recipientId !== session.user.id) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 })
  }

  return NextResponse.json(doc)
}
