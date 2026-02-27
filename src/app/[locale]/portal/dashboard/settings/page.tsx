"use client"

import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { User, Shield, Bell } from "lucide-react"

export default function SettingsPage() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account preferences</p>
      </motion.div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><User className="h-5 w-5 text-blue-500" /> Profile</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
              {session?.user?.name?.charAt(0) || "?"}
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{session?.user?.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{session?.user?.role} Account</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Name</label>
              <input type="text" defaultValue={session?.user?.name || ""} disabled
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm disabled:opacity-60" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <input type="email" defaultValue={session?.user?.email || ""} disabled
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm disabled:opacity-60" />
            </div>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 italic">Profile editing will be available in Phase 2.</p>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Bell className="h-5 w-5 text-amber-500" /> Notifications</h3>
        <div className="space-y-3">
          {["Email notifications", "Portal notifications", "Appointment reminders", "Order status updates"].map(item => (
            <div key={item} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-white/3">
              <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
              <div className="h-6 w-10 rounded-full bg-blue-500 flex items-center justify-end px-0.5">
                <div className="h-5 w-5 rounded-full bg-white shadow-sm" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Security */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Shield className="h-5 w-5 text-green-500" /> Security</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-white/3">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</p>
              <p className="text-xs text-slate-400">Last changed: Never (demo mode)</p>
            </div>
            <button className="text-xs text-blue-600 dark:text-blue-400 font-medium">Change</button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-white/3">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Two-Factor Auth</p>
              <p className="text-xs text-slate-400">Not configured</p>
            </div>
            <span className="text-xs text-slate-400 italic">Coming in Phase 2</span>
          </div>
        </div>
      </motion.div>

      {/* Info banner */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <span className="font-bold">💡 Tip:</span> Company info, color presets, and estimate customization are now managed directly in the <span className="font-bold">Estimate Creator</span> via the Settings (⚙) button in the bottom toolbar.
        </p>
      </motion.div>
    </div>
  )
}
