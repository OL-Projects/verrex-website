"use client"

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import { useTranslations } from 'next-intl'
import { Link as IntlLink } from '@/i18n/navigation'
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { products, services, partners } from "@/lib/data"
import { formatCurrency } from "@/lib/utils"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import {
  Search,
  X,
  Package,
  Wrench,
  Users,
  FileText,
  Handshake,
  ArrowRight,
  Clock,
  Sparkles,
  TrendingUp,
} from "lucide-react"

// Team data for search
const team = [
  { name: "Alexandra Dumont", role: "CEO & Founder", desc: "15+ years in the window and door industry." },
  { name: "Marcus Chen", role: "Head of Operations", desc: "Expert in project management and logistics." },
  { name: "Sarah Williams", role: "Lead Designer", desc: "Specializing in custom door systems." },
  { name: "David Petrov", role: "Installation Director", desc: "Master craftsman with 20+ years experience." },
]

// Static pages for search
const pages = [
  { title: "Home", description: "VERREX homepage - Premium windows & doors solutions for residential, commercial, and industrial clients.", href: "/", keywords: ["home", "main", "verrex", "windows", "glass"] },
  { title: "Products Catalog", description: "Browse our comprehensive catalog of windows, doors, and door systems.", href: "/products", keywords: ["products", "catalog", "windows", "doors", "glass", "browse", "shop"] },
  { title: "Our Services", description: "Consultation, measurement, installation, inspection, and custom solutions.", href: "/services", keywords: ["services", "consultation", "measurement", "installation", "inspection", "repair"] },
  { title: "Request a Quote", description: "Get a free detailed estimate for your window and door project.", href: "/quote", keywords: ["quote", "estimate", "pricing", "free", "cost"] },
  { title: "Book Appointment", description: "Schedule a consultation, measurement, or installation appointment.", href: "/appointments", keywords: ["appointment", "schedule", "book", "meeting", "calendar"] },
  { title: "Contact Us", description: "Get in touch with our team via phone, email, or visit our office.", href: "/contact", keywords: ["contact", "phone", "email", "address", "location", "reach"] },
  { title: "About VERREX", description: "Learn about our mission, values, team, and partner network.", href: "/about", keywords: ["about", "mission", "team", "values", "company", "history"] },
]

type SearchResultType = "product" | "service" | "team" | "page" | "partner"

interface SearchResult {
  type: SearchResultType
  title: string
  description: string
  href: string
  badge?: string
  meta?: string
}

