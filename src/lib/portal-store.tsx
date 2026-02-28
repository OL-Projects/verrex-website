"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type {
  Lead, Project, Appointment, Order, Invoice, Message, ChatThread,
  MeasurementEntry, TimelineEvent, Commission, Notification,
  PipelineStage, OrderStatus, LeadSource, LeadPriority, AppointmentType,
  TimelineEventType, TimelineVisibility, UserRole,
  Contract,
} from "@/types/portal"
import {
  mockLeads, mockProjects, mockAppointments, mockOrders,
  mockInvoices, mockMessages, mockChatThreads, mockMeasurements,
  mockTimelineEvents, mockCommissions, mockContracts, mockNotifications, mockUsers,
} from "@/lib/portal-data"

// ── Utility ────────────────────────────────────────
let _counter = Date.now()
function uid(prefix: string) { return `${prefix}_${(++_counter).toString(36)}` }
function now() { return new Date().toISOString() }
function today() { return new Date().toISOString().slice(0, 10) }

// ── Store Shape ────────────────────────────────────
interface PortalStore {
  // Data
  leads: Lead[]
  projects: Project[]
  appointments: Appointment[]
  orders: Order[]
  invoices: Invoice[]
  messages: Message[]
  threads: ChatThread[]
  measurements: MeasurementEntry[]
  timeline: TimelineEvent[]
  commissions: Commission[]
  contracts: Contract[]
  createContract: (data: Omit<Contract, "id" | "createdAt">) => Contract
  updateContract: (id: string, data: Partial<Contract>) => void
  notifications: Notification[]

  // Lead CRUD
  createLead: (data: Omit<Lead, "id" | "createdAt" | "updatedAt" | "stage">) => Lead
  updateLead: (id: string, data: Partial<Lead>) => void
  changeLeadStage: (id: string, newStage: PipelineStage, actor: string) => void
  convertLeadToProject: (leadId: string, actor: string) => Project

  // Project CRUD
  updateProject: (id: string, data: Partial<Project>) => void
  changeProjectStage: (id: string, newStage: PipelineStage, actor: string) => void
  assignToProject: (projectId: string, field: "assignedContractor" | "assignedInspector" | "assignedSupplier", userId: string, actor: string) => void

  // Appointment CRUD
  createAppointment: (data: Omit<Appointment, "id">) => Appointment
  updateAppointment: (id: string, data: Partial<Appointment>) => void
  cancelAppointment: (id: string, actor: string) => void
  completeAppointment: (id: string, actor: string) => void

  // Order CRUD
  updateOrderStatus: (id: string, status: OrderStatus, actor: string) => void

  // Messages
  sendMessage: (data: { projectId: string; threadId: string; senderId: string; senderName: string; senderRole: UserRole | string; content: string; isInternal?: boolean }) => Message

  // Invoices
  createInvoice: (data: Omit<Invoice, "id" | "createdAt">) => Invoice
  markInvoicePaid: (id: string, amount: number, actor: string) => void
  sendInvoice: (id: string) => void
  voidInvoice: (id: string) => void
  updateInvoice: (id: string, data: Partial<Invoice>) => void

  // Measurements
  addMeasurement: (data: Omit<MeasurementEntry, "id">) => MeasurementEntry

  // Timeline
  addTimelineEvent: (data: Omit<TimelineEvent, "id">) => TimelineEvent

  // Notifications
  markNotificationRead: (id: string) => void
  addNotification: (data: Omit<Notification, "id" | "createdAt" | "read">) => void
}

const PortalStoreContext = createContext<PortalStore | null>(null)

export function usePortalStore(): PortalStore {
  const ctx = useContext(PortalStoreContext)
  if (!ctx) throw new Error("usePortalStore must be used within PortalStoreProvider")
  return ctx
}

