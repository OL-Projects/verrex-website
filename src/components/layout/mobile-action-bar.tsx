"use client"

import { useTranslations } from 'next-intl'
import { Link as IntlLink } from '@/i18n/navigation'
import { Phone, FileText, Calendar, Search, Home } from "lucide-react"
import { usePathname } from "next/navigation"
import { companyInfo } from "@/lib/data"

export function MobileActionBar() {
  const pathname = usePathname()
  const t = useTranslations('MobileActionBar')

  const actions = [
    { icon: Home, label: t('home'), href: "/" },
    { icon: Search, label: t('products'), href: "/search" },
    { icon: FileText, label: t('quote'), href: "/quote" },
    { icon: Calendar, label: t('menu'), href: "/appointments" },
    { icon: Phone, label: t('call'), href: `tel:${companyInfo?.phone || ""}`, isExternal: true },
  ]

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
