import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, unauthorized } from "@/lib/rbac"

// GET /api/portal/profile — Get current user profile (including image)
export async function GET() {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, company: true, phone: true, image: true },
  })

  return NextResponse.json(user)
}

// PATCH /api/portal/profile — Update profile (including image)
export async function PATCH(req: Request) {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const body = await req.json()
  const { name, phone, company, image } = body as {
    name?: string
    phone?: string
    company?: string
    image?: string | null
  }

  const data: Record<string, unknown> = {}
  if (name !== undefined) data.name = name
  if (phone !== undefined) data.phone = phone
  if (company !== undefined) data.company = company
  if (image !== undefined) data.image = image

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: { id: true, name: true, email: true, role: true, company: true, phone: true, image: true },
  })

  return NextResponse.json(user)
}