const typeConfig: Record<SearchResultType, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  product: { icon: Package, color: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40", label: "Product" },
  service: { icon: Wrench, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40", label: "Service" },
  team: { icon: Users, color: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40", label: "Team" },
  page: { icon: FileText, color: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40", label: "Page" },
  partner: { icon: Handshake, color: "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700", label: "Partner" },
}

const popularSearches = ["casement windows", "glass doors", "installation", "commercial", "energy efficient", "custom measurement"]

export default function SearchPage() {
  const t = useTranslations('SearchPage')
  const [query, setQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<SearchResultType | "all">("all")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const allResults = useMemo((): SearchResult[] => {
    if (!query.trim()) return []
    const q = query.toLowerCase().trim()

    const results: SearchResult[] = []

    // Search products
    products.forEach((p) => {
      const searchText = `${p.name} ${p.shortDescription} ${p.description} ${p.category} ${p.subcategory} ${p.tags.join(" ")} ${p.features.join(" ")}`.toLowerCase()
      if (searchText.includes(q)) {
        results.push({
          type: "product",
          title: p.name,
          description: p.shortDescription,
          href: `/products/${p.id}`,
          badge: p.category,
          meta: `${formatCurrency(p.priceRange.min)} - ${formatCurrency(p.priceRange.max)}`,
        })
      }
    })

    // Search services
    services.forEach((s) => {
      const searchText = `${s.name} ${s.description} ${s.features.join(" ")}`.toLowerCase()
      if (searchText.includes(q)) {
        results.push({
          type: "service",
          title: s.name,
          description: s.description,
          href: "/services",
          meta: s.estimatedDuration,
        })
      }
    })

    // Search team
    team.forEach((t) => {
      const searchText = `${t.name} ${t.role} ${t.desc}`.toLowerCase()
      if (searchText.includes(q)) {
        results.push({
          type: "team",
          title: t.name,
          description: t.desc,
          href: "/about",
          badge: t.role,
        })
      }
    })

    // Search pages
    pages.forEach((p) => {
      const searchText = `${p.title} ${p.description} ${p.keywords.join(" ")}`.toLowerCase()
      if (searchText.includes(q)) {
        results.push({
          type: "page",
          title: p.title,
          description: p.description,
          href: p.href,
        })
      }
    })

    // Search partners
    partners.forEach((p) => {
      const searchText = `${p.name} ${p.description} ${p.type}`.toLowerCase()
      if (searchText.includes(q)) {
        results.push({
          type: "partner",
          title: p.name,
          description: p.description,
          href: "/about#partners",
          badge: p.type,
        })
      }
    })

    return results
  }, [query])

  const filteredResults = useMemo(() => {
    if (activeFilter === "all") return allResults
    return allResults.filter((r) => r.type === activeFilter)
  }, [allResults, activeFilter])

  const resultCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allResults.length }
    allResults.forEach((r) => {
      counts[r.type] = (counts[r.type] || 0) + 1
    })
    return counts
  }, [allResults])

  const highlightMatch = useCallback((text: string) => {
    if (!query.trim()) return text
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    const parts = text.split(regex)
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-blue-200/50 dark:bg-blue-500/30 text-inherit rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }, [query])

  return (
    <div className="min-h-screen">
      {/* Search Header */}
      <section className="bg-slate-900 dark:bg-[#000000] py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Search VERREX</h1>
              <p className="text-slate-400">Find products, services, team members, and more.</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, services, team, pages..."
                className="w-full h-14 pl-12 pr-12 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all"
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  <X className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                </button>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Results */}
      <section className="py-8 dark:bg-[#030712]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* No query state */}
          {!query.trim() && (
            <FadeIn>
              <div className="text-center py-12">
                <div
                  className="h-20 w-20 mx-auto bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6"
                >
                  <Sparkles className="h-10 w-10 text-blue-500" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Start searching</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">Type to search across our entire website</p>

                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Popular Searches
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {popularSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          )}

          {/* Results with filters */}
          {query.trim() && (
            <>
              {/* Filter tabs */}
              <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                {(["all", "product", "service", "team", "page", "partner"] as const).map((filter) => {
                  const count = resultCounts[filter] || 0
                  if (filter !== "all" && count === 0) return null
                  const config = filter === "all" ? null : typeConfig[filter]
                  return (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                        activeFilter === filter
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {filter === "all" ? "All" : config?.label}
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        activeFilter === filter ? "bg-white/20" : "bg-slate-200 dark:bg-slate-700"
                      }`}>
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Results count */}
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""} for &quot;{query}&quot;
              </p>

              {/* Results list */}
              <>
                {filteredResults.length > 0 ? (
                  <div
                    key={activeFilter + query}
                    className="space-y-3"
                  >
                    {filteredResults.map((result, i) => {
                      const config = typeConfig[result.type]
                      const Icon = config.icon
                      return (
                        <div
                          key={`${result.type}-${result.title}-${i}`}
                        >
                          <IntlLink href={result.href}>
                            <Card className="group cursor-pointer hover:shadow-md dark:hover:shadow-slate-800/50 transition-all hover:border-blue-200 dark:hover:border-blue-800">
                              <CardContent className="p-4 flex items-start gap-4">
                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                                  <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                      {highlightMatch(result.title)}
                                    </h3>
                                    {result.badge && (
                                      <Badge variant="secondary" className="text-[10px] shrink-0">
                                        {result.badge}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                    {highlightMatch(result.description)}
                                  </p>
                                  {result.meta && (
                                    <p className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-medium">{result.meta}</p>
                                  )}
                                </div>
                                <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                              </CardContent>
                            </Card>
                          </IntlLink>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div
                    className="text-center py-16"
                  >
                    <div className="h-16 w-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                      <Search className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No results found</h3>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                      Try different keywords or browse our popular searches above.
                    </p>
                    <div className="mt-6 flex gap-3 justify-center">
                      <IntlLink href="/products">
                        <Button variant="outline" size="sm">Browse Products</Button>
                      </IntlLink>
                      <IntlLink href="/services">
                        <Button variant="outline" size="sm">View Services</Button>
                      </IntlLink>
                    </div>
                  </div>
                )}
              </>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
