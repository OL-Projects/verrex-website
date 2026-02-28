"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { useTranslations } from 'next-intl'
import { Link as IntlLink } from '@/i18n/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { products } from "@/lib/data"
import {
  Search, X, ArrowRight, LayoutGrid, List, Check, Sparkles,
  ChevronRight, ChevronDown, AppWindow, DoorOpen, Box, ArrowLeft, Info, SlidersHorizontal,
} from "lucide-react"

type SortOption = "name-asc" | "name-desc"

const typeInfo: Record<string, { title: string; desc: string; features: string[]; use: string; frames: string }> = {
  "top-hung": { title: "Top Hung Windows", desc: "Hinged at the top and opening outward from the bottom. Ideal for ventilation while preventing rain entry. Often used in basements and bathrooms.", features: ["Rain protection when open", "Excellent ventilation control", "Compact operation", "Easy to clean"], use: "Basements, Bathrooms, Kitchens", frames: "Aluminum, PVC, Hybrid" },
  "sliding-window": { title: "Sliding Windows", desc: "Horizontal sliding sash windows that glide smoothly on tracks. Space-efficient and easy to operate. Available in 2-panel and 3-panel configurations.", features: ["Space-saving operation", "Smooth gliding tracks", "Multi-panel options", "Wide unobstructed views"], use: "Living rooms, Bedrooms, Offices", frames: "Aluminum, PVC, Wood-clad" },
  "casement": { title: "Casement Windows", desc: "Side-hinged windows that open outward like a door. Provide maximum ventilation and an unobstructed view. Available in tilt & turn and hand-cranked variants.", features: ["Maximum ventilation", "Unobstructed views", "Multi-point locking", "Energy efficient seals"], use: "Residential, Light Commercial", frames: "Aluminum, PVC, Wood, Fiberglass" },
  "tilt-turn": { title: "Tilt & Turn Windows", desc: "European-style casement windows that tilt inward from the top for ventilation or swing fully inward for cleaning and emergency egress. Dual-function hardware.", features: ["Tilt mode for secure ventilation", "Full inward opening for cleaning", "Emergency egress capable", "Child-safe tilt position"], use: "High-rise, Condos, Modern Homes", frames: "Aluminum, PVC, Wood-Aluminum" },
  "hand-cranked": { title: "Hand Cranked Casement", desc: "Traditional casement windows operated by a hand crank mechanism that pushes the sash outward. Provides precise control over opening angle.", features: ["Precise opening control", "Outward projection for airflow", "Traditional crank mechanism", "Tight weatherseal when closed"], use: "Residential, Heritage Buildings", frames: "Aluminum, PVC, Wood" },
  "sliding-door": { title: "Sliding Doors", desc: "Large-panel doors that glide horizontally on precision tracks. Available in 2, 3, and 4-panel configurations. Ideal for connecting indoor and outdoor spaces.", features: ["Seamless indoor-outdoor flow", "Heavy-duty roller systems", "Multi-point security locks", "Thermal break frames"], use: "Patios, Balconies, Terraces", frames: "Aluminum, PVC, Wood-clad" },
  "folding": { title: "Folding Doors", desc: "Multi-panel bi-fold door systems that fold and stack to create wide open passages. Transform entire walls into open-air spaces.", features: ["Full wall opening", "Bi-fold panel stacking", "Flush threshold options", "Weather-rated seals"], use: "Restaurants, Patios, Showrooms", frames: "Aluminum, Aluminum-Wood" },
  "swing": { title: "Swing Doors", desc: "Traditional hinged doors that swing open on side-mounted hinges. Available as single or double-leaf, inward or outward opening.", features: ["Classic operation", "Single or double leaf", "ADA compliant options", "Panic hardware available"], use: "Entries, Commercial, Institutional", frames: "Aluminum, Steel, Glass" },
}

