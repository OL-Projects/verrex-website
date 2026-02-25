"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Link as IntlLink } from "@/i18n/navigation"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { VerrexLogo } from "@/components/ui/verrex-logo"
import { SIDEBAR_NAV } from "@/types/portal"
import type { UserRole } from "@/types/portal"
import {
  LayoutDashboard,
  UserPlus,
  FolderKanban,
  CalendarDays,
  Ruler,
  Package,
  MessageSquare,
  Receipt,
  BadgeDollarSign,
  Settings,
  PanelLeftClose,
  PanelLeft,
  X,
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  UserPlus,
  FolderKanban,
  CalendarDays,
  Ruler,
  Package,
  MessageSquare,
  Receipt,
  BadgeDollarSign,
  Settings,
}

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const userRole = (session?.user?.role || "client") as UserRole

  const filteredNav = SIDEBAR_NAV.filter((item) =>
    item.roles.includes(userRole)
  )

  const isActive = (href: string) => {
    // Match exact for dashboard, startsWith for subpages
    if (href === "/portal/dashboard") {
      return pathname.endsWith("/portal/dashboard") || pathname.endsWith("/portal/dashboard/")
    }
    return pathname.includes(href)
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
        <IntlLink href="/" className="flex items-center gap-2.5">
          <VerrexLogo variant="icon" size={32} />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="text-lg font-bold text-white tracking-tight"
            >
              VERREX
            </motion.span>
          )}
        </IntlLink>
        {/* Desktop collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="lg:hidden h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Role badge */}
      <div className="px-4 py-3 border-b border-white/5">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {userRole}
            </span>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard
          const active = isActive(item.href)

          return (
            <IntlLink
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-blue-600/20 text-blue-400 shadow-sm shadow-blue-500/10"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-blue-400" : "text-slate-500 group-hover:text-white"} transition-colors`} />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {!collapsed && item.badge && item.badge > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-blue-500 text-white rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
                  {item.badge}
                </span>
              )}
            </IntlLink>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-white/5">
        {!collapsed && (
          <div className="px-3 py-2 rounded-lg bg-white/5 text-xs text-slate-500">
            <span className="text-slate-400 font-medium">Phase 1</span> — Demo Mode
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 bg-slate-900 border-r border-white/10 transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-64"
        }`}
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
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-white/10 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