export function PortalStoreProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(() => [...mockLeads])
  const [projects, setProjects] = useState<Project[]>(() => [...mockProjects])
  const [appointments, setAppointments] = useState<Appointment[]>(() => [...mockAppointments])
  const [orders, setOrders] = useState<Order[]>(() => [...mockOrders])
  const [invoices, setInvoices] = useState<Invoice[]>(() => [...mockInvoices])
  const [messages, setMessages] = useState<Message[]>(() => [...mockMessages])
  const [threads, setThreads] = useState<ChatThread[]>(() => [...mockChatThreads])
  const [measurements, setMeasurements] = useState<MeasurementEntry[]>(() => [...mockMeasurements])
  const [timeline, setTimeline] = useState<TimelineEvent[]>(() => [...mockTimelineEvents])
  const [commissions] = useState<Commission[]>(() => [...mockCommissions])
  const [contracts, setContracts] = useState<Contract[]>(() => [...mockContracts])
  const createContract = useCallback((data: Omit<Contract, "id" | "createdAt">) => {
    const c: Contract = { ...data, id: uid("cont"), createdAt: today() }
    setContracts(prev => [c, ...prev])
    return c
  }, [])
  const updateContract = useCallback((id: string, data: Partial<Contract>) => {
    setContracts(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
  }, [])
  const [notifications, setNotifications] = useState<Notification[]>(() => [...mockNotifications])

  // ── Helpers ──
  const pushTimeline = useCallback((evt: Omit<TimelineEvent, "id">) => {
    const full: TimelineEvent = { ...evt, id: uid("evt") }
    setTimeline(prev => [full, ...prev])
    return full
  }, [])

  const pushNotification = useCallback((data: Omit<Notification, "id" | "createdAt" | "read">) => {
    setNotifications(prev => [{ ...data, id: uid("notif"), createdAt: now(), read: false }, ...prev])
  }, [])

  // ── Lead CRUD ──
  const createLead = useCallback((data: Omit<Lead, "id" | "createdAt" | "updatedAt" | "stage">) => {
    const lead: Lead = { ...data, id: uid("lead"), stage: "lead_received" as PipelineStage, createdAt: today(), updatedAt: today() }
    setLeads(prev => [lead, ...prev])
    pushTimeline({ projectId: "", timestamp: now(), actorId: "usr_admin_001", actorName: "Sarah Mitchell", actorRole: "admin" as const, eventType: "lead_created", title: `Lead created: ${lead.clientName}`, notes: `Source: ${lead.source}. ${lead.notes || ""}`, visibility: "all" as TimelineVisibility })
    return lead
  }, [pushTimeline])

  const updateLead = useCallback((id: string, data: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...data, updatedAt: today() } : l))
  }, [])

  const changeLeadStage = useCallback((id: string, newStage: PipelineStage, actor: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id !== id) return l
      pushTimeline({ projectId: "", timestamp: now(), actorId: actor, actorName: mockUsers.find(u => u.id === actor)?.name || actor, actorRole: "admin" as const, eventType: "stage_changed", title: `Lead stage → ${newStage.replace(/_/g, " ")}`, previousStage: l.stage, newStage, visibility: "internal" as TimelineVisibility })
      return { ...l, stage: newStage, updatedAt: today() }
    }))
  }, [pushTimeline])

  const convertLeadToProject = useCallback((leadId: string, actor: string) => {
    const lead = leads.find(l => l.id === leadId)
    if (!lead) throw new Error("Lead not found")
    const proj: Project = {
      id: uid("proj"), leadId, clientId: uid("client"), clientName: lead.clientName,
      address: lead.address, city: lead.city, partnerId: lead.partnerId,
      stage: "appointment_scheduled" as PipelineStage, assignedContractor: "", assignedInspector: "",
      products: [], totalValue: 0, depositPaid: 0, balanceDue: 0, notes: lead.notes, createdAt: today(), updatedAt: today(),
    }
    setProjects(prev => [proj, ...prev])
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: "appointment_scheduled" as PipelineStage, updatedAt: today() } : l))
    pushTimeline({ projectId: proj.id, timestamp: now(), actorId: actor, actorName: mockUsers.find(u => u.id === actor)?.name || actor, actorRole: "admin" as const, eventType: "lead_created", title: `Lead converted to Project: ${proj.clientName}`, notes: `Project ${proj.id} created from lead ${leadId}`, visibility: "internal" as TimelineVisibility })
    return proj
  }, [leads, pushTimeline])

  // ── Project CRUD ──
  const updateProject = useCallback((id: string, data: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data, updatedAt: today() } : p))
  }, [])

  const changeProjectStage = useCallback((id: string, newStage: PipelineStage, actor: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== id) return p
      pushTimeline({ projectId: id, timestamp: now(), actorId: actor, actorName: mockUsers.find(u => u.id === actor)?.name || actor, actorRole: "admin", eventType: "stage_changed", title: `Stage → ${newStage.replace(/_/g, " ")}`, previousStage: p.stage, newStage, visibility: "all" as TimelineVisibility })
      return { ...p, stage: newStage, updatedAt: today() }
    }))
  }, [pushTimeline])

  const assignToProject = useCallback((projectId: string, field: "assignedContractor" | "assignedInspector" | "assignedSupplier", userId: string, actor: string) => {
    const userName = mockUsers.find(u => u.id === userId)?.name || userId
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, [field]: userId, updatedAt: today() } : p))
    pushTimeline({ projectId, timestamp: now(), actorId: actor, actorName: mockUsers.find(u => u.id === actor)?.name || actor, actorRole: "admin", eventType: "assignment_changed", title: `${field.replace("assigned", "")} assigned: ${userName}`, visibility: "admin_contractor" as TimelineVisibility })
  }, [pushTimeline])

  // ── Appointment CRUD ──
  const createAppointment = useCallback((data: Omit<Appointment, "id">) => {
    const apt: Appointment = { ...data, id: uid("apt") }
    setAppointments(prev => [apt, ...prev])
    pushTimeline({ projectId: data.projectId, timestamp: now(), actorId: data.assignedTo, actorName: data.assignedName, actorRole: "admin", eventType: "appointment_scheduled", title: `${data.type} scheduled: ${data.date} at ${data.time}`, notes: data.notes, visibility: "all" as TimelineVisibility })
    return apt
  }, [pushTimeline])

  const updateAppointment = useCallback((id: string, data: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...data } : a))
  }, [])

  const cancelAppointment = useCallback((id: string, actor: string) => {
    setAppointments(prev => prev.map(a => {
      if (a.id !== id) return a
      pushTimeline({ projectId: a.projectId, timestamp: now(), actorId: actor, actorName: mockUsers.find(u => u.id === actor)?.name || actor, actorRole: "admin", eventType: "appointment_rescheduled", title: `Appointment cancelled: ${a.type}`, visibility: "all" as TimelineVisibility })
      return { ...a, status: "cancelled" as const }
    }))
  }, [pushTimeline])

  const completeAppointment = useCallback((id: string, actor: string) => {
    setAppointments(prev => prev.map(a => {
      if (a.id !== id) return a
      pushTimeline({ projectId: a.projectId, timestamp: now(), actorId: actor, actorName: mockUsers.find(u => u.id === actor)?.name || actor, actorRole: "admin", eventType: "appointment_completed", title: `${a.type} completed`, visibility: "all" as TimelineVisibility })
      return { ...a, status: "completed" as const }
    }))
  }, [pushTimeline])

  // ── Orders ──
  const updateOrderStatus = useCallback((id: string, status: OrderStatus, actor: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o
      const evtType: TimelineEventType = status === "production" ? "production_started" : status === "shipped" ? "shipped" : status === "delivered" ? "delivered" : "supplier_confirmed"
      pushTimeline({ projectId: o.projectId, timestamp: now(), actorId: actor, actorName: mockUsers.find(u => u.id === actor)?.name || actor, actorRole: "admin", eventType: evtType, title: `Order ${o.id} → ${status}`, visibility: "all" as TimelineVisibility })
      return { ...o, status }
    }))
  }, [pushTimeline])

  // ── Messages ──
  const sendMessage = useCallback((data: { projectId: string; threadId: string; senderId: string; senderName: string; senderRole: string; content: string; isInternal?: boolean }) => {
    const msg: Message = { id: uid("msg"), projectId: data.projectId, threadId: data.threadId, senderId: data.senderId, senderName: data.senderName, senderRole: data.senderRole as UserRole, content: data.content, attachments: [], isInternal: data.isInternal || false, createdAt: now() }
    setMessages(prev => [...prev, msg])
    setThreads(prev => prev.map(t => t.id === data.threadId ? { ...t, lastMessage: data.content, updatedAt: now() } : t))
    return msg
  }, [])

  // ── Invoices ──
  const createInvoice = useCallback((data: Omit<Invoice, "id" | "createdAt">) => {
    const inv: Invoice = { ...data, id: uid("inv"), createdAt: today() }
    setInvoices(prev => [inv, ...prev])
    pushTimeline({ projectId: data.projectId, timestamp: now(), actorId: "usr_admin_001", actorName: "Sarah Mitchell", actorRole: "admin", eventType: "invoice_issued", title: `Invoice created: $${data.total.toLocaleString()}`, visibility: "all" as TimelineVisibility })
    return inv
  }, [pushTimeline])

  const sendInvoice = useCallback((id: string) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'sent' as const, sentDate: new Date().toISOString().split('T')[0] } : inv))
  }, [])

  const voidInvoice = useCallback((id: string) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'void' as const } : inv))
  }, [])

  const updateInvoice = useCallback((id: string, data: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...data } : inv))
  }, [])

  const markInvoicePaid = useCallback((id: string, amount: number, actor: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== id) return inv
      const newPaid = inv.depositPaid + amount
      pushTimeline({ projectId: inv.projectId, timestamp: now(), actorId: actor, actorName: mockUsers.find(u => u.id === actor)?.name || actor, actorRole: "admin", eventType: "payment_received", title: `Payment received: $${amount.toLocaleString()}`, visibility: "all" as TimelineVisibility })
      return { ...inv, depositPaid: newPaid, balanceDue: inv.total - newPaid, status: newPaid >= inv.total ? "paid" as const : inv.status, paidDate: newPaid >= inv.total ? today() : inv.paidDate }
    }))
  }, [pushTimeline])

  // ── Measurements ──
  const addMeasurement = useCallback((data: Omit<MeasurementEntry, "id">) => {
    const m: MeasurementEntry = { ...data, id: uid("meas") }
    setMeasurements(prev => [m, ...prev])
    pushTimeline({ projectId: data.projectId, timestamp: now(), actorId: data.measuredBy, actorName: mockUsers.find(u => u.id === data.measuredBy)?.name || data.measuredBy, actorRole: "contractor", eventType: "measurement_completed", title: `Measurement: ${data.location}`, notes: `${data.widthExact}"×${data.heightExact}" — ${data.windowType}`, visibility: "all" as TimelineVisibility })
    return m
  }, [pushTimeline])

  // ── Timeline direct add ──
  const addTimelineEvent = useCallback((data: Omit<TimelineEvent, "id">) => {
    return pushTimeline(data)
  }, [pushTimeline])

  // ── Notifications ──
  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const addNotification = useCallback((data: Omit<Notification, "id" | "createdAt" | "read">) => {
    pushNotification(data)
  }, [pushNotification])

  const store: PortalStore = {
    leads, projects, appointments, orders, invoices, messages, threads,
    measurements, timeline, commissions, notifications,
    createLead, updateLead, changeLeadStage, convertLeadToProject,
    updateProject, changeProjectStage, assignToProject,
    createAppointment, updateAppointment, cancelAppointment, completeAppointment,
    updateOrderStatus, sendMessage, createInvoice, markInvoicePaid, sendInvoice, voidInvoice, updateInvoice,
    contracts, createContract, updateContract,
    addMeasurement, addTimelineEvent, markNotificationRead, addNotification,
  }

  return <PortalStoreContext.Provider value={store}>{children}</PortalStoreContext.Provider>
}
