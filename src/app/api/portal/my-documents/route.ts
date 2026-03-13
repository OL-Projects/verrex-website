import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, unauthorized } from "@/lib/rbac"

// GET /api/portal/my-documents — Fetch documents for current user (inbox)
export async function GET(req: Request) {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const type = url.searchParams.get("type")
  const projectId = url.searchParams.get("projectId")

  const documents = await prisma.document.findMany({
    where: {
      recipientId: session.user.id,
      status: { not: "draft" },
      ...(type ? { type } : {}),
      ...(projectId ? { projectId } : {}),
    },
    include: {
      sender: { select: { id: true, name: true, image: true } },
      project: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(documents)
}

// PATCH /api/portal/my-documents — Mark document as viewed
export async function PATCH(req: Request) {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const body = await req.json()
  const { documentId } = body as { documentId: string }
  if (!documentId) return NextResponse.json({ error: "documentId required" }, { status: 400 })

  const doc = await prisma.document.findFirst({
    where: { id: documentId, recipientId: session.user.id },
  })
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const updated = await prisma.document.update({
    where: { id: documentId },
    data: {
      readAt: doc.readAt || new Date(),
      status: doc.status === "sent" ? "viewed" : doc.status,
    },
  })

  return NextResponse.json(updated)
}
