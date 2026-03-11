import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, unauthorized } from "@/lib/rbac"

export async function GET() {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const projects = await prisma.project.findMany({
    where: { clientId: session.user.id },
    include: {
      _count: { select: { appointments: true, invoices: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(projects)
}
