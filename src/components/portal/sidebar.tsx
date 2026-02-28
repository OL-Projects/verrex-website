"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Link as IntlLink } from "@/i18n/navigation"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { VEREXLogo } from "@/components/ui/verrex-logo"
import { SIDEBAR_NAV } from "@/types/portal"
import type { UserRole } from "@/types/portal"
import {
  LayoutDashboard, UserPlus, FolderKanban, CalendarDays,
  Ruler, Package, MessageSquare, Receipt, BadgeDollarSign,
  Settings, PanelLeftClose, PanelLeft, X, LogOut, ChevronDown,
  BarChart3, Activity, Clock, FileText, ClipboardSignature,
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, UserPlus, FolderKanban, CalendarDays,
  Ruler, Package, MessageSquare, Receipt, BadgeDollarSign, Settings,
  BarChart3, Activity, Clock, FileText, ClipboardSignature,
}

// Navigation groups for visual organization
const NAV_GROUPS = [
  { label: "Overview", items: ["Dashboard"] },
  { label: "CRM", items: ["Leads", "Projects"] },
  { label: "Operations", items: ["Appointments", "Measurements", "Orders"] },
  { label: "Communication", items: ["Messages"] },
  { label: "Financial Documents", items: ["Estimates", "Invoices", "Contracts", "Commissions"] },
  { label: "Insights", items: ["Analytics", "Timeline"] },
]

const roleColors: Record<string, string> = {
  admin: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
  client: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
  contractor: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
  supplier: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400 border-purple-200 dark:border-purple-500/20",
  partner: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400 border-orange-200 dark:border-orange-500/20",
  inspector: "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20",
}

const roleLabels: Record<string, string> = {
  admin: "Admin / Sales",
  client: "Client",
  contractor: "Contractor",
  supplier: "Supplier",
  partner: "Partner",
  inspector: "Inspector",
}

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const userRole = (session?.user?.role || "client") as UserRole
  const userName = session?.user?.name || "User"
  const userEmail = session?.user?.email || ""

  const filteredNav = SIDEBAR_NAV.filter((item) =>
    item.roles.includes(userRole)
  )

  // Group navigation items
  const groupedNav = NAV_GROUPS.map(group => ({
    ...group,
    navItems: filteredNav.filter(item => group.items.includes(item.label)),
  })).filter(group => group.navItems.length > 0)

  // Settings is separate (always at bottom)
  const settingsItem = filteredNav.find(item => item.label === "Settings")

  const isActive = (href: string) => {
    if (href === "/portal/dashboard") {
      return pathname.endsWith("/portal/dashboard") || pathname.endsWith("/portal/dashboard/")
    }
    return pathname.includes(href)
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* ── Logo Area ─────────────────────────── */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-white/10">
        <IntlLink href="/" className="flex items-center gap-2.5 group">
          <VEREXLogo variant="icon" size={32} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-lg font-bold text-slate-900 dark:text-white tracking-tight"
              >
                VEREX
              </motion.span>
            )}
          </AnimatePresence>
        </IntlLink>

        {/* Desktop collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg
            hover:bg-slate-100 dark:hover:bg-white/10
            text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white
            transition-colors"
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>

        {/* Mobile close */}
        <button
          onClick={onMobileClose}
          className="lg:hidden h-8 w-8 flex items-center justify-center rounded-lg
            hover:bg-slate-100 dark:hover:bg-white/10
            text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* ── User Card (top) ──────────────────── */}
      {!collapsed ? (
        <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0">
              {userName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate leading-tight">{userName}</p>
              <span className={`inline-flex items-center gap-1 mt-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md border ${roleColors[userRole]}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                {roleLabels[userRole]}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-3 py-3 border-b border-slate-100 dark:border-white/5 flex justify-center">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            {userName.charAt(0)}
          </div>
        </div>
      )}

      {/* ── Navigation Groups ────────────────── */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto scrollbar-thin">
        {groupedNav.map((group, gi) => (
          <div key={group.label} className={gi > 0 ? "mt-4" : ""}>
            {/* Group label */}
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
                {group.label}
              </p>
            )}
            {collapsed && gi > 0 && (
              <div className="mx-3 mb-2 border-t border-slate-100 dark:border-white/5" />
            )}

            <div className="space-y-0.5">
              {group.navItems.map((item) => {
                const Icon = iconMap[item.icon] || LayoutDashboard
                const active = isActive(item.href)
                const isHovered = hoveredItem === item.href

                return (
                  <div key={item.href} className="relative">
                    <IntlLink
                      href={item.href}
                      onClick={onMobileClose}
                      onMouseEnter={() => setHoveredItem(item.href)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`group relative flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        active
                          ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                      } ${collapsed ? "justify-center" : ""}`}
                    >
                      {/* Active left accent */}
                      {active && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-blue-500"
                          transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        />
                      )}

                      <Icon className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                        active
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-white"
                      }`} />

                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}

                      {!collapsed && item.badge && item.badge > 0 && (
                        <span className="ml-auto text-[10px] font-bold bg-blue-600 text-white rounded-full h-5 min-w-5 flex items-center justify-center px-1.5 shadow-sm">
                          {item.badge}
                        </span>
                      )}
                    </IntlLink>

                    {/* Tooltip on collapsed hover */}
                    {collapsed && isHovered && (
                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-[60] pointer-events-none">
                        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                          {item.label}
                          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-white" />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Bottom Section ───────────────────── */}
      <div className="border-t border-slate-200 dark:border-white/10 px-3 py-3 space-y-1">
        {/* Settings */}
        {settingsItem && (
          <div className="relative">
            <IntlLink
              href={settingsItem.href}
              onClick={onMobileClose}
              onMouseEnter={() => setHoveredItem("settings")}
              onMouseLeave={() => setHoveredItem(null)}
              className={`group relative flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(settingsItem.href)
                  ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              } ${collapsed ? "justify-center" : ""}`}
            >
              {isActive(settingsItem.href) && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-blue-500" />
              )}
              <Settings className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                isActive(settingsItem.href)
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-white"
              }`} />
              {!collapsed && <span className="truncate">Settings</span>}
            </IntlLink>

            {collapsed && hoveredItem === "settings" && (
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-[60] pointer-events-none">
                <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                  Settings
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-white" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sign Out */}
        <button
          onClick={() => signOut({ callbackUrl: "/portal" })}
          onMouseEnter={() => setHoveredItem("signout")}
          onMouseLeave={() => setHoveredItem(null)}
          className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
            text-slate-500 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/5
            ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        {collapsed && hoveredItem === "signout" && (
          <div className="absolute left-full ml-3 bottom-3 z-[60] pointer-events-none">
            <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
              Sign Out
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-white" />
            </div>
          </div>
        )}

        {/* Version chip */}
        {!collapsed && (
          <div className="px-3 py-1.5 mt-1">
            <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-600">
              <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
              <span>v1.0 — Phase 1</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 transition-all duration-300
          bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-white/10
          ${collapsed ? "w-[72px]" : "w-64"}`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-64
                bg-white dark:bg-slate-900
                border-r border-slate-200 dark:border-white/10 lg:hidden shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
