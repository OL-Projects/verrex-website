import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, unauthorized } from "@/lib/rbac"

export async function GET() {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const invoices = await prisma.invoice.findMany({
    where: { clientId: session.user.id },
    include: {
      project: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(invoices)
}
