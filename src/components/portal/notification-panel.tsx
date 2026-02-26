"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, Info, AlertTriangle, CheckCircle2, Zap } from "lucide-react"
import { Link as IntlLink } from "@/i18n/navigation"
import type { Notification } from "@/types/portal"

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  info: Info, warning: AlertTriangle, success: CheckCircle2, action: Zap,
}
const typeColors: Record<string, string> = {
  info: "text-blue-500", warning: "text-amber-500", success: "text-green-500", action: "text-purple-500",
}

export function NotificationPanel({ notifications: initialNotifs }: { notifications: Notification[] }) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifs)
  const unread = notifications.filter(n => !n.read).length

  function markRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }
  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative h-9 w-9 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors">
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4.5 min-w-4.5 flex items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white px-1">
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl shadow-black/10 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button onClick={markAllRead} className="text-[10px] text-blue-600 dark:text-blue-400 font-medium hover:underline">
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="h-6 w-6 rounded flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10">
                    <X className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center"><Bell className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" /><p className="text-sm text-slate-400">No notifications</p></div>
                ) : (
                  notifications.map(notif => {
                    const Icon = typeIcons[notif.type] || Info
                    return (
                      <div key={notif.id} onClick={() => markRead(notif.id)}
                        className={`flex items-start gap-3 p-3.5 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${!notif.read ? "bg-blue-50/50 dark:bg-blue-500/5" : ""}`}>
                        <Icon className={`h-4.5 w-4.5 mt-0.5 shrink-0 ${typeColors[notif.type]}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium ${!notif.read ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>{notif.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                            {new Date(notif.createdAt).toLocaleDateString("en-CA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        {!notif.read && <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
