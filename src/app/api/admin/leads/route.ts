import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin, unauthorized } from "@/lib/rbac"

// GET /api/admin/leads — Paginated, searchable, filterable
export async function GET(request: Request) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get("page") || "1")
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200)
  const search = url.searchParams.get("search") || ""
  const status = url.searchParams.get("status") || ""
  const priority = url.searchParams.get("priority") || ""
  const source = url.searchParams.get("source") || ""
  const stage = url.searchParams.get("stage") || ""
  const sortBy = url.searchParams.get("sortBy") || "createdAt"
  const sortDir = url.searchParams.get("sortDir") === "asc" ? "asc" : "desc"

  // Build where clause
  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (priority) where.priority = priority
  if (source) where.source = source
  if (stage) where.stage = stage
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { company: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
      { notes: { contains: search, mode: "insensitive" } },
    ]
  }

  const [leads, total, statusCounts] = await Promise.all([
    prisma.lead.findMany({
      where: where as any,
      include: { assignedTo: { select: { id: true, name: true } } },
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lead.count({ where: where as any }),
    prisma.lead.groupBy({ by: ["status"], _count: { status: true } }),
  ])

  const counts: Record<string, number> = {}
  statusCounts.forEach(s => { counts[s.status] = s._count.status })

  return NextResponse.json({
    leads,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    counts,
  })
}

// POST /api/admin/leads — Create new lead
export async function POST(request: Request) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const body = await request.json()
  const { name, email, phone, company, source, type, status, priority, stage,
    subject, message, notes, projectType, budget, address, city, postalCode,
    assignedToId, metadata } = body

  const lead = await prisma.lead.create({
    data: {
      name: name || "", email: email || "",
      phone: phone || null,
      company: company || null,
      source: source || "website",
      type: type || "contact",
      status: status || "new",
      priority: priority || "medium",
      stage: stage || "lead_received",
      subject: subject || null,
      message: message || null,
      notes: notes || null,
      projectType: projectType || null,
      budget: budget || null,
      address: address || null,
      city: city || null,
      postalCode: postalCode || null,
      assignedToId: assignedToId || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
    include: { assignedTo: { select: { id: true, name: true } } },
  })

  return NextResponse.json(lead, { status: 201 })
}

// PATCH /api/admin/leads — Update lead
export async function PATCH(request: Request) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const body = await request.json()
  const { id, ...data } = body
  if (!id) return NextResponse.json({ error: "Lead ID required" }, { status: 400 })

  // Handle conversion
  if (data.status === "converted" && !data.convertedAt) {
    data.convertedAt = new Date()
  }

  const lead = await prisma.lead.update({
    where: { id },
    data,
    include: { assignedTo: { select: { id: true, name: true } } },
  })

  return NextResponse.json(lead)
}

// DELETE /api/admin/leads — Delete lead(s) — supports bulk
export async function DELETE(request: Request) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const body = await request.json()
  const { ids } = body // array of IDs

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "Lead IDs required" }, { status: 400 })
  }

  await prisma.lead.deleteMany({ where: { id: { in: ids } } })

  return NextResponse.json({ deleted: ids.length })
}
