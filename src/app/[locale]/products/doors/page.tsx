"use client"

import { useState } from "react"
import Image from "next/image"
import { useTranslations } from 'next-intl'
import { Link as IntlLink } from '@/i18n/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { products } from "@/lib/data"
import {
  ArrowRight, Check, Sparkles, DoorOpen, Shield, Lock, Gauge, Accessibility,
  ArrowLeft, Info,
} from "lucide-react"

const doorProducts = products.filter(p =>
  p.subcategory === "Doors" || p.subcategory === "Entry Systems"
)

const doorTypes: Record<string, { title: string; desc: string; features: string[]; use: string; frames: string }> = {
  "sliding-door": { title: "Sliding Doors", desc: "Large-panel doors that glide horizontally on precision tracks. Available in 2, 3, and 4-panel configurations for seamless indoor-outdoor flow.", features: ["Seamless indoor-outdoor flow", "Heavy-duty roller systems", "Multi-point security locks", "Thermal break frames"], use: "Patios, Balconies, Terraces", frames: "Aluminum, PVC, Wood-clad" },
  "folding": { title: "Folding Doors", desc: "Multi-panel bi-fold systems that fold and stack to create wide open passages. Transform entire walls into open-air spaces.", features: ["Full wall opening", "Bi-fold panel stacking", "Flush threshold options", "Weather-rated seals"], use: "Restaurants, Patios, Showrooms", frames: "Aluminum, Aluminum-Wood" },
  "swing": { title: "Swing Doors", desc: "Traditional hinged doors that swing open on side-mounted hinges. Available as single or double-leaf, inward or outward opening.", features: ["Classic operation", "Single or double leaf", "ADA compliant options", "Panic hardware available"], use: "Entries, Commercial, Institutional", frames: "Aluminum, Steel, Glass" },
}

