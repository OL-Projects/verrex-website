import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin, unauthorized } from "@/lib/rbac"

export async function GET() {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const clients = await prisma.user.findMany({
    where: { role: "client" },
    select: {
      id: true, name: true, email: true, phone: true, company: true,
      address: true, city: true, createdAt: true,
      _count: { select: { projects: true, appointments: true, invoices: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(clients)
}
