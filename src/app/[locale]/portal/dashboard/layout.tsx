"use client"

import { useState } from "react"
import { Sidebar } from "@/components/portal/sidebar"
import { PortalTopbar } from "@/components/portal/portal-topbar"
import { PortalStoreProvider } from "@/lib/portal-store"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <PortalStoreProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-[#030712]">
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
