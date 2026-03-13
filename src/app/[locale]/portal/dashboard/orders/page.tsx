"use client"

import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { usePortalStore } from "@/lib/portal-store"
import { useState } from "react"
import type { OrderStatus } from "@/types/portal"
import { Package, Truck, Factory, Clock, ChevronDown, Check } from "lucide-react"

const statusColors: Record<string, string> = {
  quoted: "bg-slate-100 dark:bg-slate-500/15 text-slate-700 dark:text-slate-400",
  approved: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400",
  ordered: "bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400",
  confirmed: "bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400",
  production: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400",
  shipped: "bg-cyan-100 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-400",
  delivered: "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400",
}
const STATUS_FLOW: OrderStatus[] = ["quoted", "approved", "ordered", "confirmed", "production", "shipped", "delivered"]

export default function OrdersPage() {
  const { data: session } = useSession()
  const store = usePortalStore()
  const userId = session?.user?.id || ""
  const role = session?.user?.role || "admin"
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Orders</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{store.orders.length} orders</p>
      </motion.div>

      {store.orders.map((order, idx) => (
        <motion.div key={order.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
          className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Order #{order.id.replace("ord_", "ORD-")}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{order.supplierName} • Created {order.createdAt}</p>
            </div>
            {/* Status dropdown */}
            <div className="relative">
              <button onClick={() => setStatusDropdown(statusDropdown === order.id ? null : order.id)}
                className={`text-[10px] px-2.5 py-1 rounded-full font-medium uppercase inline-flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer ${statusColors[order.status]}`}>
                {order.status} {role === "admin" && <ChevronDown className="h-3 w-3" />}
              </button>
              {statusDropdown === order.id && role === "admin" && (
                <div className="absolute right-0 top-8 z-50 w-44 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 shadow-xl py-1">
                  {STATUS_FLOW.map(s => (
                    <button key={s} onClick={() => { store.updateOrderStatus(order.id, s, userId); setStatusDropdown(null) }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2 ${order.status === s ? "text-blue-600 dark:text-blue-400 font-semibold" : "text-slate-700 dark:text-slate-300"}`}>
                      {order.status === s && <Check className="h-3 w-3" />}
                      <span className={order.status === s ? "" : "pl-5"}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 dark:bg-white/3 border border-slate-100 dark:border-white/5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.productDescription}</p>
                  <p className="text-xs text-slate-400">{item.width}&quot;×{item.height}&quot; • {item.color} • {item.glassType} • Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white ml-4">${(item.unitPrice * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 dark:bg-white/3">
            <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              {order.estimatedDelivery && <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" />ETA: {order.estimatedDelivery}</span>}
              {order.trackingNumber && <span>Tracking: {order.trackingNumber}</span>}
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">${order.totalAmount.toLocaleString()}</span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
