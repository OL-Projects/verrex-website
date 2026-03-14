"use client"

import { useSession, signOut } from "next-auth/react"
import { useProfilePhoto } from "@/lib/use-profile-photo"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { usePortalT } from "@/lib/portal-i18n"
import { getNotificationsByUser } from "@/lib/portal-data"
import { Link as IntlLink } from "@/i18n/navigation"
import {
  Menu,
  Bell,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface PortalTopbarProps {
  onMenuClick: () => void
}

export function PortalTopbar({ onMenuClick }: PortalTopbarProps) {
  const { data: session } = useSession()
  const profilePhoto = useProfilePhoto(session?.user?.id || "", true)
  const T = usePortalT()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const userId = session?.user?.id || ""
  const notifications = getNotificationsByUser(userId)
  const unreadCount = notifications.filter(n => !n.read).length

  const roleLabels = T.nav.roles as Record<string, string>

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div className="h-16 border-b border-slate-200 dark:border-white/10 bg-white/60 dark:bg-slate-950/40 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 relative z-[100]">
      {/* Left: mobile menu + page context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white hidden sm:block">
          {T.nav.dashboard}
        </h2>
      </div>

      {/* Right: notifications + theme + user */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition-colors"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1">
                {unreadCount}
              </span>
            )}
          </motion.button>

          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute right-0 top-12 w-80 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl z-50 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{T.nav.notifications}</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-slate-400">{T.nav.noNotifications}</div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div key={n.id} className={`px-4 py-3 border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${!n.read ? "bg-blue-50/50 dark:bg-blue-500/5" : ""}`}>
                      <div className="flex items-start gap-2">
                        <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${n.type === "warning" ? "bg-amber-400" : n.type === "success" ? "bg-green-400" : n.type === "action" ? "bg-blue-400" : "bg-slate-300"}`} />
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{n.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </div>

        <LanguageSwitcher />
        <ThemeToggle />

        {/* User dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 h-9 pl-2 pr-3 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            {profilePhoto ? (
              <img src={profilePhoto} alt={session?.user?.name || "User"} className="h-7 w-7 rounded-full object-cover ring-1 ring-white/20" />
            ) : (
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {session?.user?.name?.charAt(0) || "?"}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight truncate max-w-32">
                {session?.user?.name || "User"}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                {roleLabels[session?.user?.role || "client"]}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute right-0 top-12 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl z-50 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{session?.user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{session?.user?.email}</p>
              </div>
              <div className="py-1">
                <IntlLink
                  href="/portal/dashboard/settings"
                  onClick={() => setShowDropdown(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <User className="h-4 w-4" />
                  {T.nav.profileSettings}
                </IntlLink>
                <button
                  onClick={() => signOut({ callbackUrl: "/portal" })}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/5 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  {T.nav.signOut}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
