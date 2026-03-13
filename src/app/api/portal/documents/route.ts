import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, unauthorized } from "@/lib/rbac"

// GET /api/portal/documents — List documents (admin: all sent, client: received)
export async function GET(req: Request) {
  const session = await requireAuth()
  if (!session) return unauthorized()
  const userId = session.user.id
  const role = session.user.role

  const url = new URL(req.url)
  const type = url.searchParams.get("type") // invoice | contract | estimation | null=all
  const status = url.searchParams.get("status")

  const where: any = { recalledAt: null }
  if (type) where.type = type
  if (status) where.status = status

  if (role === "admin") {
    where.senderId = userId
  } else {
    where.recipientId = userId
  }

  const docs = await prisma.document.findMany({
    where,
    include: {
      sender: { select: { id: true, name: true, role: true } },
      recipient: { select: { id: true, name: true, role: true, company: true } },
      project: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(docs)
}

// POST /api/portal/documents — Send document(s) to recipient(s)
export async function POST(req: Request) {
  const session = await requireAuth()
  if (!session) return unauthorized()
  if (session.user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 })

  const body = await req.json()
  const { documents, recipientIds } = body as {
    documents: Array<{ type: string; title: string; description?: string; fileUrl: string; projectId?: string }>
    recipientIds: string[]
  }

  if (!documents?.length || !recipientIds?.length) {
    return NextResponse.json({ error: "documents and recipientIds required" }, { status: 400 })
  }

  const created = await prisma.$transaction(
    documents.flatMap((doc) =>
      recipientIds.map((rid) =>
        prisma.document.create({
          data: {
            type: doc.type,
            title: doc.title,
            description: doc.description || null,
            fileUrl: doc.fileUrl,
            status: "sent",
            projectId: doc.projectId || null,
            senderId: session.user.id,
            recipientId: rid,
          },
        })
      )
    )
  )

  return NextResponse.json({ sent: created.length, documents: created })
}
