import { getTranslations } from 'next-intl/server'
import { Link as IntlLink } from '@/i18n/navigation'
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { products } from "@/lib/data"
import { formatCurrency } from "@/lib/utils"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Phone,
  FileText,
  Calendar,
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
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3)

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-slate-50 dark:bg-[#020617] border-b border-slate-200 dark:border-[#1e293b]/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <IntlLink href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</IntlLink>
            <span>/</span>
            <IntlLink href="/products" className="hover:text-blue-600 dark:hover:text-blue-400">Products</IntlLink>
            <span>/</span>
            <span className="text-slate-900 dark:text-white">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <section className="py-12 dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div>
              <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#0a0f1a] dark:to-[#060b14] rounded-2xl flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="h-32 w-32 mx-auto bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mb-4">
                    <span className="text-6xl">🪟</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400">Product Image</span>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">{product.category}</Badge>
                <Badge variant="outline">{product.subcategory}</Badge>
                {product.isCustomizable && (
                  <Badge variant="success">Customizable</Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                {product.name}
              </h1>

              <div className="mt-4 text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(product.priceRange.min)} - {formatCurrency(product.priceRange.max)}
              </div>

              <p className="mt-6 text-slate-600 dark:text-slate-400 leading-relaxed">
                {product.description}
              </p>

              <Separator className="my-6" />

              {/* Features */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Key Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Specifications */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Specifications</h3>
                <div className="space-y-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-sm">
                      <span className="text-slate-500 dark:text-slate-400">{key}</span>
                      <span className="font-medium text-slate-900 dark:text-slate-200">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <IntlLink href={`/quote?product=${product.id}`} className="flex-1">
                  <Button variant="primary" size="lg" className="w-full">
                    <FileText className="h-4 w-4" />
                    Request Quote
                  </Button>
                </IntlLink>
                <IntlLink href="/appointments" className="flex-1">
                  <Button variant="outline" size="lg" className="w-full">
                    <Calendar className="h-4 w-4" />
                    Book Consultation
                  </Button>
                </IntlLink>
              </div>

              <div className="mt-4 text-center">
                <a href="tel:(416) 555-0199" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                  <Phone className="h-4 w-4" />
                  Or call us at (416) 555-0199
                </a>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-20">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProducts.map((rp) => (
                  <IntlLink key={rp.id} href={`/products/${rp.id}`}>
                    <Card className="group h-full cursor-pointer hover:shadow-lg transition-all">
                      <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#0a0f1a] dark:to-[#060b14] rounded-t-xl flex items-center justify-center">
                        <span className="text-3xl">🪟</span>
                      </div>
                      <CardContent className="p-5">
                        <Badge variant="secondary" className="mb-2 text-xs">{rp.category}</Badge>
                        <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">{rp.name}</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{rp.shortDescription}</p>
                        <div className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                          From {formatCurrency(rp.priceRange.min)}
                        </div>
                      </CardContent>
                    </Card>
                  </IntlLink>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
