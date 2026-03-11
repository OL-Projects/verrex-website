import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, unauthorized } from "@/lib/rbac"

export async function GET() {
  const session = await requireAuth()
  if (!session) return unauthorized()

  const appointments = await prisma.appointment.findMany({
    where: { clientId: session.user.id },
    include: {
      project: { select: { id: true, title: true } },
    },
    orderBy: { date: "desc" },
  })

  return NextResponse.json(appointments)
}
