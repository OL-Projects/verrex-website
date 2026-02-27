"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
import { motion } from "framer-motion"
import { User, Mail, Phone, Shield, Bell, Palette, Trash2, Plus, Building2, ImagePlus, X } from "lucide-react"
import { useColorPresets, useCompanyInfo, useLogo } from "@/lib/estimate-hooks"

export default function SettingsPage() {
  const { data: session } = useSession()
  const { info, update: updateCo } = useCompanyInfo()
  const { logo, uploadLogo, clearLogo } = useLogo()
  const colors = useColorPresets()
  const [newExtName, setNewExtName] = useState("")
  const [newExtHex, setNewExtHex] = useState("#000000")
  const [newIntName, setNewIntName] = useState("")
  const [newIntHex, setNewIntHex] = useState("#FFFFFF")

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

      {/* Company Info (Estimate Defaults) */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Building2 className="h-5 w-5 text-indigo-500" /> Company Info (Estimates)</h3>
        <p className="text-xs text-slate-400 mb-3">These defaults auto-populate when creating a new estimate.</p>
        <div className="flex items-center gap-3 mb-4">
          {logo ? (
            <div className="relative group">
              <img src={logo} alt="Logo" className="h-14 w-14 object-contain rounded-lg border border-slate-200 dark:border-white/10" />
              <button onClick={clearLogo} className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center"><X className="h-3 w-3" /></button>
            </div>
          ) : (
            <label className="h-14 w-14 rounded-lg border-2 border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 cursor-pointer transition">
              <ImagePlus className="h-5 w-5" />
              <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadLogo(e.target.files[0]) }} />
            </label>
          )}
          <div className="flex-1">
            <input value={info.name} onChange={e => updateCo({ name: e.target.value })} placeholder="Company Name"
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-bold outline-none mb-1" />
            <input value={info.tagline} onChange={e => updateCo({ tagline: e.target.value })} placeholder="Tagline"
              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(["address", "city", "phone", "email", "website"] as const).map(f => (
            <div key={f}><label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1 block">{f}</label>
              <input value={info[f]} onChange={e => updateCo({ [f]: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm outline-none" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Color Presets */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Palette className="h-5 w-5 text-pink-500" /> Estimate Color Presets</h3>
        <p className="text-xs text-slate-400 mb-4">Manage exterior and interior color options available in estimates.</p>

        {/* Exterior */}
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Exterior Colors</p>
        <div className="space-y-1.5 mb-3">
          {colors.ext.map(c => (
            <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50/50 dark:bg-white/3">
              <span className="h-5 w-5 rounded border border-slate-200 dark:border-white/10" style={{ backgroundColor: c.hex }} />
              <span className="text-sm flex-1">{c.name}</span>
              <span className="text-[10px] text-slate-400">{c.hex}</span>
              <button onClick={() => colors.removeExt(c.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mb-5">
          <input value={newExtHex} onChange={e => setNewExtHex(e.target.value)} type="color" className="h-8 w-8 rounded cursor-pointer" />
          <input value={newExtName} onChange={e => setNewExtName(e.target.value)} placeholder="Color name" className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm outline-none" />
          <button onClick={() => { if (newExtName) { colors.addExt(newExtName, newExtHex); setNewExtName(""); } }} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"><Plus className="h-3.5 w-3.5 inline" /> Add</button>
        </div>

        {/* Interior */}
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Interior Colors</p>
        <div className="space-y-1.5 mb-3">
          {colors.int.map(c => (
            <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50/50 dark:bg-white/3">
              <span className="h-5 w-5 rounded border border-slate-200 dark:border-white/10" style={{ backgroundColor: c.hex }} />
              <span className="text-sm flex-1">{c.name}</span>
              <span className="text-[10px] text-slate-400">{c.hex}</span>
              <button onClick={() => colors.removeInt(c.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input value={newIntHex} onChange={e => setNewIntHex(e.target.value)} type="color" className="h-8 w-8 rounded cursor-pointer" />
          <input value={newIntName} onChange={e => setNewIntName(e.target.value)} placeholder="Color name" className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm outline-none" />
          <button onClick={() => { if (newIntName) { colors.addInt(newIntName, newIntHex); setNewIntName(""); } }} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"><Plus className="h-3.5 w-3.5 inline" /> Add</button>
        </div>
      </motion.div>
    </div>
  )
}
