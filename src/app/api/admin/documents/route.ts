import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin, unauthorized } from "@/lib/rbac"

// GET /api/admin/documents — List all documents (admin view)
export async function GET(req: Request) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const type = url.searchParams.get("type")
  const projectId = url.searchParams.get("projectId")

  const documents = await prisma.document.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(projectId ? { projectId } : {}),
    },
    include: {
      sender: { select: { id: true, name: true } },
      recipient: { select: { id: true, name: true, role: true, company: true } },
      project: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(documents)
}

// POST /api/admin/documents — Admin sends a document
export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const body = await req.json()
  const { type, title, description, fileUrl, recipientId, projectId } = body as {
    type: string; title: string; description?: string; fileUrl: string; recipientId: string; projectId?: string
  }

  if (!type || !title || !fileUrl || !recipientId) {
    return NextResponse.json({ error: "type, title, fileUrl, recipientId required" }, { status: 400 })
  }

  const doc = await prisma.document.create({
    data: {
      type, title, description: description || null, fileUrl,
      status: "sent", senderId: session.user.id, recipientId, projectId: projectId || null,
    },
    include: {
      recipient: { select: { id: true, name: true } },
      project: { select: { id: true, title: true } },
    },
  })

  return NextResponse.json(doc)
}

// DELETE /api/admin/documents?documentId=xxx
export async function DELETE(req: Request) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const documentId = url.searchParams.get("documentId")
  if (!documentId) return NextResponse.json({ error: "documentId required" }, { status: 400 })

  await prisma.document.delete({ where: { id: documentId } })
  return NextResponse.json({ success: true })
}
