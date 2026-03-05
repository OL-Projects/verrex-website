"use client"

import { useTranslations } from 'next-intl'
import { Link as IntlLink } from '@/i18n/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WindowTypeDiagram } from "@/components/ui/WindowTypeDiagram"
import { products } from "@/lib/data"
import { ArrowRight, CheckCircle2 } from "lucide-react"

export default function WindowsPage() {
  const t = useTranslations('WindowsPage')

  const windowProducts = products.filter((p) => p.subcategory === "Windows")

  return (
    <div>
      {/* Page Header */}
      <section className="bg-slate-50 dark:bg-[#000000] py-16 border-b border-slate-200 dark:border-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
            {t('description')}
          </p>
        </div>
      </section>

      {/* Window Types */}
      <section className="py-16 dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {windowProducts.map((product, index) => (
              <div
                key={product.id}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* SVG Diagram */}
                <div className={`${index % 2 === 1 ? "lg:order-2" : ""}`}>
                  <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0a0f1a] dark:to-[#060b14] rounded-2xl flex items-center justify-center p-12">
                    <WindowTypeDiagram id={product.diagramId} className="w-full h-full max-w-[240px] max-h-[180px]" />
                  </div>
                </div>

                {/* Info */}
                <div className={`${index % 2 === 1 ? "lg:order-1" : ""}`}>
                  <Badge variant="secondary" className="mb-3">{product.subcategory}</Badge>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                    {product.name}
                  </h2>
                  <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Features */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Specs */}
                  <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="text-slate-500 dark:text-slate-400">{key}: </span>
                        <span className="font-medium text-slate-900 dark:text-slate-200">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <IntlLink href={`/products/${product.id}`}>
                      <Button variant="primary" className="gap-2">
                        {t('viewDetails') || 'View Details'} <ArrowRight className="h-4 w-4" />
                      </Button>
                    </IntlLink>
                    <IntlLink href={`/quote?product=${product.id}`}>
                      <Button variant="outline">{t('getQuote') || 'Get Quote'}</Button>
                    </IntlLink>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