export default function DoorsPage() {
  const t = useTranslations('DoorsPage')
  const tc = useTranslations('CatalogPage')
  const [activeType, setActiveType] = useState<string>("all")

  const isActive = (id: string) => activeType === id
  const btnCls = (id: string) => `w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive(id) ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-slate-900 dark:bg-[#000000] py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 to-slate-900/70 dark:from-black/95 dark:to-black/70 z-10" />
        <div className="absolute inset-0">
          <Image src="/images/products/sliding-door-1.jpg" alt="" fill className="object-cover opacity-30" sizes="100vw" />
        </div>
        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Badge variant="primary" className="mb-3">{t('badge')}</Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-white">{t('title')}</h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl">{t('description')}</p>
          <div className="mt-6 flex gap-3 flex-wrap">
            <IntlLink href="/quote"><Button variant="primary" size="lg" className="gap-2">{t('getQuote')} <ArrowRight className="h-4 w-4" /></Button></IntlLink>
            <IntlLink href="/catalog"><Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/10">{t('viewFullCatalog')}</Button></IntlLink>
          </div>
        </div>
      </section>

      {/* Highlights Bar */}
      <section className="py-8 bg-white dark:bg-[#0a0f1a] border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Shield, label: t('hlSecurity'), value: t('hlSecurityVal') },
              { icon: Lock, label: t('hlLocking'), value: t('hlLockingVal') },
              { icon: Gauge, label: t('hlPerformance'), value: t('hlPerformanceVal') },
              { icon: Accessibility, label: t('hlAccessible'), value: t('hlAccessibleVal') },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sidebar + Content */}
      <section className="py-12 dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="w-56 shrink-0 hidden lg:block">
              <div className="sticky top-24">
                <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><DoorOpen className="h-3.5 w-3.5" /> {t('doorTypes')}</h3>
                <div className="space-y-0.5">
                  <button onClick={() => setActiveType("all")} className={btnCls("all")}>{t('allDoors')}</button>
                  <button onClick={() => setActiveType("sliding-door")} className={btnCls("sliding-door")}>{tc('slidingDoor')}</button>
                  <button onClick={() => setActiveType("folding")} className={btnCls("folding")}>{tc('folding')}</button>
                  <button onClick={() => setActiveType("swing")} className={btnCls("swing")}>{tc('swing')}</button>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('ourDoors')}</h2>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">{t('ourDoorsDesc')}</p>
                </div>
                <IntlLink href="/catalog"><Button variant="ghost" size="sm" className="gap-1 text-xs">{t('viewFullCatalog')} <ArrowRight className="h-3 w-3" /></Button></IntlLink>
              </div>

              {/* Mobile type filters */}
              <div className="lg:hidden flex gap-2 flex-wrap mb-6">
                {[{ id: "all", label: t('allDoors') }, { id: "sliding-door", label: tc('slidingDoor') }, { id: "folding", label: tc('folding') }, { id: "swing", label: tc('swing') }].map(f => (
                  <Button key={f.id} variant={activeType === f.id ? "secondary" : "ghost"} size="sm" onClick={() => setActiveType(f.id)} className="text-xs">{f.label}</Button>
                ))}
              </div>

              {/* Info Panel or Product Grid */}
              {doorTypes[activeType] ? (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 md:p-8">
                  <button onClick={() => setActiveType("all")} className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4">
                    <ArrowLeft className="h-3.5 w-3.5" /> {t('backToAll')}
                  </button>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0"><Info className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>
                    <div><h2 className="text-xl font-bold text-slate-900 dark:text-white">{doorTypes[activeType].title}</h2>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">{doorTypes[activeType].desc}</p></div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{tc('infoFeatures')}</h3>
                      <ul className="space-y-2">{doorTypes[activeType].features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />{f}</li>
                      ))}</ul>
                    </div>
                    <div className="space-y-4">
                      <div><h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{tc('infoApplications')}</h3>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{doorTypes[activeType].use}</p></div>
                      <div><h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{tc('infoFrames')}</h3>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{doorTypes[activeType].frames}</p></div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                    <IntlLink href="/quote"><Button variant="primary" size="sm" className="gap-1">{t('getQuote')} <ArrowRight className="h-3.5 w-3.5" /></Button></IntlLink>
                    <IntlLink href="/appointments"><Button variant="outline" size="sm">{t('bookConsult')}</Button></IntlLink>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8">
                  {doorProducts.map((product) => (
                    <Card key={product.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                      <div className="flex flex-col md:flex-row">
                        <div className="relative w-full md:w-80 aspect-[4/3] md:aspect-auto shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#0a0f1a] dark:to-[#060b14] overflow-hidden">
                          <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 320px" />
                          <div className="absolute top-3 left-3 flex gap-1.5">
                            <Badge variant="primary" className="text-[10px] uppercase tracking-wider">{product.category}</Badge>
                            <Badge variant="secondary" className="text-[10px]">{product.subcategory}</Badge>
                          </div>
                          {product.isFeatured && <Badge variant="primary" className="absolute top-3 right-3 text-[10px] gap-1"><Sparkles className="h-3 w-3" /> {t('featured')}</Badge>}
                        </div>
                        <CardContent className="p-6 flex-1">
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{product.name}</h3>
                          <p className="mt-2 text-slate-500 dark:text-slate-400">{product.shortDescription}</p>
                          <div className="mt-4 flex flex-col lg:flex-row gap-6">
                            <div className="flex-1">
                              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t('keyFeatures')}</h4>
                              <ul className="space-y-1.5">
                                {product.features.slice(0, 4).map((f, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />{f}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t('specifications')}</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries(product.specifications).slice(0, 4).map(([key, val]) => (
                                  <div key={key} className="text-xs"><span className="text-slate-400">{key}</span><p className="font-medium text-slate-700 dark:text-slate-300">{val}</p></div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="mt-5 flex gap-3">
                            <IntlLink href={`/products/${product.id}`}><Button variant="primary" size="sm" className="gap-1">{t('viewDetails')} <ArrowRight className="h-3.5 w-3.5" /></Button></IntlLink>
                            <IntlLink href="/quote"><Button variant="outline" size="sm">{t('getQuote')}</Button></IntlLink>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-slate-50 dark:bg-[#020617] border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <DoorOpen className="h-10 w-10 mx-auto text-blue-600 dark:text-blue-400 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('ctaTitle')}</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">{t('ctaDesc')}</p>
          <div className="mt-6 flex gap-3 justify-center flex-wrap">
            <IntlLink href="/quote"><Button variant="primary" size="lg" className="gap-2">{t('getQuote')} <ArrowRight className="h-4 w-4" /></Button></IntlLink>
            <IntlLink href="/appointments"><Button variant="outline" size="lg">{t('bookConsultation')}</Button></IntlLink>
          </div>
        </div>
      </section>
    </div>
  )
}
