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
  Search,
  X,
  ArrowRight,
  LayoutGrid,
  List,
  Check,
  Sparkles,
} from "lucide-react"

type SortOption = "name-asc" | "name-desc"

export default function CatalogPage() {
  const t = useTranslations('CatalogPage')
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSubcategory, setActiveSubcategory] = useState<string | "all">("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<SortOption>("name-asc")

  const subcategories = useMemo(() => {
    const subs = [...new Set(products.map(p => p.subcategory))].sort()
    return [{ value: "all", label: t('allTypes') }, ...subs.map(s => ({ value: s, label: s }))]
  }, [t])

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSubcategory = activeSubcategory === "all" || product.subcategory === activeSubcategory
      const matchesSearch = searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesSubcategory && matchesSearch
    })
    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc": return a.name.localeCompare(b.name)
        case "name-desc": return b.name.localeCompare(a.name)
        default: return 0
      }
    })
    return result
  }, [activeSubcategory, searchQuery, sortBy])

  const clearFilters = () => {
    setSearchQuery("")
    setActiveSubcategory("all")
    setSortBy("name-asc")
  }

  return (
    <div>
      {/* Hero Header */}
      <section className="bg-slate-900 dark:bg-[#000000] py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Badge variant="primary" className="mb-3">{t('badge')}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-white">{t('title')}</h1>
          <p className="mt-3 text-slate-300 max-w-2xl">{t('description')}</p>
          <div className="mt-6 relative max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 text-base focus:bg-white/15"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Filters + Content */}
      <section className="py-8 dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Type Filters */}
          <div className="flex gap-2 flex-wrap mb-6">
            {subcategories.map((sub) => (
              <Button
                key={sub.value}
                variant={activeSubcategory === sub.value ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveSubcategory(sub.value)}
                className="text-xs"
              >
                {sub.label}
              </Button>
            ))}
          </div>

          {/* Toolbar: Results count + Sort + View Toggle */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {t('showing', { filtered: filteredProducts.length, total: products.length })}
            </span>
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-xs h-8 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
              >
                <option value="name-asc">{t('sortNameAsc')}</option>
                <option value="name-desc">{t('sortNameDesc')}</option>
              </select>
              <div className="flex border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 ${viewMode === "grid" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 ${viewMode === "list" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="group h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className="relative aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#0a0f1a] dark:to-[#060b14] overflow-hidden">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <Badge variant="primary" className="text-[10px] uppercase tracking-wider">{product.category}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{product.subcategory}</Badge>
                      </div>
                      {product.isFeatured && (
                        <Badge variant="primary" className="absolute top-3 right-3 text-[10px] gap-1">
                          <Sparkles className="h-3 w-3" /> {t('featured')}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {product.name}
                      </h3>
                      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                        {product.shortDescription}
                      </p>
                      <ul className="mt-3 space-y-1">
                        {product.features.slice(0, 3).map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                        <IntlLink href={`/products/${product.id}`}>
                          <Button variant="outline" size="sm" className="gap-1 text-xs">
                            {t('viewDetails')} <ArrowRight className="h-3 w-3" />
                          </Button>
                        </IntlLink>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <IntlLink key={product.id} href={`/products/${product.id}`}>
                    <div className="group flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all bg-white dark:bg-slate-900/50">
                      <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="80px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">{product.name}</h3>
                          <Badge variant="secondary" className="text-[10px] shrink-0">{product.subcategory}</Badge>
                          {product.isCustomizable && <Badge variant="outline" className="text-[10px] shrink-0">{t('customizable')}</Badge>}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{product.shortDescription}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 shrink-0 transition-colors" />
                    </div>
                  </IntlLink>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-20">
              <div className="h-16 w-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('noProducts')}</h3>
              <p className="mt-2 text-slate-500 dark:text-slate-400">{t('noProductsDesc')}</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>{t('clearFilters')}</Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-slate-50 dark:bg-[#020617] border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('ctaTitle')}</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">{t('ctaDesc')}</p>
          <div className="mt-6 flex gap-3 justify-center flex-wrap">
            <IntlLink href="/quote">
              <Button variant="primary" size="lg" className="gap-2">{t('getQuote')} <ArrowRight className="h-4 w-4" /></Button>
            </IntlLink>
            <IntlLink href="/contact">
              <Button variant="outline" size="lg">{t('contactUs')}</Button>
            </IntlLink>
            <IntlLink href="/appointments">
              <Button variant="outline" size="lg">{t('bookConsultation')}</Button>
            </IntlLink>
          </div>
        </div>
      </section>
    </div>
  )
}
