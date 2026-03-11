import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin, unauthorized } from "@/lib/rbac"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return unauthorized()
  const { id } = await params

  const activities = await prisma.projectActivity.findMany({
    where: { projectId: id },
    include: { author: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(activities)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return unauthorized()
  const { id } = await params
  const body = await req.json()

  const { type, content, metadata, attachmentUrls } = body
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
