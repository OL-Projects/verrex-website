import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, unauthorized } from "@/lib/rbac"
import { verifyAccess } from "../route"

// ─── GET /api/portal/my-projects/[id]/activity ──────────
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (!session) return unauthorized()
  const { id } = await params

  const hasAccess = await verifyAccess(id, session.user.id, session.user.role || "")
  if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const activities = await prisma.projectActivity.findMany({
    where: { projectId: id },
    include: { author: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(activities)
}

// ─── POST — admins + contractors can add activity ───────
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (!session) return unauthorized()
  const role = session.user.role || ""
  if (!["admin", "contractor"].includes(role)) {
    return NextResponse.json({ error: "Only admins and contractors can add activity entries" }, { status: 403 })
  }
  const { id } = await params

  const hasAccess = await verifyAccess(id, session.user.id, role)
  if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { type, content, metadata, attachmentUrls } = await req.json()
  if (!type) return NextResponse.json({ error: "Activity type is required" }, { status: 400 })

  const activity = await prisma.projectActivity.create({
    data: {
      type,
      content: content || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
      attachmentUrls: attachmentUrls ? JSON.stringify(attachmentUrls) : null,
      authorId: session.user.id,
      projectId: id,
    },
    include: { author: { select: { id: true, name: true, role: true } } },
  })

  return NextResponse.json(activity, { status: 201 })
}
