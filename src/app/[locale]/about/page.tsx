import Image from "next/image"
import { getTranslations } from 'next-intl/server'
import { Link as IntlLink } from '@/i18n/navigation'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { partners } from "@/lib/data"
import {
  Shield, Award, Users, Target, ArrowRight, CheckCircle2,
  Handshake, Globe, Phone, Rocket,
} from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "About Us" }

const valueColors = [
  { bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-l-blue-500", icon: "text-blue-600 dark:text-blue-400" },
  { bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-l-emerald-500", icon: "text-emerald-600 dark:text-emerald-400" },
  { bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-l-amber-500", icon: "text-amber-600 dark:text-amber-400" },
  { bg: "bg-violet-50 dark:bg-violet-900/20", border: "border-l-violet-500", icon: "text-violet-600 dark:text-violet-400" },
]

export default async function AboutPage() {
  const t = await getTranslations('AboutPage')
  return (
    <div>
      {/* Hero with Custom SVG — Light/Dark */}
      <section className="relative bg-slate-50 dark:bg-[#000000] py-24 overflow-hidden">
        {/* Light mode SVG */}
        <div className="absolute inset-0 dark:hidden">
          <Image src="/images/hero/hero-about-light.svg" alt="" fill className="object-cover" sizes="100vw" priority />
        </div>
        {/* Dark mode SVG */}
        <div className="absolute inset-0 hidden dark:block">
          <Image src="/images/hero/hero-about-dark.svg" alt="" fill className="object-cover" sizes="100vw" priority />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/50 via-transparent to-transparent dark:from-black/70 z-10" />
        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Badge variant="primary" className="mb-4">About VERREX</Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white max-w-3xl">{t('title')}</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl">{t('description')}</p>
          <div className="mt-8 flex items-center gap-6 flex-wrap">
            <IntlLink href="/contact"><Button variant="primary" size="lg" className="gap-2">{t('contactUsBtn')} <ArrowRight className="h-4 w-4" /></Button></IntlLink>
            <IntlLink href="/quote"><Button variant="outline" size="lg" className="text-slate-700 border-slate-300 hover:bg-slate-100 dark:text-white dark:border-white/30 dark:hover:bg-white/10">{t('getQuoteBtn')}</Button></IntlLink>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 bg-white dark:bg-[#0a0f1a] border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Projects Completed" },
              { value: "50+", label: "Expert Team Members" },
              { value: "2M+", label: "Sq Ft Installed" },
              { value: "98%", label: "On-Time Delivery" },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-3xl md:text-4xl font-black text-blue-600 dark:text-blue-400">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission — Split Panel */}
      <section className="py-16 dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Pull quote */}
              <div className="border-l-4 border-blue-600 pl-6 mb-8">
                <p className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-white italic leading-relaxed">
                  &ldquo;Excellence in every pane &mdash; delivering quality fenestration solutions you can trust.&rdquo;
                </p>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{t('missionTitle')}</h2>
              <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">{t('missionText1')}</p>
              <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed">{t('missionText2')}</p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: Shield, label: t('licensedInsured') },
                  { icon: Award, label: t('qualityCertified') },
                  { icon: Users, label: t('expertTeam') },
                  { icon: Target, label: t('clientFocused') },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Photo */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <Image src="/images/hero/hero-factory.jpg" alt="VERREX facility" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-sm font-bold text-slate-900 dark:text-white">VERREX HQ</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Toronto, Ontario</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values — Color Accented */}
      <section className="py-16 bg-slate-50 dark:bg-[#020617]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3">What We Stand For</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{t('coreValues')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: t('qualityTitle'), desc: t('qualityDesc'), icon: Award },
              { title: t('integrityTitle'), desc: t('integrityDesc'), icon: Shield },
              { title: t('innovationTitle'), desc: t('innovationDesc'), icon: Rocket },
              { title: t('serviceTitle'), desc: t('serviceDesc'), icon: CheckCircle2 },
            ].map((value, i) => (
              <div key={value.title} className={`flex gap-4 p-6 rounded-xl border-l-4 ${valueColors[i].border} ${valueColors[i].bg} border border-slate-200 dark:border-slate-800`}>
                <div className="shrink-0">
                  <value.icon className={`h-7 w-7 mt-0.5 ${valueColors[i].icon}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{value.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{value.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section id="partners" className="py-16 dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{t('partnersTitle')}</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">{t('partnersDesc')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {partners.map((partner) => (
              <div key={partner.id} className="flex items-start gap-4 p-5 rounded-xl bg-slate-50 dark:bg-[#0a0f1a] border border-slate-200 dark:border-slate-800">
                <div className="h-11 w-11 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                  {partner.type === "manufacturer" ? <Globe className="h-5 w-5 text-blue-500" /> : <Handshake className="h-5 w-5 text-emerald-500" />}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{partner.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{partner.type}</p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{partner.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA with Background */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-900 dark:to-slate-900" />
        <div className="absolute inset-0 opacity-10">
          <Image src="/images/hero/hero-about.jpg" alt="" fill className="object-cover" sizes="100vw" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">{t('ctaTitle')}</h2>
          <p className="mt-3 text-lg text-blue-100">{t('ctaDesc')}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <IntlLink href="/contact"><Button variant="primary" size="lg" className="bg-white text-blue-700 hover:bg-blue-50 gap-2">{t('contactUsBtn')} <ArrowRight className="h-4 w-4" /></Button></IntlLink>
            <IntlLink href="/quote"><Button variant="outline" size="lg" className="text-white border-white/40 hover:bg-white/10 gap-2"><Phone className="h-4 w-4" /> {t('getQuoteBtn')}</Button></IntlLink>
          </div>
        </div>
      </section>
    </div>
  )
}
