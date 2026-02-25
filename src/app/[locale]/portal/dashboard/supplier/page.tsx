"use client"

import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { StatsCard } from "@/components/portal/stats-card"
import { getOrdersByRole } from "@/lib/portal-data"
import {
  Package,
  Truck,
  Clock,
  CheckCircle2,
  ArrowRight,
  Factory,
} from "lucide-react"

const statusColors: Record<string, string> = {
  quoted: "bg-slate-100 dark:bg-slate-500/15 text-slate-700 dark:text-slate-400",
  approved: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400",
  ordered: "bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400",
  confirmed: "bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400",
  production: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400",
  shipped: "bg-cyan-100 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-400",
  delivered: "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400",
}

export default function SupplierDashboard() {
  const { data: session } = useSession()
  const userId = session?.user?.id || ""
  const orders = getOrdersByRole(userId, "supplier")
  const activeOrders = orders.filter(o => o.status !== "delivered")
  const totalItems = orders.reduce((sum, o) => sum + o.items.length, 0)
  const totalValue = orders.reduce((sum, o) => sum + o.totalAmount, 0)

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Supplier Portal 📦
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage purchase orders, production status, and deliveries.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Active Orders" value={activeOrders.length} icon={Package} color="blue" delay={0.05} />
        <StatsCard title="Total Items" value={totalItems} icon={Factory} color="purple" delay={0.1} />
        <StatsCard title="Total Value" value={`$${(totalValue / 1000).toFixed(1)}K`} icon={Truck} color="green" delay={0.15} />
        <StatsCard title="In Production" value={orders.filter(o => o.status === "production").length} icon={Clock} color="amber" delay={0.2} />
      </div>

      {/* Orders Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Purchase Orders</h3>
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="p-4 rounded-xl bg-slate-50/50 dark:bg-white/3 border border-slate-100 dark:border-white/5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Order #{order.id.replace("ord_", "ORD-")}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Project: {order.projectId} • Created: {order.createdAt}</p>
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium uppercase ${statusColors[order.status] || statusColors.quoted}`}>
                  {order.status}
                </span>
              </div>

              {/* Order Items */}
              <div className="space-y-2 mb-3">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/50 dark:bg-white/3 border border-slate-100 dark:border-white/5 text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{item.productDescription}</p>
                      <p className="text-[10px] text-slate-400">{item.width}&quot;×{item.height}&quot; • {item.color} • {item.glassType} • Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 ml-3">${(item.unitPrice * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  {order.estimatedDelivery && (
                    <span className="flex items-center gap-1"><Truck className="h-3 w-3" />ETA: {order.estimatedDelivery}</span>
                  )}
                  {order.trackingNumber && (
                    <span>Tracking: {order.trackingNumber}</span>
                  )}
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">${order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
