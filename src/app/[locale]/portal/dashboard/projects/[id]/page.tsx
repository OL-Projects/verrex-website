"use client"

import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect } from "react"
import { PipelineStatus } from "@/components/portal/pipeline-status"
import { ProjectTimeline } from "@/components/portal/project-timeline"
import { usePortalStore } from "@/lib/portal-store"
import { mockUsers } from "@/lib/portal-data"
import { PIPELINE_STAGES } from "@/types/portal"
import type { PipelineStage, TimelineVisibility } from "@/types/portal"
import { Link as IntlLink } from "@/i18n/navigation"
import {
  ArrowLeft, MapPin, User, Wrench, DollarSign, Package,
  CalendarDays, Ruler, Receipt, MessageSquare, Clock,
  FileText, Truck, Send, Lock, ChevronRight, ChevronDown,
  Check, Plus, StickyNote,
} from "lucide-react"

const tabs = [
  { key: "overview", label: "Overview", icon: FileText },
  { key: "products", label: "Products", icon: Package },
  { key: "orders", label: "Orders", icon: Truck },
  { key: "timeline", label: "Timeline", icon: Clock },
  { key: "messages", label: "Messages", icon: MessageSquare },
  { key: "financials", label: "Financials", icon: DollarSign },
] as const

type TabKey = (typeof tabs)[number]["key"]

