import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin, unauthorized } from "@/lib/rbac"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return unauthorized()
  const { id } = await params

  const files = await prisma.projectAttachment.findMany({
    where: { projectId: id },
    include: { uploadedBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(files)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return unauthorized()
  const { id } = await params
  const body = await req.json()

  const { fileName, fileUrl, fileSize, fileType, category, caption } = body
  if (!fileName || !fileUrl) return NextResponse.json({ error: "fileName and fileUrl are required" }, { status: 400 })

  const attachment = await prisma.projectAttachment.create({
    data: {
      fileName, fileUrl, fileSize: fileSize || null, fileType: fileType || null,
      category: category || "photo", caption: caption || null,
      uploadedById: session.user.id, projectId: id,
    },
    include: { uploadedBy: { select: { id: true, name: true } } },
  })

  // Auto-log activity
  await prisma.projectActivity.create({
    data: { type: "file_uploaded", content: `File uploaded: "${fileName}"`, authorId: session.user.id, projectId: id },
  })

  return NextResponse.json(attachment, { status: 201 })
}
