"use client"

import { useState } from "react"
import { useTranslations } from 'next-intl'
import { Link as IntlLink } from '@/i18n/navigation'
import Image from "next/image"
import { WindowTypeDiagram } from "@/components/ui/WindowTypeDiagram"
import { Button } from "@/components/ui/button"
import { CertificationsBar } from "@/components/ui/CertificationsBar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { services, testimonials, companyInfo } from "@/lib/data"
import { getLocalizedProducts } from "@/lib/data-i18n"
import { FadeIn, FadeInLeft, FadeInRight, StaggerContainer, StaggerItem, ScaleIn, RevealSection, AnimatedCounter, HoverCard } from "@/components/ui/motion"
import {
  ArrowRight,
  Star,
  Shield,
  Clock,
  Award,
  CheckCircle2,
  Phone,
  MessageSquare,
  Ruler,
  Wrench,
  Search,
  Sparkles,
  Settings,
  Home,
  Building2,
  Factory,
  FileText,
  Landmark,
  HardHat,
  BadgeCheck,
  ShieldCheck,
  Truck,
} from "lucide-react"

import { Loader2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const iconMap: Record<string, LucideIcon> = {
  MessageSquare, Ruler, Wrench, Search, Sparkles, Settings,
}

export default function HomePage() {
  const t = useTranslations('HomePage')
  const tData = useTranslations('ProductData')
  const products = getLocalizedProducts(tData)
  const { toast } = useToast()
  const [qqSending, setQqSending] = useState(false)

  const stats = [
    { value: t('stat1Value'), label: t('stat1Label') },
    { value: t('stat2Value'), label: t('stat2Label') },
    { value: t('stat3Value'), label: t('stat3Label') },
    { value: t('stat4Value'), label: t('stat4Label') },
  ]

  const certifications = [
    { name: t('cert1'), icon: BadgeCheck },
    { name: t('cert2'), icon: ShieldCheck },
    { name: t('cert3'), icon: Award },
    { name: t('cert4'), icon: Shield },
  ]

  const categoryCards = [
    { title: t('categoryResidential'), description: t('categoryResidentialDesc'), icon: Home, href: "/products?category=residential", image: "/images/hero/hero-residential.jpg" },
    { title: t('categoryCommercial'), description: t('categoryCommercialDesc'), icon: Landmark, href: "/products?category=commercial", image: "/images/hero/hero-commercial.jpg" },
    { title: t('categoryIndustrial'), description: t('categoryIndustrialDesc'), icon: Factory, href: "/products?category=industrial", image: "/images/hero/hero-industrial.jpg" },
  ]
  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 4)

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[85vh] flex flex-col justify-end">
        {/* Background Image */}
        <Image
          src="/images/hero/hero-main-new.jpg"
          alt="VEREX premium window and door systems"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        {/* Overlays for text readability - narrower left gradient to reveal more image */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-slate-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-36 flex-1 flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">
            {/* Left: Hero Content */}
            <div className="max-w-xl">
              <FadeIn>
                <Badge variant="primary" className="mb-4 text-sm px-4 py-1">
                  {t('badge')}
                </Badge>
              </FadeIn>
              <FadeIn delay={0.15}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
                  {t('heroTitle')}
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent">{t('heroTitleGradient')}</span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.3}>
                <p className="mt-5 text-base md:text-lg text-slate-300 leading-relaxed">
                  {t('heroDescription')}
                </p>
              </FadeIn>
              <FadeIn delay={0.45}>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <IntlLink href="/catalog">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white hover:scale-[1.03] active:scale-[0.97] transition-transform">
                      {t('viewCatalog')}
                    </Button>
                  </IntlLink>
                  <IntlLink href="/appointments">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white hover:scale-[1.03] active:scale-[0.97] transition-transform">
                      <Phone className="h-4 w-4" /> {t('bookConsultation')}
                    </Button>
                  </IntlLink>
                </div>
              </FadeIn>
              {/* Certification badges */}
              <FadeIn delay={0.6}>
                <div className="mt-8 flex flex-wrap items-center justify-start gap-8 brightness-0 invert opacity-70">
                  {/* ENERGY STAR — always light SVG */}
                  <Image src="/images/certifications/energy-star.svg" alt="ENERGY STAR" width={96} height={64} className="h-16 w-auto" />
                  {/* NFRC — always light SVG */}
                  <Image src="/images/certifications/nfrc.svg" alt="NFRC" width={96} height={64} className="h-16 w-auto" />
                  {/* CSA — light/dark switching */}
                  <Image src="/images/certifications/csa-light.svg" alt="CSA" width={96} height={64} className="h-16 w-auto block dark:hidden" />
                  <Image src="/images/certifications/csa-dark.svg" alt="CSA" width={96} height={64} className="h-16 w-auto hidden dark:block" />
                  {/* CE — light/dark switching */}
                  <Image src="/images/certifications/ce-light.svg" alt="CE" width={96} height={64} className="h-16 w-auto block dark:hidden" />
                  <Image src="/images/certifications/ce-dark.svg" alt="CE" width={96} height={64} className="h-16 w-auto hidden dark:block" />
                </div>
              </FadeIn>
            </div>

            {/* Right: Quick Quote Form */}
            <FadeIn delay={0.3}>
              <div className="hidden lg:block bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-6 shadow-2xl hero-quote-form">
                <h3 className="text-lg font-bold text-white mb-1">{t('quoteFormSubtitle')}</h3>
                <p className="text-xs text-white/60 mb-4">{t('quickQuoteDesc')}</p>
                <form className="space-y-3" onSubmit={async (e) => {
                  e.preventDefault()
                  setQqSending(true)
                  const fd = new FormData(e.currentTarget)
                  const products = ["Casement Windows", "Sliding Doors", "Double Hung", "Storefront", "Curtain Wall", "Entry Doors"].filter((_, i) => fd.getAll("products").includes(String(i)))
                  const checkedProducts: string[] = []
                  e.currentTarget.querySelectorAll<HTMLInputElement>('input[name="product"]').forEach((cb) => { if (cb.checked) checkedProducts.push(cb.value) })
                  try {
                    const res = await fetch("/api/send-email", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        type: "quick-quote",
                        name: fd.get("name"),
                        email: fd.get("email"),
                        phone: fd.get("phone"),
                        city: fd.get("city"),
                        postalCode: fd.get("postalCode"),
                        products: checkedProducts,
                        quantity: fd.get("quantity"),
                      }),
                    })
                    if (!res.ok) throw new Error("Failed")
                    toast({ title: "Quote Request Sent!", description: "We'll get back to you with an estimate.", variant: "success" })
                    e.currentTarget.reset()
                  } catch {
                    toast({ title: "Failed to Send", description: "Please try again or call us.", variant: "error" })
                  } finally {
                    setQqSending(false)
                  }
                }}>
                  <div className="grid grid-cols-2 gap-3">
                    <input name="name" type="text" placeholder={t('fullName')} required className="w-full px-3 py-2 bg-white/10 border border-white/15 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50" />
                    <input name="email" type="email" placeholder={t('email')} required className="w-full px-3 py-2 bg-white/10 border border-white/15 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input name="phone" type="tel" placeholder={t('phone')} className="w-full px-3 py-2 bg-white/10 border border-white/15 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50" />
                    <input name="city" type="text" placeholder={t('cityPlaceholder')} className="w-full px-3 py-2 bg-white/10 border border-white/15 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50" />
                  </div>
                  <input name="postalCode" type="text" placeholder={t('postalCodePlaceholder')} className="w-full px-3 py-2 bg-white/10 border border-white/15 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50" />
                  <div>
                    <p className="text-xs font-medium text-white/70 mb-2">{t('selectProductType')}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {["Casement Windows", "Sliding Doors", "Double Hung", "Storefront", "Curtain Wall", "Entry Doors"].map((product) => (
                        <label key={product} className="flex items-center gap-2 text-xs text-white/70 hover:text-white/90 cursor-pointer">
                          <input type="checkbox" name="product" value={product} className="rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-400/50 h-3.5 w-3.5" />
                          {product}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-white/70 mb-1 block">{t('quantityLabel')}</label>
                    <input name="quantity" type="number" placeholder={t('quantityPlaceholder')} min="1" className="w-full px-3 py-2 bg-white/10 border border-white/15 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50" />
                  </div>
                  <Button type="submit" variant="primary" size="lg" className="w-full hover:scale-[1.02] active:scale-[0.98] transition-transform" disabled={qqSending}>
                    {qqSending ? <><Loader2 className="h-4 w-4 animate-spin" /> {t('sending')}</> : <>{t('getEstimate')} <ArrowRight className="h-4 w-4" /></>}
                  </Button>
                </form>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative bg-white/10 backdrop-blur-sm border-t border-white/10 premium-shine">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <StaggerItem key={stat.label}>
                  <div className="text-center">
                    <AnimatedCounter value={stat.value} className="text-2xl md:text-3xl font-bold text-white" />
                    <div className="text-sm text-slate-300 mt-1">{stat.label}</div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <RevealSection className="py-20 bg-slate-50 dark:bg-[#020617]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              {t('sectorTitle')}
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              {t('sectorDesc')}
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categoryCards.map((cat) => (
              <StaggerItem key={cat.title}>
                <IntlLink href={cat.href}>
                  <HoverCard>
                    <div className="group relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer">
                      {/* Background Image */}
                      <Image
                        src={cat.image}
                        alt={cat.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      {/* Dark gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 group-hover:from-black/70 group-hover:via-black/30 transition-all duration-500" />
                      {/* Content */}
                      <div className="absolute inset-0 p-8 flex flex-col justify-end">
                        <div className="h-14 w-14 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 border border-white/20 group-hover:bg-white/25 transition-colors">
                          <cat.icon className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">{cat.title}</h3>
                        <p className="mt-2 text-white/70 text-sm leading-relaxed line-clamp-2">{cat.description}</p>
                        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-300 group-hover:text-blue-200 transition-colors">
                          {t('exploreProducts')}
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </HoverCard>
                </IntlLink>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </RevealSection>

      {/* Featured Products */}
      <RevealSection className="py-20 dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t('featuredProducts')}</h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">{t('featuredProductsDesc')}</p>
            </div>
            <IntlLink href="/products" className="hidden md:flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300">
              {t('viewAllProducts')} <ArrowRight className="h-4 w-4" />
            </IntlLink>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <StaggerItem key={product.id}>
                <IntlLink href={`/products/${product.id}`}>
                  <HoverCard>
                    <Card className="group h-full cursor-pointer hover:shadow-lg transition-all duration-300">
                      <div className="aspect-[4/3] rounded-t-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0a0f1a] dark:to-[#060b14] flex items-center justify-center p-6">
                        <WindowTypeDiagram id={product.diagramId} className="w-full h-full max-w-[200px] max-h-[150px] opacity-90 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <CardContent className="p-5">
                        <Badge variant="secondary" className="mb-2 text-xs">{product.category}</Badge>
                        <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{product.shortDescription}</p>
                        <div className="mt-3 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                          {t('viewDetails')} <ArrowRight className="h-3 w-3" />
                        </div>
                      </CardContent>
                    </Card>
                  </HoverCard>
                </IntlLink>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </RevealSection>

      {/* Services Section */}
      <RevealSection className="py-20 bg-slate-50 dark:bg-[#020617]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t('ourServices')}</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              {t('ourServicesDesc')}
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const IconComp = iconMap[service.icon] ?? Settings
              return (
                <StaggerItem key={service.id}>
                  <HoverCard>
                    <Card className="h-full">
                      <CardContent className="p-6">
                        <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center mb-4">
                          {IconComp && <IconComp className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{service.name}</h3>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{service.description}</p>
                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                          <Clock className="h-3.5 w-3.5" />{service.estimatedDuration}
                        </div>
                      </CardContent>
                    </Card>
                  </HoverCard>
                </StaggerItem>
              )
            })}
          </StaggerContainer>

          <FadeIn delay={0.3} className="mt-10 text-center">
            <IntlLink href="/services">
              <Button variant="primary" size="lg" className="hover:scale-[1.03] active:scale-[0.97] transition-transform">
                {t('viewAllServices')} <ArrowRight className="h-4 w-4" />
              </Button>
            </IntlLink>
          </FadeIn>
        </div>
      </RevealSection>

      {/* Why Choose VEREX — Day/Night Theme-Aware Background */}
      <section className="relative overflow-hidden min-h-[600px]">
        {/* Day Background (Light Mode) */}
        <div className="absolute inset-0 z-0 block dark:hidden">
          <Image
            src="/images/hero/Day.svg"
            alt="Modern home with VEREX windows — daytime"
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
            unoptimized
          />
        </div>
        {/* Night Background (Dark Mode) */}
        <div className="absolute inset-0 z-0 hidden dark:block">
          <Image
            src="/images/hero/Night.svg"
            alt="Modern home with VEREX windows — nighttime"
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
            unoptimized
          />
        </div>
        {/* Overlay — minimal, only on right side behind text */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-slate-950/55 via-slate-900/15 to-transparent dark:from-slate-950/60 dark:via-slate-950/20 dark:to-transparent" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/10 via-transparent to-transparent" />

        <div className="relative z-[2] px-8 sm:px-12 lg:px-20 py-24 md:py-32">
          <div className="max-w-lg">
            <FadeIn>
              <div className="flex items-center gap-4">
                <Image src="/images/vx-logo.svg" alt="VEREX logo" width={52} height={52} className="h-13 w-13 object-contain brightness-0 invert drop-shadow-lg" style={{ height: '52px', width: '52px' }} />
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg">
                  {t('whyChooseTitle')} <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent">{t('whyChooseBrand')}</span>?
                </h2>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="mt-5 text-lg text-white/80 leading-relaxed drop-shadow-md">
                {t('whyChooseDesc')}
              </p>
            </FadeIn>

            <div className="mt-10 space-y-6">
              {[
                { icon: Shield, title: t('whyLicensed'), desc: t('whyLicensedDesc') },
                { icon: BadgeCheck, title: t('whyCode'), desc: t('whyCodeDesc') },
                { icon: Truck, title: t('whyOnTime'), desc: t('whyOnTimeDesc') },
                { icon: FileText, title: t('whyPriceMatch'), desc: t('whyPriceMatchDesc') },
              ].map((item, i) => (
                <FadeIn key={item.title} delay={0.15 + i * 0.1}>
                  <div className="flex gap-4 items-start">
                    <div className="h-11 w-11 shrink-0 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/25 shadow-lg">
                      <item.icon className="h-5 w-5 text-blue-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg drop-shadow-md">{item.title}</h3>
                      <p className="text-sm text-white/70 mt-1 leading-relaxed drop-shadow-sm">{item.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={0.6}>
              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <IntlLink href="/quote">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto hover:scale-[1.03] active:scale-[0.97] transition-transform">
                    {t('getFreeQuote')} <ArrowRight className="h-4 w-4" />
                  </Button>
                </IntlLink>
                <IntlLink href="/about">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 text-white border-white/25 hover:bg-white/20 hover:text-white hover:scale-[1.03] active:scale-[0.97] transition-transform">
                    {t('learnMore')}
                  </Button>
                </IntlLink>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <RevealSection className="py-20 bg-slate-50 dark:bg-[#020617]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t('whatClientsSay')}</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">{t('whatClientsSayDesc')}</p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial) => (
              <StaggerItem key={testimonial.id}>
                <HoverCard>
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <p className="font-semibold text-sm text-slate-900 dark:text-white">{testimonial.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{testimonial.role}{testimonial.company && `, ${testimonial.company}`}</p>
                      </div>
                    </CardContent>
                  </Card>
                </HoverCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </RevealSection>

      {/* Certifications Section — Premium Showcase */}
      <section className="relative py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-[#0a0f1a] dark:via-[#060b16] dark:to-[#0a0f1a] overflow-hidden">
        {/* Subtle decorative background elements */}
        <div className="absolute top-0 left-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/30 mb-5">
              <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 tracking-wide uppercase">{t('industryCertified')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t('certsTitle')}
            </h2>
            <p className="mt-5 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {t('certsDesc')}
            </p>
            {/* Decorative line */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-400/60" />
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500/60" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue-400/60" />
            </div>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                name: "ENERGY STAR®",
                src: "/images/certifications/energy-star.svg",
                darkSrc: "/images/certifications/energy-star-dark.svg",
                desc: t('certEnergyStarDesc'),
                accent: "from-green-500 to-emerald-600",
              },
              {
                name: "NFRC",
                src: "/images/certifications/nfrc.svg",
                darkSrc: "/images/certifications/nfrc-dark.svg",
                desc: t('certNfrcDesc'),
                accent: "from-violet-500 to-purple-600",
              },
              {
                name: "CSA",
                src: "/images/certifications/csa-light.svg",
                darkSrc: "/images/certifications/csa-dark.svg",
                desc: t('certCsaDesc'),
                accent: "from-red-500 to-rose-600",
              },
              {
                name: "CE",
                src: "/images/certifications/ce-light.svg",
                darkSrc: "/images/certifications/ce-dark.svg",
                desc: t('certCeDesc'),
                accent: "from-blue-500 to-blue-700",
              },
            ].map((cert) => (
              <StaggerItem key={cert.name} className="h-full">
                <HoverCard className="h-full">
                  <div className="group relative h-full rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/50 shadow-lg shadow-slate-200/50 dark:shadow-black/20 hover:shadow-xl hover:shadow-slate-300/50 dark:hover:shadow-black/30 transition-all duration-500 overflow-hidden">
                    {/* Top accent gradient bar */}
                    <div className={`h-1 w-full bg-gradient-to-r ${cert.accent}`} />

                    <div className="p-7 flex flex-col items-center text-center h-full">
                      {/* Logo container with subtle background */}
                      <div className="w-full h-28 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/30 mb-6 group-hover:scale-[1.02] transition-transform duration-500">
                        {cert.darkSrc ? (
                          <>
                            <Image src={cert.src} alt={cert.name} width={140} height={96} className="h-20 w-auto max-w-[130px] object-contain block dark:hidden" unoptimized />
                            <Image src={cert.darkSrc} alt={cert.name} width={140} height={96} className="h-20 w-auto max-w-[130px] object-contain hidden dark:block" unoptimized />
                          </>
                        ) : (
                          <Image src={cert.src} alt={cert.name} width={140} height={96} className="h-20 w-auto max-w-[130px] object-contain" unoptimized />
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{cert.name}</h3>
                      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-grow">{cert.desc}</p>

                      {/* Verified badge */}
                      <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-800/30">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{t('verified')}</span>
                      </div>
                    </div>
                  </div>
                </HoverCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-slate-900 dark:bg-[#000000] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <FadeIn>
            <div className="flex justify-center mb-4">
              <Image src="/images/vx-logo.svg" alt="VEREX logo" width={48} height={48} className="h-12 w-12 object-contain brightness-0 invert" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {t('ctaTitle')}
            </h2>
            <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
              {t('ctaDesc')}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <IntlLink href="/quote">
                <Button variant="primary" size="xl" className="w-full sm:w-auto hover:scale-[1.03] active:scale-[0.97] transition-transform">
                  {t('getFreeQuote')} <ArrowRight className="h-5 w-5" />
                </Button>
              </IntlLink>
              <IntlLink href="/appointments">
                <Button variant="outline" size="xl" className="w-full sm:w-auto !border-white/30 !bg-transparent !text-white hover:!bg-white/10 hover:!text-white hover:scale-[1.03] active:scale-[0.97] transition-transform">
                  <Phone className="h-5 w-5" /> {t('contactUs')}
                </Button>
              </IntlLink>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}