export default function ProjectDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const store = usePortalStore()
  const projectId = params.id as string
  const role = session?.user?.role || "admin"
  const userId = session?.user?.id || "usr_admin_001"
  const userName = session?.user?.name || "Sarah Mitchell"
  const [activeTab, setActiveTab] = useState<TabKey>("overview")
  const [stageOpen, setStageOpen] = useState(false)

  const project = store.projects.find(p => p.id === projectId)
  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Package className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-lg font-semibold text-slate-900 dark:text-white">Project not found</p>
          <IntlLink href="/portal/dashboard/projects" className="text-sm text-blue-600 dark:text-blue-400 mt-2 inline-block hover:underline">
            ← Back to Projects
          </IntlLink>
        </div>
      </div>
    )
  }

  const timeline = store.timeline.filter(e => e.projectId === projectId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  const orders = store.orders.filter(o => o.projectId === projectId)
  const appointments = store.appointments.filter(a => a.projectId === projectId)
  const measurements = store.measurements.filter(m => m.projectId === projectId)
  const invoices = store.invoices.filter(i => i.projectId === projectId)
  const messages = store.messages.filter(m => m.projectId === projectId).filter(m => role === "admin" || role === "contractor" || !m.isInternal)
  const contractor = mockUsers.find(u => u.id === project.assignedContractor)
  const inspector = mockUsers.find(u => u.id === project.assignedInspector)
  const stageInfo = PIPELINE_STAGES.find(s => s.key === project.stage)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <IntlLink href="/portal/dashboard/projects" className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Projects
        </IntlLink>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{project.clientName}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3.5 w-3.5" />{project.address}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium text-white ${stageInfo?.color || "bg-slate-500"}`}>
              {stageInfo?.label || project.stage}
            </span>
            <span className="text-xs text-slate-400">#{project.id.replace("proj_", "PRJ-")}</span>
          </div>
        </div>
      </motion.div>

      {/* Pipeline */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
        <PipelineStatus currentStage={project.stage} />
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-white/10"
              }`}>
              <Icon className="h-4 w-4" />{tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {activeTab === "overview" && <OverviewTab project={project} contractor={contractor} inspector={inspector} appointments={appointments} measurements={measurements} />}
        {activeTab === "products" && <ProductsTab products={project.products} />}
        {activeTab === "orders" && <OrdersTab orders={orders} />}
        {activeTab === "timeline" && <TimelineTab timeline={timeline} userRole={role as import("@/types/portal").UserRole} />}
        {activeTab === "messages" && <MessagesTab messages={messages} userId={userId} />}
        {activeTab === "financials" && <FinancialsTab project={project} invoices={invoices} />}
      </motion.div>
    </div>
  )
}

/* ── TAB COMPONENTS ─────────────────────────────────────── */

function OverviewTab({ project, contractor, inspector, appointments, measurements }: {
  project: import("@/types/portal").Project; contractor?: { name: string; phone?: string };
  inspector?: { name: string; phone?: string }; appointments: import("@/types/portal").Appointment[];
  measurements: import("@/types/portal").MeasurementEntry[]
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Assignments */}
      <div className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Team Assignments</h3>
        <div className="space-y-3">
          {contractor && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-white/3">
              <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center">
                <Wrench className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div><p className="text-sm font-medium text-slate-900 dark:text-white">{contractor.name}</p><p className="text-xs text-slate-400">Contractor{contractor.phone ? ` • ${contractor.phone}` : ""}</p></div>
            </div>
          )}
          {inspector && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-white/3">
              <div className="h-9 w-9 rounded-lg bg-indigo-100 dark:bg-indigo-500/15 flex items-center justify-center">
                <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div><p className="text-sm font-medium text-slate-900 dark:text-white">{inspector.name}</p><p className="text-xs text-slate-400">Inspector</p></div>
            </div>
          )}
          {!contractor && !inspector && <p className="text-sm text-slate-400 italic">No team assigned yet.</p>}
        </div>
      </div>
      {/* Key Info */}
      <div className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Project Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-white/3"><p className="text-[10px] text-slate-400 uppercase">Products</p><p className="text-lg font-bold text-slate-900 dark:text-white">{project!.products.length}</p></div>
          <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-white/3"><p className="text-[10px] text-slate-400 uppercase">Appointments</p><p className="text-lg font-bold text-slate-900 dark:text-white">{appointments.length}</p></div>
          <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-white/3"><p className="text-[10px] text-slate-400 uppercase">Measurements</p><p className="text-lg font-bold text-slate-900 dark:text-white">{measurements.length}</p></div>
          <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-white/3"><p className="text-[10px] text-slate-400 uppercase">Created</p><p className="text-sm font-bold text-slate-900 dark:text-white">{project!.createdAt}</p></div>
        </div>
        {project!.notes && <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 italic">{project!.notes}</p>}
      </div>
    </div>
  )
}

function ProductsTab({ products }: { products: import("@/types/portal").ProjectProduct[] }) {
  return (
    <div className="space-y-3">
      {products.map(p => (
        <div key={p.id} className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{p.location} — <span className="capitalize">{p.windowType.replace(/_/g, " ")}</span></h4>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">${(p.unitPrice * p.quantity).toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div><span className="text-slate-400">Size:</span> <span className="font-medium text-slate-700 dark:text-slate-300">{p.width}&quot;×{p.height}&quot;</span></div>
            <div><span className="text-slate-400">Color:</span> <span className="font-medium text-slate-700 dark:text-slate-300">{p.color}</span></div>
            <div><span className="text-slate-400">Glass:</span> <span className="font-medium text-slate-700 dark:text-slate-300">{p.glassType}</span></div>
            <div><span className="text-slate-400">Qty:</span> <span className="font-medium text-slate-700 dark:text-slate-300">×{p.quantity}</span></div>
            <div><span className="text-slate-400">Grid:</span> <span className="font-medium text-slate-700 dark:text-slate-300">{p.gridStyle}</span></div>
            <div><span className="text-slate-400">Hardware:</span> <span className="font-medium text-slate-700 dark:text-slate-300">{p.hardware}</span></div>
            {p.openingDirection && <div><span className="text-slate-400">Opens:</span> <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">{p.openingDirection}</span></div>}
          </div>
          {p.notes && <p className="text-xs text-slate-400 mt-2 italic">{p.notes}</p>}
        </div>
      ))}
    </div>
  )
}

function OrdersTab({ orders }: { orders: import("@/types/portal").Order[] }) {
  if (orders.length === 0) return <div className="py-12 text-center"><Package className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" /><p className="text-sm text-slate-500">No orders placed yet.</p></div>
  return (
    <div className="space-y-4">
      {orders.map(o => (
        <div key={o.id} className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div><h4 className="text-sm font-bold text-slate-900 dark:text-white">#{o.id.replace("ord_", "ORD-")}</h4><p className="text-xs text-slate-400">{o.supplierName}</p></div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 font-medium uppercase">{o.status}</span>
          </div>
          <div className="space-y-1.5">{o.items.map(item => (
            <div key={item.id} className="flex justify-between p-2 rounded-lg bg-slate-50/50 dark:bg-white/3 text-xs">
              <span className="text-slate-700 dark:text-slate-300">{item.productDescription} ×{item.quantity}</span>
              <span className="font-bold text-slate-900 dark:text-white">${(item.unitPrice * item.quantity).toLocaleString()}</span>
            </div>
          ))}</div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-white/5 text-xs">
            <div className="flex gap-4 text-slate-400">{o.estimatedDelivery && <span className="flex items-center gap-1"><Truck className="h-3 w-3" />ETA: {o.estimatedDelivery}</span>}{o.trackingNumber && <span>Tracking: {o.trackingNumber}</span>}</div>
            <span className="text-base font-bold text-slate-900 dark:text-white">${o.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function TimelineTab({ timeline, userRole }: { timeline: import("@/types/portal").TimelineEvent[]; userRole: import("@/types/portal").UserRole }) {
  return <ProjectTimeline events={timeline} userRole={userRole} />
}

function MessagesTab({ messages, userId }: { messages: import("@/types/portal").Message[]; userId: string }) {
  const store = usePortalStore()
  const [newMsg, setNewMsg] = useState("")
  const chatEnd = useRef<HTMLDivElement>(null)
  const projectId = messages[0]?.projectId || ""
  const threadId = messages[0]?.threadId || ""

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }) }, [messages.length])

  const handleSend = () => {
    if (!newMsg.trim()) return
    store.sendMessage({ projectId, threadId: threadId || `thread_${projectId}`, senderId: userId, senderName: "Sarah Mitchell", senderRole: "admin", content: newMsg.trim() })
    setNewMsg("")
  }

  return (
    <div className="flex flex-col rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 overflow-hidden" style={{ minHeight: 400 }}>
      <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[400px]">
        {messages.length === 0 && <div className="py-12 text-center"><MessageSquare className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" /><p className="text-sm text-slate-500">No messages yet. Start the conversation!</p></div>}
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.senderId === userId ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] p-3 rounded-2xl ${msg.isInternal ? "bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20" : msg.senderId === userId ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-white/10"}`}>
              {msg.isInternal && <div className="flex items-center gap-1 mb-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium"><Lock className="h-2.5 w-2.5" /> Internal</div>}
              <p className="text-xs font-medium mb-0.5 opacity-70">{msg.senderName} ({msg.senderRole})</p>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p className="text-[10px] opacity-50 mt-1">{new Date(msg.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
        <div ref={chatEnd} />
      </div>
      <div className="p-3 border-t border-slate-200 dark:border-white/10 flex items-center gap-2">
        <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder="Type a message..." className="flex-1 px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
        <button onClick={handleSend} disabled={!newMsg.trim()} className="h-9 w-9 rounded-lg flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function FinancialsTab({ project, invoices }: { project: import("@/types/portal").Project; invoices: import("@/types/portal").Invoice[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10">
          <p className="text-xs text-slate-400 uppercase mb-1">Total Value</p><p className="text-2xl font-bold text-slate-900 dark:text-white">${project.totalValue.toLocaleString()}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10">
          <p className="text-xs text-slate-400 uppercase mb-1">Deposit Paid</p><p className="text-2xl font-bold text-green-600 dark:text-green-400">${project.depositPaid.toLocaleString()}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10">
          <p className="text-xs text-slate-400 uppercase mb-1">Balance Due</p><p className="text-2xl font-bold text-amber-600 dark:text-amber-400">${project.balanceDue.toLocaleString()}</p>
        </div>
      </div>
      {invoices.map(inv => (
        <div key={inv.id} className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Invoice #{inv.id.replace("inv_", "INV-")}</h4>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 font-medium uppercase">{inv.status}</span>
          </div>
          <div className="space-y-1">{inv.items.map((item, i) => (
            <div key={i} className="flex justify-between text-xs py-1.5"><span className="text-slate-600 dark:text-slate-400">{item.description}</span><span className="font-semibold text-slate-900 dark:text-white">${item.total.toLocaleString()}</span></div>
          ))}</div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 space-y-1 text-xs">
            <div className="flex justify-between"><span className="text-slate-400">Subtotal</span><span>${inv.subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Tax</span><span>${inv.tax.toLocaleString()}</span></div>
            <div className="flex justify-between font-bold text-sm"><span>Total</span><span>${inv.total.toLocaleString()}</span></div>
            <div className="flex justify-between text-green-600 dark:text-green-400"><span>Deposit</span><span>-${inv.depositPaid.toLocaleString()}</span></div>
            <div className="flex justify-between font-bold text-base text-amber-600 dark:text-amber-400 pt-1 border-t border-slate-100 dark:border-white/5"><span>Balance Due</span><span>${inv.balanceDue.toLocaleString()}</span></div>
          </div>
        </div>
      ))}
      {invoices.length === 0 && <div className="py-8 text-center"><Receipt className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" /><p className="text-sm text-slate-400">No invoices generated yet.</p></div>}
    </div>
  )
}
