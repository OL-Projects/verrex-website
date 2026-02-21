"use client"

import { useState, useMemo } from "react"
import { useTranslations } from 'next-intl'
import { Link as IntlLink } from '@/i18n/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { products } from "@/lib/data"
import { formatCurrency } from "@/lib/utils"
import { ProductCategory } from "@/types"
import {
  Search,
  SlidersHorizontal,
  Home,
  Building2,
  Factory,
  ArrowRight,
  X,
} from "lucide-react"

export default function ProductsPage() {
  const t = useTranslations('ProductsPage')

  const categories: { value: ProductCategory | "all"; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: "all", label: t('allProducts'), icon: SlidersHorizontal },
    { value: "residential", label: t('residential'), icon: Home },
    { value: "commercial", label: t('commercial'), icon: Building2 },
    { value: "industrial", label: t('industrial'), icon: Factory },
  ]
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "all" || product.category === activeCategory
      const matchesSearch =
        searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, searchQuery])

  return (
    <div>
      {/* Page Header */}
      <section className="bg-slate-900 dark:bg-[#000000] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl">
            {t('description')}
          </p>
        </div>
      </section>

      {/* Filters & Products */}
      <section className="py-12 dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={activeCategory === cat.value ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat.value)}
                  className="gap-2"
                >
                  <cat.icon className="h-4 w-4" />
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="mb-6 text-sm text-slate-500 dark:text-slate-400">
            {t('showing', { filtered: filteredProducts.length, total: products.length })}
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <IntlLink key={product.id} href={`/products/${product.id}`}>
                  <Card className="group h-full cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#0a0f1a] dark:to-[#060b14] rounded-t-xl flex items-center justify-center relative overflow-hidden">
                      {product.isFeatured && (
                        <Badge variant="primary" className="absolute top-3 right-3 text-xs">
                          {t('featured')}
                        </Badge>
                      )}
                      <div className="text-center p-4">
                        <div className="h-16 w-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                          <span className="text-2xl">🪟</span>
                        </div>
                        <span className="text-xs text-slate-500">{t('productImage')}</span>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {product.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {product.subcategory}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                        {product.shortDescription}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-600">
                          {formatCurrency(product.priceRange.min)} - {formatCurrency(product.priceRange.max)}
                        </span>
                        {product.isCustomizable && (
                          <Badge variant="success" className="text-[10px]">
                          {t('customizable')}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-3 flex items-center gap-1 text-xs text-blue-600 font-medium">
                        {t('viewDetails')} <ArrowRight className="h-3 w-3" />
                      </div>
                    </CardContent>
                  </Card>
                </IntlLink>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="h-16 w-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{t('noProducts')}</h3>
              <p className="mt-2 text-slate-500">{t('noProductsDesc')}</p>
              <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(""); setActiveCategory("all") }}>
                {t('clearFilters')}
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
