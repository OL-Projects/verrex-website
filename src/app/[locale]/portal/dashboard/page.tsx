"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "@/i18n/navigation"
import { useEffect, useState } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { Link as IntlLink } from "@/i18n/navigation"

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
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const target = ROLE_DASHBOARDS[session.user.role] || "/portal/dashboard/client"
      router.replace(target)
    }
    if (status === "unauthenticated") {
      router.replace("/portal/login")
    }
  }, [status, session, router])

  // Safety timeout — if stuck loading for 8 seconds, show fallback
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 8000)
    return () => clearTimeout(t)
  }, [])

  if (timedOut) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Session Issue</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Unable to load your dashboard. This may happen if your session expired.
          </p>
          <IntlLink href="/portal/login"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Return to Login
          </IntlLink>
        </div>
      </div>
    )
  }

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
