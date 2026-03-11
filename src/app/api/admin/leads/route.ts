import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin, unauthorized } from "@/lib/rbac"

export async function GET() {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const leads = await prisma.lead.findMany({
    include: { assignedTo: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(leads)
}

export async function PATCH(request: Request) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const { id, status, assignedToId } = await request.json()
  if (!id) return NextResponse.json({ error: "Lead ID required" }, { status: 400 })

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(assignedToId !== undefined && { assignedToId }),
      ...(status === "converted" && { convertedAt: new Date() }),
    },
  })

  return NextResponse.json(lead)
}
