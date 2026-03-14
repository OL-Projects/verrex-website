import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin, unauthorized } from "@/lib/rbac"

export async function GET() {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    totalClients, totalProjects, activeProjects, pendingProjects, completedProjects,
    totalLeads, newLeads, contactedLeads, qualifiedLeads, convertedLeads,
    totalAppointments, upcomingAppointments,
    totalInvoices, paidInvoices, pendingInvoices, overdueInvoices,
    paidRevenue, pendingRevenue, overdueRevenue,
    totalDocuments, signedDocuments, viewedDocuments,
    totalMessages, recentClients, recentLeads,
    upcomingApptDetails, recentActivity,
    leadSources,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "client" } }),
    prisma.project.count(),
    prisma.project.count({ where: { status: "in_progress" } }),
    prisma.project.count({ where: { status: "pending" } }),
    prisma.project.count({ where: { status: "completed" } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "new" } }),
    prisma.lead.count({ where: { status: "contacted" } }),
    prisma.lead.count({ where: { status: "qualified" } }),
    prisma.lead.count({ where: { status: "converted" } }),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { date: { gte: now }, status: { in: ["scheduled", "confirmed"] } } }),
    prisma.invoice.count(),
    prisma.invoice.count({ where: { status: "paid" } }),
    prisma.invoice.count({ where: { status: { in: ["sent", "pending"] } } }),
    prisma.invoice.count({ where: { status: "overdue" } }),
    prisma.invoice.aggregate({ _sum: { total: true }, where: { status: "paid" } }),
    prisma.invoice.aggregate({ _sum: { total: true }, where: { status: { in: ["sent", "pending"] } } }),
    prisma.invoice.aggregate({ _sum: { total: true }, where: { status: "overdue" } }),
    prisma.document.count(),
    prisma.document.count({ where: { signedAt: { not: null } } }),
    prisma.document.count({ where: { status: { in: ["viewed", "signed", "approved"] } } }),
    prisma.message.count(),
    // Recent clients (last 5)
    prisma.user.findMany({
      where: { role: "client" }, orderBy: { createdAt: "desc" }, take: 5,
      select: { id: true, name: true, email: true, company: true, phone: true, createdAt: true, image: true,
        _count: { select: { projects: true, invoices: true, appointments: true } } },
    }),
    // Recent leads (last 5)
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" }, take: 5,
      select: { id: true, name: true, email: true, status: true, source: true, projectType: true, createdAt: true },
    }),
    // Upcoming appointments (next 5)
    prisma.appointment.findMany({
      where: { date: { gte: now }, status: { in: ["scheduled", "confirmed"] } },
      orderBy: { date: "asc" }, take: 5,
      select: { id: true, title: true, date: true, status: true, type: true,
        client: { select: { name: true } } },
    }),
    // Recent project activity (last 8)
    prisma.projectActivity.findMany({
      orderBy: { createdAt: "desc" }, take: 8,
      select: { id: true, type: true, content: true, createdAt: true,
        author: { select: { name: true } }, project: { select: { title: true } } },
    }),
    // Lead sources breakdown
    prisma.lead.groupBy({ by: ["source"], _count: { source: true }, orderBy: { _count: { source: "desc" } } }),
  ])

  return NextResponse.json({
    totalClients, totalProjects, activeProjects, pendingProjects, completedProjects,
    totalLeads, newLeads, contactedLeads, qualifiedLeads, convertedLeads,
    totalAppointments, upcomingAppointments,
    totalInvoices, paidInvoices, pendingInvoices, overdueInvoices,
    totalRevenue: (paidRevenue._sum.total || 0) + (pendingRevenue._sum.total || 0) + (overdueRevenue._sum.total || 0),
    paidRevenue: paidRevenue._sum.total || 0,
    pendingRevenue: pendingRevenue._sum.total || 0,
    overdueRevenue: overdueRevenue._sum.total || 0,
    totalDocuments, signedDocuments, viewedDocuments,
    totalMessages,
    recentClients, recentLeads, upcomingApptDetails, recentActivity,
    leadSources: leadSources.map(s => ({ source: s.source, count: s._count.source })),
  })
}
