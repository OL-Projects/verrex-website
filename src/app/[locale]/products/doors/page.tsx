"use client"

import Image from "next/image"
import { useTranslations } from 'next-intl'
import { Link as IntlLink } from '@/i18n/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight, Check, DoorOpen, Shield, Lock, Gauge, Accessibility,
} from "lucide-react"

export default function DoorsPage() {
  const t = useTranslations('DoorsPage')
  const tc = useTranslations('CatalogPage')

  const doorTypes = [
    {
      name: tc('slidingDoor'),
      image: "/images/products/sliding-door-1.jpg",
      desc: t('typeSlidingDesc'),
      features: [t('typeSlidingF1'), t('typeSlidingF2'), t('typeSlidingF3'), t('typeSlidingF4')],
      specs: { [t('specFrame')]: t('specAlPvcWood'), [t('specGlass')]: t('specDoubleTriple'), [t('specPanels')]: "2, 3, 4", [t('specThreshold')]: t('specFlush') },
    },
    {
      name: tc('folding'),
      image: "/images/products/sliding-door-2.jpg",
      desc: t('typeFoldingDesc'),
      features: [t('typeFoldingF1'), t('typeFoldingF2'), t('typeFoldingF3'), t('typeFoldingF4')],
      specs: { [t('specFrame')]: t('specAlWoodAl'), [t('specGlass')]: t('specDoubleTriple'), [t('specPanels')]: "3–7", [t('specOpening')]: t('specFullWall') },
    },
    {
      name: tc('swing'),
      image: "/images/products/commercial-entry-1.jpg",
      desc: t('typeSwingDesc'),
      features: [t('typeSwingF1'), t('typeSwingF2'), t('typeSwingF3'), t('typeSwingF4')],
      specs: { [t('specFrame')]: t('specAlSteelGlass'), [t('specLeaf')]: t('specSingleDouble'), [t('specCompliance')]: "ADA", [t('specHardware')]: t('specPanicAvail') },
    },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-slate-50 dark:bg-[#000000] py-16 overflow-hidden border-b border-slate-200 dark:border-transparent">
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 to-white/70 dark:from-black/95 dark:to-black/70 z-10" />
        <div className="absolute inset-0">
          <Image src="/images/products/sliding-door-1.jpg" alt="" fill className="object-cover opacity-15 dark:opacity-30" sizes="100vw" />
        </div>
        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Badge variant="primary" className="mb-3">{t('badge')}</Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl">{t('description')}</p>
          <div className="mt-6 flex gap-3 flex-wrap">
            <IntlLink href="/quote"><Button variant="primary" size="lg" className="gap-2">{t('getQuote')} <ArrowRight className="h-4 w-4" /></Button></IntlLink>
            <IntlLink href="/catalog"><Button variant="outline" size="lg" className="text-slate-700 border-slate-300 hover:bg-slate-100 dark:text-white dark:border-white/30 dark:hover:bg-white/10">{t('viewFullCatalog')}</Button></IntlLink>
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

      {/* Door Types Showcase */}
      <section className="py-14 dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('ourDoors')}</h2>
              <p className="mt-1 text-slate-500 dark:text-slate-400">{t('ourDoorsDesc')}</p>
            </div>
            <IntlLink href="/catalog"><Button variant="ghost" size="sm" className="gap-1 text-xs">{t('viewFullCatalog')} <ArrowRight className="h-3 w-3" /></Button></IntlLink>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {doorTypes.map((dt, idx) => (
              <Card key={idx} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-slate-200 dark:border-slate-800">
                {/* Image */}
                <div className="relative aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#0a0f1a] dark:to-[#060b14] overflow-hidden">
                  <Image src={dt.image} alt={dt.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>

                {/* Content */}
                <CardContent className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dt.name}</h3>
                  <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{dt.desc}</p>

                  {/* Features */}
                  <ul className="mt-3 space-y-1.5">
                    {dt.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />{f}
                      </li>
                    ))}
                  </ul>

                  {/* Spec Chips */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {Object.entries(dt.specs).map(([key, val]) => (
                      <span key={key} className="inline-flex text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        <span className="font-medium text-slate-800 dark:text-slate-200 mr-1">{key}:</span>{val}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <IntlLink href="/quote"><Button variant="primary" size="sm" className="gap-1 text-xs">{t('getQuote')} <ArrowRight className="h-3 w-3" /></Button></IntlLink>
                    <IntlLink href="/catalog"><Button variant="outline" size="sm" className="text-xs">{t('viewInCatalog')}</Button></IntlLink>
                  </div>
                </CardContent>
              </Card>
            ))}
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