export default function CatalogPage() {
  const t = useTranslations('CatalogPage')
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<SortOption>("name-asc")
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["windows", "doors"]))
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  const selectFilter = (filter: string) => {
    setActiveFilter(filter)
    setIsMobileFilterOpen(false)
  }

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesFilter = activeFilter === "all" ||
        (activeFilter === "windows" && product.subcategory === "Windows") ||
        (activeFilter === "doors" && (product.subcategory === "Doors" || product.subcategory === "Entry Systems")) ||
        product.subcategory === activeFilter ||
        product.tags.some(tag => tag === activeFilter)
      const matchesSearch = searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesFilter && matchesSearch
    })
    result.sort((a, b) => sortBy === "name-desc" ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name))
    return result
  }, [activeFilter, searchQuery, sortBy])

  const clearFilters = () => { setSearchQuery(""); setActiveFilter("all"); setSortBy("name-asc") }

  const isActive = (id: string) => activeFilter === id
  const btnCls = (id: string) => `w-full text-left flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive(id) ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`
  const subCls = (id: string) => `w-full text-left px-3 py-1 rounded-md text-xs transition-colors ${isActive(id) ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium" : "text-slate-500 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300"}`

  return (
    <div>
      {/* Hero */}
      <section className="bg-slate-50 dark:bg-[#000000] py-12 border-b border-slate-200 dark:border-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Badge variant="primary" className="mb-3">{t('badge')}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-2xl">{t('description')}</p>
        </div>
      </section>

      {/* Sidebar + Content */}
      <section className="py-8 dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="w-64 shrink-0 hidden lg:block">
              <div className="sticky top-24 space-y-5">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder={t('searchPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-10 text-sm" />
                  {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="h-3.5 w-3.5" /></button>}
                </div>

                {/* Tree Navigation */}
                <nav>
                  <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">{t('productTypes')}</h3>

                  {/* All Products */}
                  <button onClick={() => selectFilter("all")} className={btnCls("all")}>
                    <span>{t('allTypes')}</span>
                    <Badge variant="secondary" className="text-[10px] h-5 min-w-[20px] justify-center">{products.length}</Badge>
                  </button>

                  {/* ── WINDOWS ── */}
                  <div className="mt-2">
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleNode("windows")} className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                        {expandedNodes.has("windows") ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => selectFilter("windows")} className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive("windows") ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}>
                        <AppWindow className="h-4 w-4" /> {t('catWindows')}
                      </button>
                    </div>
                    {expandedNodes.has("windows") && (
                      <div className="ml-6 mt-1 space-y-0.5 border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                        <button onClick={() => selectFilter("top-hung")} className={subCls("top-hung")}>{t('topHung')}</button>
                        <button onClick={() => selectFilter("sliding-window")} className={subCls("sliding-window")}>{t('slidingWindow')}</button>
                        {/* Casement with sub-tree */}
                        <div>
                          <div className="flex items-center gap-0.5">
                            <button onClick={() => toggleNode("casement")} className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 shrink-0">
                              {expandedNodes.has("casement") ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                            </button>
                            <button onClick={() => selectFilter("casement")} className={subCls("casement")}>{t('casement')}</button>
                          </div>
                          {expandedNodes.has("casement") && (
                            <div className="ml-5 mt-0.5 space-y-0.5 border-l border-slate-200 dark:border-slate-700 pl-2.5">
                              <button onClick={() => selectFilter("tilt-turn")} className={subCls("tilt-turn")}>
                                <span>{t('tiltTurn')}</span>
                                <span className="ml-1 text-[10px] text-slate-400">({t('opensInside')})</span>
                              </button>
                              <button onClick={() => selectFilter("hand-cranked")} className={subCls("hand-cranked")}>
                                <span>{t('handCranked')}</span>
                                <span className="ml-1 text-[10px] text-slate-400">({t('opensOutside')})</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── DOORS ── */}
                  <div className="mt-2">
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleNode("doors")} className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                        {expandedNodes.has("doors") ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => selectFilter("doors")} className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive("doors") ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}>
                        <DoorOpen className="h-4 w-4" /> {t('catDoors')}
                      </button>
                    </div>
                    {expandedNodes.has("doors") && (
                      <div className="ml-6 mt-1 space-y-0.5 border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                        <button onClick={() => selectFilter("sliding-door")} className={subCls("sliding-door")}>{t('slidingDoor')}</button>
                        <button onClick={() => selectFilter("folding")} className={subCls("folding")}>{t('folding')}</button>
                        <button onClick={() => selectFilter("swing")} className={subCls("swing")}>{t('swing')}</button>
                      </div>
                    )}
                  </div>
                </nav>

                {/* Quick Links */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                  <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">{t('quickLinks')}</h3>
                  <ul className="space-y-1.5">
                    <li><IntlLink href="/products/windows" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><ChevronRight className="h-3.5 w-3.5" />{t('windowsSection')}</IntlLink></li>
                    <li><IntlLink href="/products/doors" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><ChevronRight className="h-3.5 w-3.5" />{t('doorsSection')}</IntlLink></li>
                    <li><IntlLink href="/products/window-types" className="flex items-center gap-2 text-sm font-semibold transition-colors text-violet-600 dark:text-violet-400 hover:text-blue-600 dark:hover:text-blue-400"><Box className="h-3.5 w-3.5" />✦ {t('configurator3d')}</IntlLink></li>
                  </ul>
                </div>

                {/* 3D Configurator Promo Card */}
                <IntlLink href="/products/window-types">
                  <div className="rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700 p-4 text-white ring-1 ring-white/15 shadow-[0_4px_20px_rgba(99,102,241,0.35)] hover:shadow-[0_6px_30px_rgba(99,102,241,0.45)] hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                    <Box className="h-6 w-6 mb-2 opacity-90" />
                    <p className="text-sm font-bold">3D Configurator</p>
                    <p className="text-[11px] text-white/75 mt-0.5">Visualize windows & doors interactively</p>
                    <div className="mt-3 flex items-center gap-1 text-xs font-medium text-white/90">Try it now <ArrowRight className="h-3 w-3" /></div>
                  </div>
                </IntlLink>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Mobile Search + Filter Bar */}
              <div className="lg:hidden mb-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder={t('searchPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-10 text-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsMobileFilterOpen(true)}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all text-sm font-medium text-slate-700 dark:text-slate-300">
                    <SlidersHorizontal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>{t('productTypes')}</span>
                    {activeFilter !== "all" && (
                      <Badge variant="primary" className="text-[10px] h-5 px-1.5 ml-0.5">1</Badge>
                    )}
                  </button>
                  {activeFilter !== "all" && (
                    <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      <X className="h-3 w-3" /> {t('clearFilters')}
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile Filter Drawer */}
              {isMobileFilterOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                  {/* Backdrop */}
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm drawer-backdrop" onClick={() => setIsMobileFilterOpen(false)} />
                  {/* Panel */}
                  <div className="relative w-[300px] max-w-[85vw] h-full bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto drawer-slide-in">
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                      <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4" /> {t('productTypes')}
                      </h2>
                      <button onClick={() => setIsMobileFilterOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    {/* Content */}
                    <div className="p-5 space-y-5">
                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder={t('searchPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-10 text-sm" />
                        {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="h-3.5 w-3.5" /></button>}
                      </div>

                      {/* Tree Navigation */}
                      <nav>
                        <button onClick={() => selectFilter("all")} className={btnCls("all")}>
                          <span>{t('allTypes')}</span>
                          <Badge variant="secondary" className="text-[10px] h-5 min-w-[20px] justify-center">{products.length}</Badge>
                        </button>

                        {/* Windows */}
                        <div className="mt-2">
                          <div className="flex items-center gap-1">
                            <button onClick={() => toggleNode("windows")} className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                              {expandedNodes.has("windows") ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                            </button>
                            <button onClick={() => selectFilter("windows")} className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive("windows") ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}>
                              <AppWindow className="h-4 w-4" /> {t('catWindows')}
                            </button>
                          </div>
                          {expandedNodes.has("windows") && (
                            <div className="ml-6 mt-1 space-y-0.5 border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                              <button onClick={() => selectFilter("top-hung")} className={subCls("top-hung")}>{t('topHung')}</button>
                              <button onClick={() => selectFilter("sliding-window")} className={subCls("sliding-window")}>{t('slidingWindow')}</button>
                              <div>
                                <div className="flex items-center gap-0.5">
                                  <button onClick={() => toggleNode("casement")} className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 shrink-0">
                                    {expandedNodes.has("casement") ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                  </button>
                                  <button onClick={() => selectFilter("casement")} className={subCls("casement")}>{t('casement')}</button>
                                </div>
                                {expandedNodes.has("casement") && (
                                  <div className="ml-5 mt-0.5 space-y-0.5 border-l border-slate-200 dark:border-slate-700 pl-2.5">
                                    <button onClick={() => selectFilter("tilt-turn")} className={subCls("tilt-turn")}>
                                      <span>{t('tiltTurn')}</span>
                                      <span className="ml-1 text-[10px] text-slate-400">({t('opensInside')})</span>
                                    </button>
                                    <button onClick={() => selectFilter("hand-cranked")} className={subCls("hand-cranked")}>
                                      <span>{t('handCranked')}</span>
                                      <span className="ml-1 text-[10px] text-slate-400">({t('opensOutside')})</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Doors */}
                        <div className="mt-2">
                          <div className="flex items-center gap-1">
                            <button onClick={() => toggleNode("doors")} className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                              {expandedNodes.has("doors") ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                            </button>
                            <button onClick={() => selectFilter("doors")} className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive("doors") ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}>
                              <DoorOpen className="h-4 w-4" /> {t('catDoors')}
                            </button>
                          </div>
                          {expandedNodes.has("doors") && (
                            <div className="ml-6 mt-1 space-y-0.5 border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                              <button onClick={() => selectFilter("sliding-door")} className={subCls("sliding-door")}>{t('slidingDoor')}</button>
                              <button onClick={() => selectFilter("folding")} className={subCls("folding")}>{t('folding')}</button>
                              <button onClick={() => selectFilter("swing")} className={subCls("swing")}>{t('swing')}</button>
                            </div>
                          )}
                        </div>
                      </nav>

                      {/* Quick Links */}
                      <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                        <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">{t('quickLinks')}</h3>
                        <ul className="space-y-1.5">
                          <li><IntlLink href="/products/windows" onClick={() => setIsMobileFilterOpen(false)} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><ChevronRight className="h-3.5 w-3.5" />{t('windowsSection')}</IntlLink></li>
                          <li><IntlLink href="/products/doors" onClick={() => setIsMobileFilterOpen(false)} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><ChevronRight className="h-3.5 w-3.5" />{t('doorsSection')}</IntlLink></li>
                          <li><IntlLink href="/products/window-types" onClick={() => setIsMobileFilterOpen(false)} className="flex items-center gap-2 text-sm font-semibold transition-colors text-violet-600 dark:text-violet-400 hover:text-blue-600 dark:hover:text-blue-400"><Box className="h-3.5 w-3.5" />✦ {t('configurator3d')}</IntlLink></li>
                        </ul>
                      </div>

                      {/* 3D Configurator Promo */}
                      <IntlLink href="/products/window-types" onClick={() => setIsMobileFilterOpen(false)}>
                        <div className="rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700 p-4 text-white ring-1 ring-white/15 shadow-[0_4px_20px_rgba(99,102,241,0.35)] cursor-pointer">
                          <Box className="h-6 w-6 mb-2 opacity-90" />
                          <p className="text-sm font-bold">3D Configurator</p>
                          <p className="text-[11px] text-white/75 mt-0.5">Visualize windows & doors interactively</p>
                          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-white/90">Try it now <ArrowRight className="h-3 w-3" /></div>
                        </div>
                      </IntlLink>
                    </div>
                  </div>
                </div>
              )}

              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <span className="text-sm text-slate-500 dark:text-slate-400">{t('showing', { filtered: filteredProducts.length, total: products.length })}</span>
                <div className="flex items-center gap-2">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="text-xs h-8 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                    <option value="name-asc">{t('sortNameAsc')}</option>
                    <option value="name-desc">{t('sortNameDesc')}</option>
                  </select>
                  <div className="flex border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
                    <button onClick={() => setViewMode("grid")} className={`p-1.5 ${viewMode === "grid" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600" : "text-slate-400 hover:text-slate-600"}`}><LayoutGrid className="h-4 w-4" /></button>
                    <button onClick={() => setViewMode("list")} className={`p-1.5 ${viewMode === "list" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600" : "text-slate-400 hover:text-slate-600"}`}><List className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>

              {/* Type Info Panel or Products */}
              {typeInfo[activeFilter] ? (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 md:p-8">
                  <button onClick={() => selectFilter(["top-hung","sliding-window","casement","tilt-turn","hand-cranked"].includes(activeFilter) ? "windows" : "doors")} className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4">
                    <ArrowLeft className="h-3.5 w-3.5" /> {t('backToList')}
                  </button>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0"><Info className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>
                    <div><h2 className="text-xl font-bold text-slate-900 dark:text-white">{typeInfo[activeFilter].title}</h2>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">{typeInfo[activeFilter].desc}</p></div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t('infoFeatures')}</h3>
                      <ul className="space-y-2">{typeInfo[activeFilter].features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />{f}</li>
                      ))}</ul>
                    </div>
                    <div className="space-y-4">
                      <div><h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('infoApplications')}</h3>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{typeInfo[activeFilter].use}</p></div>
                      <div><h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('infoFrames')}</h3>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{typeInfo[activeFilter].frames}</p></div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                    <IntlLink href="/quote"><Button variant="primary" size="sm" className="gap-1">{t('getQuote')} <ArrowRight className="h-3.5 w-3.5" /></Button></IntlLink>
                    <IntlLink href="/appointments"><Button variant="outline" size="sm">{t('bookConsultation')}</Button></IntlLink>
                  </div>
                </div>
              ) : filteredProducts.length > 0 ? (
                viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredProducts.map((product) => (
                      <Card key={product.id} className="group h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                        <div className="relative aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#0a0f1a] dark:to-[#060b14] overflow-hidden">
                          <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 50vw" />
                          <div className="absolute top-3 left-3 flex gap-1.5">
                            <Badge variant="primary" className="text-[10px] uppercase tracking-wider">{product.category}</Badge>
                            <Badge variant="secondary" className="text-[10px]">{product.subcategory}</Badge>
                          </div>
                          {product.isFeatured && <Badge variant="primary" className="absolute top-3 right-3 text-[10px] gap-1"><Sparkles className="h-3 w-3" /> {t('featured')}</Badge>}
                        </div>
                        <CardContent className="p-5">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{product.name}</h3>
                          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{product.shortDescription}</p>
                          <ul className="mt-3 space-y-1">
                            {product.features.slice(0, 3).map((f, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />{f}</li>
                            ))}
                          </ul>
                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <IntlLink href={`/products/${product.id}`}><Button variant="outline" size="sm" className="gap-1 text-xs">{t('viewDetails')} <ArrowRight className="h-3 w-3" /></Button></IntlLink>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProducts.map((product) => (
                      <IntlLink key={product.id} href={`/products/${product.id}`}>
                        <div className="group flex gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all bg-white dark:bg-slate-900/50">
                          <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800"><Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="96px" /></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">{product.name}</h3>
                              <Badge variant="primary" className="text-[10px] shrink-0">{product.category}</Badge>
                              <Badge variant="secondary" className="text-[10px] shrink-0">{product.subcategory}</Badge>
                              {product.isFeatured && <Badge variant="primary" className="text-[10px] shrink-0 gap-0.5"><Sparkles className="h-2.5 w-2.5" />{t('featured')}</Badge>}
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">{product.shortDescription}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                              {product.features.slice(0, 3).map((f, i) => (
                                <span key={i} className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400"><Check className="h-3 w-3 text-emerald-500 shrink-0" />{f}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col items-end justify-between shrink-0">
                            <Button variant="outline" size="sm" className="gap-1 text-xs">{t('viewDetails')} <ArrowRight className="h-3 w-3" /></Button>
                          </div>
                        </div>
                      </IntlLink>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-20">
                  <div className="h-16 w-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4"><Search className="h-8 w-8 text-slate-400" /></div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('noProducts')}</h3>
                  <p className="mt-2 text-slate-500 dark:text-slate-400">{t('noProductsDesc')}</p>
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>{t('clearFilters')}</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Floating Action Button — always visible */}
      <div className="lg:hidden fixed bottom-6 right-4 z-40 flex flex-col items-end gap-2.5">
        {/* 3D Configurator mini-FAB */}
        <IntlLink href="/products/window-types">
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-700 text-white shadow-lg shadow-blue-500/30 ring-1 ring-white/20 hover:shadow-xl hover:scale-105 transition-all">
            <Box className="h-4 w-4" />
            <span className="text-xs font-semibold">3D</span>
          </div>
        </IntlLink>
        {/* Filter FAB */}
        <button onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 shadow-lg shadow-black/10 hover:shadow-xl hover:scale-105 transition-all">
          <SlidersHorizontal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold">{t('productTypes')}</span>
          {activeFilter !== "all" && (
            <span className="flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">1</span>
          )}
        </button>
      </div>

      {/* CTA */}
      <section className="py-12 pb-28 lg:pb-12 bg-slate-50 dark:bg-[#020617] border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('ctaTitle')}</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">{t('ctaDesc')}</p>
          <div className="mt-6 flex gap-3 justify-center flex-wrap">
            <IntlLink href="/quote"><Button variant="primary" size="lg" className="gap-2">{t('getQuote')} <ArrowRight className="h-4 w-4" /></Button></IntlLink>
            <IntlLink href="/contact"><Button variant="outline" size="lg">{t('contactUs')}</Button></IntlLink>
            <IntlLink href="/appointments"><Button variant="outline" size="lg">{t('bookConsultation')}</Button></IntlLink>
          </div>
        </div>
      </section>
    </div>
  )
}
