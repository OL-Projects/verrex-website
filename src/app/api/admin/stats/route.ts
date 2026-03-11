import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin, forbidden, unauthorized } from "@/lib/rbac"

export async function GET() {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const [
    totalClients,
    totalProjects,
    activeProjects,
    totalLeads,
    newLeads,
    totalAppointments,
    upcomingAppointments,
    totalInvoices,
    paidInvoices,
    revenue,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "client" } }),
    prisma.project.count(),
    prisma.project.count({ where: { status: "in_progress" } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "new" } }),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { date: { gte: new Date() }, status: { in: ["scheduled", "confirmed"] } } }),
    prisma.invoice.count(),
    prisma.invoice.count({ where: { status: "paid" } }),
    prisma.invoice.aggregate({ _sum: { total: true }, where: { status: "paid" } }),
  ])

  return NextResponse.json({
    totalClients,
    totalProjects,
    activeProjects,
    totalLeads,
    newLeads,
    totalAppointments,
    upcomingAppointments,
    totalInvoices,
    paidInvoices,
    totalRevenue: revenue._sum.total || 0,
  })
}
