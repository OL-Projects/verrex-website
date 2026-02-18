"use client"

import { useTranslations } from 'next-intl'
import { Link as IntlLink } from '@/i18n/navigation'
import { Phone, FileText, Calendar, Search, Home } from "lucide-react"
import { usePathname } from "next/navigation"
import { companyInfo } from "@/lib/data"

const actions = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Search, label: "Search", href: "/search" },
  { icon: FileText, label: "Quote", href: "/quote" },
  { icon: Calendar, label: "Book", href: "/appointments" },
  { icon: Phone, label: "Call", href: `tel:${companyInfo?.phone || ""}`, isExternal: true },
]

export function MobileActionBar() {
  const pathname = usePathname()
  const t = useTranslations('MobileActionBar')

  return (
    <div className="mobile-action-bar lg:hidden sticky-bottom-bar">
      {actions.map((action) => {
        const isActive = !action.isExternal && pathname === action.href
        const Component = action.isExternal ? "a" : IntlLink

        return (
          <Component
            key={action.label}
            href={action.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[3rem] ${
              isActive
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <action.icon className={`h-5 w-5 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`} />
            <span className="text-[10px] font-medium">{action.label}</span>
          </Component>
        )
      })}
    </div>
  )
}
