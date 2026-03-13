"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import {
  User, Shield, Bell, Loader2, CheckCircle2, AlertCircle,
  Eye, EyeOff, Save, Building2, Phone, Mail, KeyRound,
  Camera, MapPin, Briefcase, FileText, Palette, Globe, Clock,
  Monitor, Moon, Sun, Zap, BellRing, BellOff, Volume2, VolumeX,
  LayoutGrid, Languages, CalendarClock, ToggleLeft, ToggleRight,
} from "lucide-react"
import { loadPreferences, savePreferences, NOTIFICATION_PRESETS, type UserPreferences, type NotificationPrefs } from "./user-preferences"

type ProfileData = { name: string; email: string; role: string; company: string; phone: string; createdAt: string; updatedAt: string }

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession()
  const userId = session?.user?.id || "unknown"
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Profile state
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", company: "" })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [profileDirty, setProfileDirty] = useState(false)

  // Password state
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Preferences (persistent per user)
  const [prefs, setPrefs] = useState<UserPreferences>(() => loadPreferences(userId))
  const [prefsSaved, setPrefsSaved] = useState(false)

  // Load preferences when userId changes
  useEffect(() => { if (userId !== "unknown") setPrefs(loadPreferences(userId)) }, [userId])

  // Auto-save preferences on change
  const updatePrefs = (updates: Partial<UserPreferences>) => {
    setPrefs(prev => {
      const next = { ...prev, ...updates }
      savePreferences(userId, next)
      setPrefsSaved(true)
      setTimeout(() => setPrefsSaved(false), 2000)
      return next
    })
  }
  const updateNotif = (updates: Partial<NotificationPrefs>) => {
    updatePrefs({ notifications: { ...prefs.notifications, ...updates } })
  }

  // Photo upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert("Photo must be under 2MB"); return }
    const reader = new FileReader()
    reader.onload = (ev) => { updatePrefs({ profilePhoto: ev.target?.result as string }) }
    reader.readAsDataURL(file)
  }

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/portal/profile")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setProfile(data.user)
      setProfileForm({ name: data.user.name || "", phone: data.user.phone || "", company: data.user.company || "" })
    } catch { setProfileMsg({ type: "error", text: "Failed to load profile" }) }
    finally { setProfileLoading(false) }
  }, [])
  useEffect(() => { fetchProfile() }, [fetchProfile])

  useEffect(() => {
    if (!profile) return
    setProfileDirty(profileForm.name !== (profile.name || "") || profileForm.phone !== (profile.phone || "") || profileForm.company !== (profile.company || ""))
  }, [profileForm, profile])

  useEffect(() => { if (profileMsg) { const t = setTimeout(() => setProfileMsg(null), 5000); return () => clearTimeout(t) } }, [profileMsg])
  useEffect(() => { if (passwordMsg) { const t = setTimeout(() => setPasswordMsg(null), 5000); return () => clearTimeout(t) } }, [passwordMsg])

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profileDirty) return
    setProfileSaving(true); setProfileMsg(null)
    try {
      const res = await fetch("/api/portal/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profileForm) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update")
      setProfile(data.user); setProfileMsg({ type: "success", text: "Profile updated!" }); setProfileDirty(false)
      if (data.user.name !== session?.user?.name) await updateSession({ name: data.user.name })
    } catch (err) { setProfileMsg({ type: "error", text: err instanceof Error ? err.message : "Failed" }) }
    finally { setProfileSaving(false) }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault(); setPasswordMsg(null)
    if (passwordForm.new.length < 8) { setPasswordMsg({ type: "error", text: "Min 8 characters" }); return }
    if (passwordForm.new !== passwordForm.confirm) { setPasswordMsg({ type: "error", text: "Passwords don't match" }); return }
    setPasswordSaving(true)
    try {
      const res = await fetch("/api/portal/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: passwordForm.current, newPassword: passwordForm.new }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      setPasswordMsg({ type: "success", text: "Password changed!" }); setPasswordForm({ current: "", new: "", confirm: "" }); setShowPasswordForm(false)
    } catch (err) { setPasswordMsg({ type: "error", text: err instanceof Error ? err.message : "Failed" }) }
    finally { setPasswordSaving(false) }
  }

  if (profileLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>

  const Toggle = ({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) => (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-white/3 hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
      <button onClick={onToggle} className={`h-6 w-11 rounded-full flex items-center px-0.5 transition-colors ${on ? "bg-blue-500 justify-end" : "bg-slate-300 dark:bg-slate-600 justify-start"}`}>
        <div className="h-5 w-5 rounded-full bg-white shadow-sm transition-transform" />
      </button>
    </div>
  )

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account, preferences & notifications</p>
          </div>
          {prefsSaved && <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium"><CheckCircle2 className="h-3.5 w-3.5" />Saved</motion.div>}
        </div>
      </motion.div>

      {/* ─── PROFILE ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2"><User className="h-5 w-5 text-blue-500" />Profile</h3>
        <div className="flex items-center gap-5 mb-6">
          {/* Photo Upload */}
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {prefs.profilePhoto ? (
              <img src={prefs.profilePhoto} alt="Profile" className="h-20 w-20 rounded-2xl object-cover shadow-lg ring-2 ring-white dark:ring-slate-800" />
            ) : (
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {profile?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{profile?.name}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 font-medium capitalize">{profile?.role}</span>
              <span className="text-xs text-slate-400">Since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en", { month: "long", year: "numeric" }) : "—"}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Click photo to upload (max 2MB)</p>
          </div>
          {prefs.profilePhoto && <button onClick={() => updatePrefs({ profilePhoto: "" })} className="text-xs text-red-500 hover:text-red-600 transition-colors">Remove</button>}
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5"><User className="inline h-3 w-3 mr-1 opacity-50" />Name</label>
              <input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5"><Mail className="inline h-3 w-3 mr-1 opacity-50" />Email</label>
              <input type="email" value={profile?.email || ""} disabled className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/10 text-slate-400 text-sm cursor-not-allowed" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5"><Phone className="inline h-3 w-3 mr-1 opacity-50" />Phone</label>
              <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="(514) 555-0000" className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5"><Building2 className="inline h-3 w-3 mr-1 opacity-50" />Company</label>
              <input type="text" value={profileForm.company} onChange={e => setProfileForm({ ...profileForm, company: e.target.value })} placeholder="Your company" className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5"><Briefcase className="inline h-3 w-3 mr-1 opacity-50" />Job Title</label>
              <input type="text" value={prefs.jobTitle} onChange={e => updatePrefs({ jobTitle: e.target.value })} placeholder="e.g. Project Manager" className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5"><MapPin className="inline h-3 w-3 mr-1 opacity-50" />City</label>
              <input type="text" value={prefs.city} onChange={e => updatePrefs({ city: e.target.value })} placeholder="Montreal" className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5"><MapPin className="inline h-3 w-3 mr-1 opacity-50" />Address</label>
              <input type="text" value={prefs.address} onChange={e => updatePrefs({ address: e.target.value })} placeholder="Street address" className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5"><Mail className="inline h-3 w-3 mr-1 opacity-50" />Postal Code</label>
              <input type="text" value={prefs.postalCode} onChange={e => updatePrefs({ postalCode: e.target.value })} placeholder="H1A 1A1" className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5"><FileText className="inline h-3 w-3 mr-1 opacity-50" />Bio</label>
            <textarea value={prefs.bio} onChange={e => updatePrefs({ bio: e.target.value })} rows={2} placeholder="A short description about yourself..." className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none" />
          </div>

          {profileMsg && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${profileMsg.type === "success" ? "bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400"}`}>
              {profileMsg.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}{profileMsg.text}
            </motion.div>
          )}
          <button type="submit" disabled={!profileDirty || profileSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
            {profileSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{profileSaving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </motion.div>

      {/* ─── APPEARANCE & PREFERENCES ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2"><Palette className="h-5 w-5 text-purple-500" />Appearance & Preferences</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2"><Monitor className="inline h-3 w-3 mr-1 opacity-50" />Theme</label>
            <div className="flex gap-2">
              {([["system", Monitor, "System"], ["light", Sun, "Light"], ["dark", Moon, "Dark"]] as const).map(([val, Icon, label]) => (
                <button key={val} onClick={() => updatePrefs({ appearance: { ...prefs.appearance, theme: val } })}
                  className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-xs font-medium ${prefs.appearance.theme === val ? "border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400" : "border-transparent bg-slate-50 dark:bg-slate-800/50 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                  <Icon className="h-4 w-4" />{label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2"><Languages className="inline h-3 w-3 mr-1 opacity-50" />Language</label>
            <div className="flex gap-2">
              {([["en", "🇬🇧 English"], ["fr", "🇫🇷 Français"]] as const).map(([val, label]) => (
                <button key={val} onClick={() => updatePrefs({ appearance: { ...prefs.appearance, language: val } })}
                  className={`flex-1 py-2.5 rounded-xl border-2 transition-all text-sm font-medium ${prefs.appearance.language === val ? "border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400" : "border-transparent bg-slate-50 dark:bg-slate-800/50 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2"><CalendarClock className="inline h-3 w-3 mr-1 opacity-50" />Date Format</label>
            <select value={prefs.appearance.dateFormat} onChange={e => updatePrefs({ appearance: { ...prefs.appearance, dateFormat: e.target.value as UserPreferences["appearance"]["dateFormat"] } })}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40">
              <option value="YYYY-MM-DD">YYYY-MM-DD</option><option value="MM/DD/YYYY">MM/DD/YYYY</option><option value="DD/MM/YYYY">DD/MM/YYYY</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2"><Clock className="inline h-3 w-3 mr-1 opacity-50" />Time Format</label>
            <div className="flex gap-2">
              {([["24h", "24-hour"], ["12h", "12-hour"]] as const).map(([val, label]) => (
                <button key={val} onClick={() => updatePrefs({ appearance: { ...prefs.appearance, timeFormat: val } })}
                  className={`flex-1 py-2.5 rounded-xl border-2 transition-all text-sm font-medium ${prefs.appearance.timeFormat === val ? "border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400" : "border-transparent bg-slate-50 dark:bg-slate-800/50 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Toggle on={prefs.appearance.compactMode} onToggle={() => updatePrefs({ appearance: { ...prefs.appearance, compactMode: !prefs.appearance.compactMode } })} label="Compact Mode — reduce spacing & padding" />
        </div>
      </motion.div>

      {/* ─── NOTIFICATIONS ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><Bell className="h-5 w-5 text-amber-500" />Notifications</h3>

        {/* Presets */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Quick presets</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          {Object.entries(NOTIFICATION_PRESETS).map(([key, preset]) => (
            <button key={key} onClick={() => updatePrefs({ notifications: { ...prefs.notifications, ...preset.overrides } })}
              className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/3 hover:border-amber-400 dark:hover:border-amber-500/40 hover:bg-amber-50 dark:hover:bg-amber-500/5 transition-all text-left">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{preset.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</p>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <Toggle on={prefs.notifications.emailEnabled} onToggle={() => updateNotif({ emailEnabled: !prefs.notifications.emailEnabled })} label="📧 Email notifications" />
          <Toggle on={prefs.notifications.portalEnabled} onToggle={() => updateNotif({ portalEnabled: !prefs.notifications.portalEnabled })} label="🔔 Portal notifications" />
          <Toggle on={prefs.notifications.appointmentReminders} onToggle={() => updateNotif({ appointmentReminders: !prefs.notifications.appointmentReminders })} label="📅 Appointment reminders" />
          <Toggle on={prefs.notifications.orderUpdates} onToggle={() => updateNotif({ orderUpdates: !prefs.notifications.orderUpdates })} label="📦 Order status updates" />
          <Toggle on={prefs.notifications.invoiceAlerts} onToggle={() => updateNotif({ invoiceAlerts: !prefs.notifications.invoiceAlerts })} label="💰 Invoice alerts" />
          <Toggle on={prefs.notifications.leadAlerts} onToggle={() => updateNotif({ leadAlerts: !prefs.notifications.leadAlerts })} label="🎯 New lead alerts" />
          <Toggle on={prefs.notifications.systemAnnouncements} onToggle={() => updateNotif({ systemAnnouncements: !prefs.notifications.systemAnnouncements })} label="📢 System announcements" />
        </div>

        {/* Reminder Timing */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50/50 dark:bg-white/3">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2"><BellRing className="inline h-3 w-3 mr-1 opacity-50" />Reminder Timing</label>
          <div className="flex gap-2 flex-wrap">
            {([["15min", "15 min"], ["30min", "30 min"], ["1hr", "1 hour"], ["1day", "1 day"]] as const).map(([val, label]) => (
              <button key={val} onClick={() => updateNotif({ reminderTiming: val })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${prefs.notifications.reminderTiming === val ? "bg-amber-500 text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-amber-300"}`}>
                {label} before
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ─── SECURITY ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Shield className="h-5 w-5 text-green-500" />Security</h3>
        <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-white/3 border border-slate-100 dark:border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"><KeyRound className="h-5 w-5 text-slate-400" /><div><p className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</p><p className="text-xs text-slate-400">Secure your account</p></div></div>
            {!showPasswordForm && <button onClick={() => setShowPasswordForm(true)} className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 transition-colors cursor-pointer">Change</button>}
          </div>
          {showPasswordForm && (
            <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} onSubmit={handlePasswordChange} className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 space-y-3">
              <div className="relative">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Current Password</label>
                <input type={showCurrent ? "text" : "password"} value={passwordForm.current} onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })} required className="w-full px-4 py-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 bottom-2 text-slate-400">{showCurrent ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
              </div>
              <div className="relative">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">New Password (min 8)</label>
                <input type={showNew ? "text" : "password"} value={passwordForm.new} onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })} required minLength={8} className="w-full px-4 py-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 bottom-2 text-slate-400">{showNew ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Confirm</label>
                <input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} required minLength={8} className="w-full px-4 py-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
              </div>
              {passwordMsg && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex items-center gap-2 p-2.5 rounded-lg text-xs ${passwordMsg.type === "success" ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400"}`}>{passwordMsg.type === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}{passwordMsg.text}</motion.div>}
              <div className="flex items-center gap-2 pt-1">
                <button type="submit" disabled={passwordSaving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-all disabled:opacity-60 cursor-pointer">{passwordSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Shield className="h-3.5 w-3.5" />}{passwordSaving ? "Changing..." : "Update"}</button>
                <button type="button" onClick={() => { setShowPasswordForm(false); setPasswordForm({ current: "", new: "", confirm: "" }); setPasswordMsg(null) }} className="px-4 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer">Cancel</button>
              </div>
            </motion.form>
          )}
        </div>
        <div className="mt-3 p-4 rounded-xl bg-slate-50/50 dark:bg-white/3 border border-slate-100 dark:border-white/5">
          <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-slate-700 dark:text-slate-300">Two-Factor Authentication</p><p className="text-xs text-slate-400">Extra layer of security</p></div><span className="text-xs text-slate-400 italic px-2 py-1 rounded-md bg-slate-100 dark:bg-white/5">Coming Soon</span></div>
        </div>
      </motion.div>
    </div>
  )
}
