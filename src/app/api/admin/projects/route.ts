import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin, unauthorized } from "@/lib/rbac"

export async function GET() {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const projects = await prisma.project.findMany({
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      _count: { select: { appointments: true, invoices: true, activities: true, tasks: true, attachments: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(projects)
}

export async function POST(request: Request) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const body = await request.json()
  const { title, description, status, type, address, city, postalCode, clientId, totalValue, notes } = body

  if (!title || !clientId) {
    return NextResponse.json({ error: "Title and client are required" }, { status: 400 })
  }

  const client = await prisma.user.findUnique({ where: { id: clientId } })
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 })
  }

  const project = await prisma.project.create({
    data: {
      title, description, status: status || "pending", type,
      address, city, postalCode, clientId, totalValue: totalValue ? parseFloat(totalValue) : null, notes,
    },
    include: { client: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json(project, { status: 201 })
}
