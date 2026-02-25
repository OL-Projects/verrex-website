"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "@/i18n/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

// Role-based dashboard redirect
const ROLE_DASHBOARDS: Record<string, string> = {
  admin: "/portal/dashboard/admin",
  client: "/portal/dashboard/client",
  contractor: "/portal/dashboard/contractor",
  supplier: "/portal/dashboard/supplier",
  partner: "/portal/dashboard/partner",
  inspector: "/portal/dashboard/contractor", // inspectors share contractor view
}

export default function DashboardRedirectPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const target = ROLE_DASHBOARDS[session.user.role] || "/portal/dashboard/client"
      router.replace(target)
    }
    if (status === "unauthenticated") {
      router.replace("/portal/login")
    }
  }, [status, session, router])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading your dashboard...
        </p>
      </div>
    </div>
  )
}
