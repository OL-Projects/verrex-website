import Image from "next/image"
import { getTranslations } from 'next-intl/server'
import { Link as IntlLink } from '@/i18n/navigation'
import { Button } from "@/components/ui/button"
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
      {/* Hero with Custom Blueprint Background — Light/Dark */}
      <section className="relative bg-slate-50 dark:bg-[#000000] py-20 overflow-hidden">
        {/* Light mode SVG */}
        <div className="absolute inset-0 dark:hidden">
          <Image src="/images/hero/hero-services-light.svg" alt="" fill className="object-cover" sizes="100vw" priority />
        </div>
        {/* Dark mode SVG */}
        <div className="absolute inset-0 hidden dark:block">
          <Image src="/images/hero/hero-services.svg" alt="" fill className="object-cover" sizes="100vw" priority />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-transparent to-transparent dark:from-black/80 z-10" />
        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Badge variant="primary" className="mb-3">VERREX Services</Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl">{t('description')}</p>
          <div className="mt-6 flex gap-3 flex-wrap">
            <IntlLink href="/quote"><Button variant="primary" size="lg" className="gap-2">{t('getFreeQuote')} <ArrowRight className="h-4 w-4" /></Button></IntlLink>
            <IntlLink href="/appointments"><Button variant="outline" size="lg" className="text-slate-700 border-slate-300 hover:bg-slate-100 dark:text-white dark:border-white/30 dark:hover:bg-white/10">{t('bookConsultation')}</Button></IntlLink>
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

      {/* Services — Horizontal Numbered Rows */}
      <section className="py-16 dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{t('title')}</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">{t('description')}</p>
          </div>

          <div className="space-y-0">
            {services.map((service, idx) => {
              const IconComp = iconMap[service.icon] ?? Settings
              const num = String(idx + 1).padStart(2, '0')
              const isEven = idx % 2 === 0
              return (
                <div
                  key={service.id}
                  className={`group relative border-t border-slate-200 dark:border-slate-800 transition-all duration-300 hover:bg-slate-50 dark:hover:bg-[#0a0f1a] ${isEven ? '' : 'bg-slate-50/50 dark:bg-[#060b14]'}`}
                >
                  {/* Hover accent bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-blue-600 transition-colors duration-300 rounded-r" />

                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-8 py-8 px-4 lg:px-8">
                    {/* Number */}
                    <span className="text-4xl lg:text-5xl font-black text-blue-100 dark:text-blue-900/60 shrink-0 leading-none select-none group-hover:text-blue-200 dark:group-hover:text-blue-800/70 transition-colors">{num}</span>

                    {/* Icon */}
                    <div className="h-12 w-12 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform duration-300">
                      <IconComp className="h-6 w-6 text-white" />
                    </div>

                    {/* Title + Description */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{service.name}</h3>
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          <Clock className="h-3 w-3" />{service.estimatedDuration}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">{service.description}</p>
                    </div>

                    {/* Features as chips */}
                    <div className="flex flex-wrap gap-1.5 lg:max-w-xs shrink-0">
                      {service.features.slice(0, 3).map((feature) => (
                        <span key={feature} className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="h-3 w-3" />{feature}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="shrink-0">
                      <IntlLink href="/quote">
                        <Button variant="ghost" size="sm" className="gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20">{t('getStarted')} <ArrowRight className="h-3 w-3" /></Button>
                      </IntlLink>
                    </div>
                  </div>
                </div>
              )
            })}
            {/* Bottom border */}
            <div className="border-t border-slate-200 dark:border-slate-800" />
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

      {/* CTA with Pattern Background */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-900 dark:to-slate-900" />
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">{t('ctaTitle')}</h2>
          <p className="mt-3 text-lg text-blue-100">{t('ctaDesc')}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <IntlLink href="/quote"><Button variant="primary" size="lg" className="bg-white text-blue-700 hover:bg-blue-50 gap-2">{t('getFreeQuote')} <ArrowRight className="h-4 w-4" /></Button></IntlLink>
            <IntlLink href="/appointments"><Button variant="outline" size="lg" className="!bg-transparent !text-white !border-white/60 hover:!bg-white/10 gap-2"><Phone className="h-4 w-4" /> {t('bookConsultation')}</Button></IntlLink>
          </div>
        </div>
      </section>
    </div>
  )
}
