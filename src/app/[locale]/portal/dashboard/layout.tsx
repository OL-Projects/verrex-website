"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Sidebar } from "@/components/portal/sidebar"
import { PortalTopbar } from "@/components/portal/portal-topbar"
import { PortalStoreProvider } from "@/lib/portal-store"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { setTheme } = useTheme()

  // Portal defaults to light mode on first visit (website uses dark)
  useEffect(() => {
    try {
      if (!localStorage.getItem("vx_portal_theme_set")) {
        setTheme("light")
        localStorage.setItem("vx_portal_theme_set", "1")
      }
    } catch {}
  }, [setTheme])

  return (
    <PortalStoreProvider>
        <div className="portal min-h-screen bg-slate-100/80 dark:bg-[#0C0D12]">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        <div className="lg:pl-64 flex flex-col min-h-screen transition-all duration-300">
          <PortalTopbar onMenuClick={() => setMobileMenuOpen(true)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </PortalStoreProvider>
  )
}
