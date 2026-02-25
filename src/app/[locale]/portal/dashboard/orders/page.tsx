"use client"

import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { getOrdersByRole } from "@/lib/portal-data"
import { Package, Truck, Factory, Clock } from "lucide-react"
import { StatsCard } from "@/components/portal/stats-card"

const statusColors: Record<string, string> = {
  quoted: "bg-slate-100 dark:bg-slate-500/15 text-slate-700 dark:text-slate-400",
  approved: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400",
  ordered: "bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400",
  confirmed: "bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400",
  production: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400",
  shipped: "bg-cyan-100 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-400",
  delivered: "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400",
}

export default function OrdersPage() {
  const { data: session } = useSession()
  const userId = session?.user?.id || ""
  const role = session?.user?.role || "admin"
  const orders = getOrdersByRole(userId, role)

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Orders</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{orders.length} orders</p>
      </motion.div>

      {orders.map((order, idx) => (
        <motion.div key={order.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
          className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Order #{order.id.replace("ord_", "ORD-")}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{order.supplierName} • Created {order.createdAt}</p>
            </div>
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium uppercase ${statusColors[order.status]}`}>{order.status}</span>
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
