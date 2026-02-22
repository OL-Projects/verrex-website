import Image from "next/image"
import { getTranslations } from 'next-intl/server'
import { Link as IntlLink } from '@/i18n/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { services } from "@/lib/data"
import {
  ArrowRight, Clock, CheckCircle2, MessageSquare, Ruler, Wrench,
  Search, Sparkles, Settings, Phone, Award, Users, Timer, ShieldCheck,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Services" }

const iconMap: Record<string, LucideIcon> = { MessageSquare, Ruler, Wrench, Search, Sparkles, Settings }

const serviceImages: Record<string, string> = {
  "Professional Installation": "/images/hero/hero-factory.jpg",
  "On-Site Measurement": "/images/hero/hero-residential.jpg",
  "Window & Door Inspection": "/images/products/storefront-1.jpg",
  "Free Consultation": "/images/hero/hero-commercial.jpg",
  "Repair & Maintenance": "/images/products/casement-1.jpg",
  "Custom Design": "/images/products/curtainwall-1.jpg",
}

const process_steps = [
  { step: "01", title: "Initial Consultation", description: "Free consultation to understand your needs, budget, and timeline. Available in-person or via video call." },
  { step: "02", title: "On-Site Assessment", description: "Our certified technicians visit your location for precise measurements and site evaluation." },
  { step: "03", title: "Custom Quote", description: "Receive a detailed, itemized quote with product recommendations and installation timeline." },
  { step: "04", title: "Production & Delivery", description: "Your custom windows and doors are manufactured to exact specifications and delivered on schedule." },
  { step: "05", title: "Professional Installation", description: "Our expert team installs everything to the highest standards with minimal disruption." },
  { step: "06", title: "Quality Inspection", description: "Final walkthrough to ensure everything meets our quality standards and your expectations." },
]

export default async function ServicesPage() {
  const t = await getTranslations('ServicesPage')
  return (
    <div>
      {/* Hero with Background Image */}
      <section className="relative bg-slate-900 dark:bg-[#000000] py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 to-slate-900/70 dark:from-black/95 dark:to-black/70 z-10" />
        <div className="absolute inset-0">
          <Image src="/images/hero/hero-commercial.jpg" alt="" fill className="object-cover opacity-40" sizes="100vw" priority />
        </div>
        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Badge variant="primary" className="mb-3">VERREX Services</Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-white">{t('title')}</h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl">{t('description')}</p>
          <div className="mt-6 flex gap-3 flex-wrap">
            <IntlLink href="/quote"><Button variant="primary" size="lg" className="gap-2">{t('getFreeQuote')} <ArrowRight className="h-4 w-4" /></Button></IntlLink>
            <IntlLink href="/appointments"><Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/10">{t('bookConsultation')}</Button></IntlLink>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 bg-white dark:bg-[#0a0f1a] border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Award, value: "500+", label: "Projects Completed" },
              { icon: Users, value: "15+", label: "Years of Experience" },
              { icon: Timer, value: "98%", label: "On-Time Completion" },
              { icon: ShieldCheck, value: "100%", label: "Satisfaction Guarantee" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                  <stat.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid with Images */}
      <section className="py-16 dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{t('title')}</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">{t('description')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const IconComp = iconMap[service.icon] ?? Settings
              const bgImage = serviceImages[service.name] ?? "/images/hero/hero-commercial.jpg"
              return (
                <Card key={service.id} className="group h-full overflow-hidden hover:shadow-2xl transition-all duration-300 border-slate-200 dark:border-slate-800">
                  {/* Image with Icon Overlay */}
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image src={bgImage} alt={service.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <div className="h-10 w-10 bg-white/15 backdrop-blur-md rounded-lg flex items-center justify-center">
                        <IconComp className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white drop-shadow-lg">{service.name}</h3>
                    </div>
                    <Badge variant="secondary" className="absolute top-3 right-3 text-[10px] backdrop-blur-sm bg-white/70 dark:bg-black/50">
                      <Clock className="h-3 w-3 mr-1" />{service.estimatedDuration}
                    </Badge>
                  </div>

                  {/* Content */}
                  <CardContent className="p-5">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{service.description}</p>
                    <ul className="mt-4 space-y-2">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-5">
                      <IntlLink href="/quote">
                        <Button variant="primary" size="sm" className="w-full gap-1 text-xs">{t('getStarted')} <ArrowRight className="h-3 w-3" /></Button>
                      </IntlLink>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="py-16 bg-slate-50 dark:bg-[#020617] border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-3">How We Work</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Our Process</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">From first contact to project completion, here&apos;s how we deliver exceptional results.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {process_steps.map((item, idx) => (
              <div key={item.step} className="relative flex gap-4">
                <div className="flex flex-col items-center shrink-0">
                  <div className="h-12 w-12 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-600/25">
                    {item.step}
                  </div>
                  {idx < process_steps.length - 1 && (
                    <div className="w-px h-full bg-blue-200 dark:bg-blue-800 mt-2 hidden lg:block" />
                  )}
                </div>
                <div className="pt-1">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="py-16 dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{t('whyChoose')}</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">{t('whyChooseDesc')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: t('certifiedExperts'), desc: t('certifiedExpertsDesc'), icon: Award },
              { title: t('qualityGuarantee'), desc: t('qualityGuaranteeDesc'), icon: ShieldCheck },
              { title: t('timelyService'), desc: t('timelyServiceDesc'), icon: Timer },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-slate-50 dark:bg-[#0a0f1a] border border-slate-200 dark:border-slate-800">
                <div className="h-14 w-14 mx-auto rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-4">
                  <item.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA with Background */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-900 dark:to-slate-900" />
        <div className="absolute inset-0 opacity-10">
          <Image src="/images/hero/hero-factory.jpg" alt="" fill className="object-cover" sizes="100vw" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">{t('ctaTitle')}</h2>
          <p className="mt-3 text-lg text-blue-100">{t('ctaDesc')}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <IntlLink href="/quote"><Button variant="primary" size="lg" className="bg-white text-blue-700 hover:bg-blue-50 gap-2">{t('getFreeQuote')} <ArrowRight className="h-4 w-4" /></Button></IntlLink>
            <IntlLink href="/appointments"><Button variant="outline" size="lg" className="text-white border-white/40 hover:bg-white/10 gap-2"><Phone className="h-4 w-4" /> {t('bookConsultation')}</Button></IntlLink>
          </div>
        </div>
      </section>
    </div>
  )
}
