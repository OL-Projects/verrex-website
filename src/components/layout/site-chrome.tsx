"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { MobileActionBar } from "@/components/layout/mobile-action-bar"

/**
 * SiteChrome — Conditionally renders the marketing site Header, Footer, 
 * and MobileActionBar. Suppresses all three on /portal routes so the 
 * portal dashboard has a clean, standalone layout.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPortal = pathname.includes("/portal/dashboard")

  if (isPortal) {
    // Portal dashboard — render children only, no website chrome
    return <main className="min-h-screen">{children}</main>
  }

  // Marketing site — full website chrome
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-4rem)] pb-16 lg:pb-0">{children}</main>
      <Footer />
      <MobileActionBar />
    </>
  )
}
