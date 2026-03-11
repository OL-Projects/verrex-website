import Image from "next/image"
import { getTranslations } from 'next-intl/server'
import { Link as IntlLink } from '@/i18n/navigation'
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { products } from "@/lib/data"
import { WindowTypeDiagram } from "@/components/ui/WindowTypeDiagram"
import {
  ArrowRight,
  CheckCircle2,
  Phone,
  FileText,
  Calendar,
  Shield,
  Zap,
  ShieldCheck,
  Award,
  BadgeCheck,
  Users,
  Star,
  Truck,
  Scale,
  BookOpen,
  Building2,
  Stamp,
} from "lucide-react"

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }))
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const t = await getTranslations('ProductDetail')
  const product = products.find((p) => p.id === id)

  if (!product) {
    notFound()
  }

  const relatedProducts = products
    .filter((p) => p.subcategory === product.subcategory && p.id !== product.id)
    .slice(0, 3)

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-slate-50 dark:bg-[#020617] border-b border-slate-200 dark:border-[#1e293b]/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <IntlLink href="/" className="hover:text-blue-600 dark:hover:text-blue-400">{t("home")}</IntlLink>
            <span>/</span>
            <IntlLink href="/products" className="hover:text-blue-600 dark:hover:text-blue-400">{t("products")}</IntlLink>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Product Section */}
      <section className="py-16 dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Product Diagram */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#0a0f1a] dark:via-[#080e1a] dark:to-[#060b14] rounded-3xl flex items-center justify-center p-10 shadow-lg border border-slate-200/50 dark:border-slate-800/50">
                <WindowTypeDiagram id={product.diagramId} className="w-full h-full max-w-[380px] max-h-[380px]" />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                <div className="px-4 py-1.5 bg-white dark:bg-slate-800 rounded-full shadow-md border border-slate-200 dark:border-slate-700 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" /> {t("energyStarBadge")}
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="text-xs">{product.subcategory}</Badge>
                {product.isCustomizable && (
                  <Badge variant="success" className="text-xs">{t("customizable")}</Badge>
                )}
                <Badge variant="outline" className="text-xs border-amber-300 text-amber-600 dark:text-amber-400">{t("premiumBadge")}</Badge>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                {product.name}
              </h1>

              <p className="mt-5 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                {product.description}
              </p>

              {/* Trust indicators */}
              <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-blue-500" /> {t("trustedClients")}</span>
                <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-amber-500" /> {t("ratingLabel")}</span>
                <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-emerald-500" /> {t("freeDelivery")}</span>
              </div>

              {/* Key Features */}
              <div className="mt-8">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">{t("keyFeatures")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <IntlLink href={`/quote?product=${product.id}`} className="flex-1">
                  <Button variant="primary" size="lg" className="w-full text-base gap-2">
                    <FileText className="h-5 w-5" />
                    {t("getFreeQuote")}
                  </Button>
                </IntlLink>
                <IntlLink href="/appointments" className="flex-1">
                  <Button variant="outline" size="lg" className="w-full text-base gap-2">
                    <Calendar className="h-5 w-5" />
                    {t("bookConsultation")}
                  </Button>
                </IntlLink>
              </div>

              <div className="mt-4 text-center">
                <a href="tel:+15149924080" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <Phone className="h-4 w-4" />
                  {t("callUs")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications + Certifications */}
      <section className="py-16 dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Specifications */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t("specifications")}</h2>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {Object.entries(product.specifications).map(([key, value], i) => (
                  <div key={key} className={`flex items-center justify-between px-6 py-4 text-sm ${i % 2 === 0 ? "bg-white dark:bg-slate-900/50" : "bg-slate-50 dark:bg-slate-800/30"}`}>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{key}</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t("certifiedQuality")}</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "ENERGY STAR®", src: "/images/certifications/energy-star.svg", darkSrc: "/images/certifications/energy-star-dark.svg", descKey: "certEnergyDesc" as const },
                  { name: "NFRC", src: "/images/certifications/nfrc.svg", darkSrc: "/images/certifications/nfrc-dark.svg", descKey: "certNfrcDesc" as const },
                  { name: "CSA", src: "/images/certifications/csa-light.svg", darkSrc: "/images/certifications/csa-dark.svg", descKey: "certCsaDesc" as const },
                  { name: "CE", src: "/images/certifications/ce-light.svg", darkSrc: "/images/certifications/ce-dark.svg", descKey: "certCeDesc" as const },
                ].map((cert) => (
                  <div key={cert.name} className="p-5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-16 flex items-center justify-center mb-3">
                      <Image src={cert.src} alt={cert.name} width={100} height={60} className="h-12 w-auto object-contain block dark:hidden" unoptimized />
                      <Image src={cert.darkSrc} alt={cert.name} width={100} height={60} className="h-12 w-auto object-contain hidden dark:block" unoptimized />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{cert.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{t(cert.descKey)}</p>
                  </div>
                ))}
              </div>

              {/* Warranty */}
              <div className="mt-6 p-5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-200/50 dark:border-blue-800/30">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{t("warrantyTitle")}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t("warrantyDesc")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Standards & Compliance */}
      <section className="py-16 bg-slate-50 dark:bg-[#020617]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300/50 dark:border-slate-700/50 mb-4">
              <Scale className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t("regulatoryCompliance")}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t("industryStandards")}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">{t("industryStandardsDesc")}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-200 dark:divide-slate-800">
            {[
              { icon: BookOpen, standardKey: "nbcStandard" as const, detailKey: "nbcDetail" as const },
              { icon: BadgeCheck, standardKey: "csaNafsStandard" as const, detailKey: "csaNafsDetail" as const },
              { icon: Shield, standardKey: "energyStarStandard" as const, detailKey: "energyStarDetail" as const },
              { icon: Stamp, standardKey: "nfrcStandard" as const, detailKey: "nfrcDetail" as const },
              { icon: Building2, standardKey: "rbqStandard" as const, detailKey: "rbqDetail" as const },
              { icon: ShieldCheck, standardKey: "isoStandard" as const, detailKey: "isoDetail" as const },
            ].map((item) => (
              <div key={item.standardKey} className="flex items-start gap-5 px-6 py-5 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  <item.icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t(item.standardKey)}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t(item.detailKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose This Product */}
      <section className="py-16 dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">{t("whyChooseThe")} {product.name}?</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12">{t("whyChooseDesc")}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, titleKey: "whyEnergy" as const, descKey: "whyEnergyDesc" as const },
              { icon: Shield, titleKey: "whyDurability" as const, descKey: "whyDurabilityDesc" as const },
              { icon: Award, titleKey: "whyInstall" as const, descKey: "whyInstallDesc" as const },
            ].map((item) => (
              <div key={item.titleKey} className="p-8 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="h-14 w-14 mx-auto bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-5">
                  <item.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t(item.titleKey)}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t(item.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 dark:bg-[#030712]">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{t("readyTitle")}</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">{t("readyDesc", { product: product.name })}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <IntlLink href={`/quote?product=${product.id}`}>
              <Button variant="primary" size="lg" className="gap-2 text-base px-8">
                <FileText className="h-5 w-5" /> {t("requestFreeQuote")} <ArrowRight className="h-4 w-4" />
              </Button>
            </IntlLink>
            <IntlLink href="/appointments">
              <Button variant="outline" size="lg" className="gap-2">
                <Calendar className="h-5 w-5" /> {t("scheduleVisit")}
              </Button>
            </IntlLink>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-16 bg-slate-50 dark:bg-[#020617]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">{t("relatedProducts")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((rp) => (
                <IntlLink key={rp.id} href={`/products/${rp.id}`}>
                  <Card className="group h-full cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0a0f1a] dark:to-[#060b14] rounded-t-xl flex items-center justify-center p-6">
                      <WindowTypeDiagram id={rp.diagramId} className="w-full h-full max-w-[180px] max-h-[130px]" />
                    </div>
                    <CardContent className="p-5">
                      <Badge variant="secondary" className="mb-2 text-xs">{rp.subcategory}</Badge>
                      <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{rp.name}</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{rp.shortDescription}</p>
                      <div className="mt-3 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                        {t("viewDetails")} <ArrowRight className="h-3 w-3" />
                      </div>
                    </CardContent>
                  </Card>
                </IntlLink>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
