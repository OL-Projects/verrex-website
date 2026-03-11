"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import {
  User, Shield, Bell, Loader2, CheckCircle2, AlertCircle,
  Eye, EyeOff, Save, Building2, Phone, Mail, KeyRound,
} from "lucide-react"

type ProfileData = {
  name: string
  email: string
  role: string
  company: string
  phone: string
  createdAt: string
  updatedAt: string
}

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession()

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

  // Fetch profile from API
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/portal/profile")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setProfile(data.user)
      setProfileForm({
        name: data.user.name || "",
        phone: data.user.phone || "",
        company: data.user.company || "",
      })
    } catch {
      setProfileMsg({ type: "error", text: "Failed to load profile" })
    } finally {
      setProfileLoading(false)
    }
  }, [])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  // Check if form has changes
  useEffect(() => {
    if (!profile) return
    const changed = profileForm.name !== (profile.name || "") ||
      profileForm.phone !== (profile.phone || "") ||
      profileForm.company !== (profile.company || "")
    setProfileDirty(changed)
  }, [profileForm, profile])

  // Auto-clear messages after 5s
  useEffect(() => {
    if (profileMsg) { const t = setTimeout(() => setProfileMsg(null), 5000); return () => clearTimeout(t) }
  }, [profileMsg])
  useEffect(() => {
    if (passwordMsg) { const t = setTimeout(() => setPasswordMsg(null), 5000); return () => clearTimeout(t) }
  }, [passwordMsg])

  // Save profile
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profileDirty) return
    setProfileSaving(true)
    setProfileMsg(null)

    try {
      const res = await fetch("/api/portal/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update")

      setProfile(data.user)
      setProfileMsg({ type: "success", text: "Profile updated successfully!" })
      setProfileDirty(false)

      // Update NextAuth session with new name
      if (data.user.name !== session?.user?.name) {
        await updateSession({ name: data.user.name })
      }
    } catch (err) {
      setProfileMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to update profile" })
    } finally {
      setProfileSaving(false)
    }
  }

  // Change password
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMsg(null)

    if (passwordForm.new.length < 8) {
      setPasswordMsg({ type: "error", text: "New password must be at least 8 characters" })
      return
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordMsg({ type: "error", text: "New passwords do not match" })
      return
    }

    setPasswordSaving(true)

    try {
      const res = await fetch("/api/portal/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.new,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to change password")

      setPasswordMsg({ type: "success", text: "Password changed successfully!" })
      setPasswordForm({ current: "", new: "", confirm: "" })
      setShowPasswordForm(false)
    } catch (err) {
      setPasswordMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to change password" })
    } finally {
      setPasswordSaving(false)
    }
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account preferences</p>
      </motion.div>

      {/* Profile Section */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-blue-500" /> Profile
        </h3>

        {/* Avatar + Role Badge */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {profile?.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{profile?.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 font-medium capitalize">
                {profile?.role}
              </span>
              <span className="text-xs text-slate-400">
                Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <User className="inline h-3.5 w-3.5 mr-1 opacity-50" />Name
              </label>
              <input type="text" value={profileForm.name}
                onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                minLength={2} required
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <Mail className="inline h-3.5 w-3.5 mr-1 opacity-50" />Email
              </label>
              <input type="email" value={profile?.email || ""} disabled
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed" />
              <p className="text-[11px] text-slate-400 mt-1">Email cannot be changed</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <Phone className="inline h-3.5 w-3.5 mr-1 opacity-50" />Phone
              </label>
              <input type="tel" value={profileForm.phone}
                onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="(514) 555-0000"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <Building2 className="inline h-3.5 w-3.5 mr-1 opacity-50" />Company
              </label>
              <input type="text" value={profileForm.company}
                onChange={e => setProfileForm({ ...profileForm, company: e.target.value })}
                placeholder="Your company name"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" />
            </div>
          </div>

          {/* Profile Message */}
          {profileMsg && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                profileMsg.type === "success"
                  ? "bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400"
                  : "bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400"
              }`}>
              {profileMsg.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {profileMsg.text}
            </motion.div>
          )}

          <button type="submit" disabled={!profileDirty || profileSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
            {profileSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {profileSaving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </motion.div>

      {/* Security Section */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-500" /> Security
        </h3>

        {/* Change Password */}
        <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-white/3 border border-slate-100 dark:border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <KeyRound className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</p>
                <p className="text-xs text-slate-400">Secure your account with a strong password</p>
              </div>
            </div>
            {!showPasswordForm && (
              <button onClick={() => setShowPasswordForm(true)}
                className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer">
                Change
              </button>
            )}
          </div>

          {showPasswordForm && (
            <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              onSubmit={handlePasswordChange} className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 space-y-3">

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Current Password</label>
                <div className="relative">
                  <input type={showCurrent ? "text" : "password"} value={passwordForm.current}
                    onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    placeholder="Enter current password" required
                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    {showCurrent ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">New Password <span className="text-slate-400">(min 8 characters)</span></label>
                <div className="relative">
                  <input type={showNew ? "text" : "password"} value={passwordForm.new}
                    onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    placeholder="Min. 8 characters" required minLength={8}
                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    {showNew ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Confirm New Password</label>
                <input type="password" value={passwordForm.confirm}
                  onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  placeholder="Re-enter new password" required minLength={8}
                  className="w-full px-4 py-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" />
              </div>

              {passwordMsg && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={`flex items-center gap-2 p-2.5 rounded-lg text-xs ${
                    passwordMsg.type === "success"
                      ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                      : "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400"
                  }`}>
                  {passwordMsg.type === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                  {passwordMsg.text}
                </motion.div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button type="submit" disabled={passwordSaving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-all disabled:opacity-60 cursor-pointer">
                  {passwordSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Shield className="h-3.5 w-3.5" />}
                  {passwordSaving ? "Changing..." : "Update Password"}
                </button>
                <button type="button" onClick={() => {
                  setShowPasswordForm(false)
                  setPasswordForm({ current: "", new: "", confirm: "" })
                  setPasswordMsg(null)
                }}
                  className="px-4 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer">
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </div>

        {/* Two-Factor Auth */}
        <div className="mt-3 p-4 rounded-xl bg-slate-50/50 dark:bg-white/3 border border-slate-100 dark:border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Two-Factor Authentication</p>
              <p className="text-xs text-slate-400">Add an extra layer of security</p>
            </div>
            <span className="text-xs text-slate-400 italic px-2 py-1 rounded-md bg-slate-100 dark:bg-white/5">Coming Soon</span>
          </div>
        </div>
      </motion.div>

      {/* Notifications Section */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-amber-500" /> Notifications
        </h3>
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
