"use client"

import React, { useState, useEffect } from "react"
import { useTranslations } from 'next-intl'
import { Link as IntlLink } from '@/i18n/navigation'
import { LanguageSwitcher } from './language-switcher'
import { useRouter } from '@/i18n/navigation'
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { ViewportToggle } from "@/components/ui/viewport-toggle"
import { VerrexLogo } from "@/components/ui/verrex-logo"
import { companyInfo } from "@/lib/data"
import {
  Phone,
  Mail,
  Menu,
  X,
  ChevronDown,
  Building2,
  Home,
  Factory,
  Search,
  Command,
  Layers,
} from "lucide-react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const router = useRouter()
  const t = useTranslations('Navigation')

  const navigation = [
    { name: t('home'), href: "/" },
    {
      name: t('products'),
      href: "/products",
      children: [
        { name: t('residential'), href: "/products?category=residential", icon: Home },
        { name: t('commercial'), href: "/products?category=commercial", icon: Building2 },
        { name: t('industrial'), href: "/products?category=industrial", icon: Factory },
        { name: t('windowTypes'), href: "/products/window-types", icon: Layers },
      ],
    },
    { name: t('catalog'), href: "/catalog" },
    { name: t('projects'), href: "/projects" },
    { name: t('services'), href: "/services" },
    { name: t('about'), href: "/about" },
    { name: t('contact'), href: "/contact" },
  ]

  // Keyboard shortcut: Ctrl/Cmd + K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        router.push("/search")
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router])

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar — Glassmorphism */}
      <div className="bg-slate-900/50 dark:bg-black/35 backdrop-blur-xl text-white border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-10 items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <a
                href={`tel:${companyInfo.phone}`}
                className="flex items-center gap-1.5 hover:text-blue-300 transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                {companyInfo.phone}
              </a>
              <a
                href={`mailto:${companyInfo.email}`}
                className="hidden sm:flex items-center gap-1.5 hover:text-blue-300 transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                {companyInfo.email}
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden md:inline text-slate-300/80">
                {t('monFri')}{companyInfo.hours.weekdays}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation — Glassmorphism */}
      <div className="bg-white/40 dark:bg-slate-950/25 backdrop-blur-xl border-b border-white/20 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <IntlLink href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <VerrexLogo variant="icon" size={44} />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold tracking-tight leading-none text-slate-900 dark:text-white drop-shadow-sm">
                  VERREX
                </span>
                <span className="hidden sm:block text-[8px] text-slate-600 dark:text-slate-300 tracking-[0.18em] uppercase leading-tight mt-0.5 font-medium whitespace-nowrap">
                  {t('windowsAndDoors')}
                </span>
              </div>
            </IntlLink>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() =>
                    item.children && setActiveDropdown(item.name)
                  }
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <IntlLink
                    href={item.href}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-white/40 dark:hover:bg-white/10 transition-all duration-200"
                  >
                    {item.name}
                    {item.children && (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </IntlLink>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {item.children && activeDropdown === item.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute left-0 top-full pt-1 w-56 z-50"
                      >
                        <div className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl rounded-xl shadow-xl shadow-black/10 dark:shadow-black/40 border border-white/30 dark:border-white/10 py-2 overflow-hidden">
                          {item.children.map((child) => (
                            <IntlLink
                              key={child.name}
                              href={child.href}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                            >
                              <child.icon className="h-4 w-4" />
                              {child.name}
                            </IntlLink>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Enhanced Search Button - Desktop */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/search")}
                className="hidden sm:flex items-center gap-3 h-9 px-3 rounded-lg border border-white/30 dark:border-white/15 bg-white/30 dark:bg-white/5 backdrop-blur-sm hover:bg-white/50 dark:hover:bg-white/10 hover:border-blue-400/40 dark:hover:border-blue-400/30 transition-all group cursor-pointer"
                aria-label="Search"
              >
                <Search className="h-4 w-4 text-slate-500 dark:text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                <span className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                  {t('searchPlaceholder')}
                </span>
                <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/50 dark:bg-white/10 border border-white/30 dark:border-white/10 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  <Command className="h-2.5 w-2.5" />K
                </kbd>
              </motion.button>

              {/* Mobile Search Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/search")}
                className="sm:hidden h-9 w-9 rounded-lg border border-white/30 dark:border-white/15 bg-white/30 dark:bg-white/5 backdrop-blur-sm flex items-center justify-center hover:bg-white/50 dark:hover:bg-white/10 hover:border-blue-400/40 dark:hover:border-blue-400/30 transition-all"
                aria-label="Search"
              >
                <Search className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </motion.button>

              {/* View toggles */}
              <ViewportToggle />
              <LanguageSwitcher />
              <ThemeToggle />

              {/* CTA Buttons */}
              <div className="hidden lg:flex items-center gap-2 ml-2">
                <IntlLink href="/quote">
                  <Button variant="outline" size="sm">
                    {t('getQuote')}
                  </Button>
                </IntlLink>
                <IntlLink href="/appointments">
                  <Button variant="primary" size="sm">
                    {t('bookAppointment')}
                  </Button>
                </IntlLink>
              </div>

              {/* Mobile menu button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                className="lg:hidden p-2 rounded-md text-slate-800 dark:text-slate-200 hover:bg-white/40 dark:hover:bg-white/10 transition-all duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation — Glassmorphism */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden border-t border-white/15 dark:border-white/10 bg-white/50 dark:bg-slate-950/35 backdrop-blur-xl overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {/* Mobile Search - Prominent */}
                <IntlLink href="/search" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center gap-3 px-4 py-3 mb-3 rounded-lg bg-white/40 dark:bg-white/5 border border-white/30 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 hover:border-blue-400/30 transition-all duration-200">
                    <Search className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{t('searchFullPlaceholder')}</span>
                  </div>
                </IntlLink>

                {navigation.map((item) => (
                  <div key={item.name}>
                    <IntlLink
                      href={item.href}
                      className="block px-4 py-2.5 text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-white/40 dark:hover:bg-white/10 rounded-md transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </IntlLink>
                    {item.children && (
                      <div className="ml-4 space-y-1">
                        {item.children.map((child) => (
                          <IntlLink
                            key={child.name}
                            href={child.href}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/10 rounded-md transition-all duration-200"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <child.icon className="h-4 w-4" />
                            {child.name}
                          </IntlLink>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="pt-4 space-y-2 border-t border-white/20 dark:border-white/10 mt-4">
                  <IntlLink href="/quote" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      {t('getQuote')}
                    </Button>
                  </IntlLink>
                  <IntlLink
                    href="/appointments"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="primary" className="w-full">
                      {t('bookAppointment')}
                    </Button>
                  </IntlLink>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
