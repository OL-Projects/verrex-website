"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { useTranslations } from 'next-intl'
import { Link as IntlLink } from '@/i18n/navigation'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  ArrowRight,
  X,
  ZoomIn,
  ZoomOut,
  Download,
  Grid3X3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react"

// Generate catalog pages array (98 pages)
const catalogPages = Array.from({ length: 98 }, (_, i) => ({
  page: i + 1,
  src: `/images/catalog/catalog-p${i + 1}-img1.jpeg`,
}))

export default function CatalogPage() {
  const t = useTranslations('CatalogPage')
  const [viewMode, setViewMode] = useState<"grid" | "reader">("grid")
  const [currentPage, setCurrentPage] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [lightbox, setLightbox] = useState<number | null>(null)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(0, Math.min(catalogPages.length - 1, page)))
    setZoom(1)
  }

  return (
    <div>
      {/* Header */}
      <section className="bg-slate-900 dark:bg-[#000000] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="primary" className="mb-3">Enggia 2025</Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Product Catalog</h1>
              <p className="mt-3 text-slate-300 max-w-xl">
                Browse our complete supplier catalog featuring premium windows, doors, and fenestration systems.
                98 pages of products and specifications.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "primary" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="gap-2 border-white/20 text-white hover:text-white"
              >
                <Grid3X3 className="h-4 w-4" /> Grid
              </Button>
              <Button
                variant={viewMode === "reader" ? "primary" : "outline"}
                size="sm"
                onClick={() => { setViewMode("reader"); setCurrentPage(0) }}
                className="gap-2 border-white/20 text-white hover:text-white"
              >
                <BookOpen className="h-4 w-4" /> Reader
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* View Mode Toggle - Mobile */}
      <div className="sm:hidden py-3 px-4 border-b border-slate-200 dark:border-slate-800 dark:bg-[#030712] flex gap-2">
        <Button
          variant={viewMode === "grid" ? "primary" : "outline"}
          size="sm"
          onClick={() => setViewMode("grid")}
          className="flex-1 gap-2"
        >
          <Grid3X3 className="h-4 w-4" /> Grid
        </Button>
        <Button
          variant={viewMode === "reader" ? "primary" : "outline"}
          size="sm"
          onClick={() => { setViewMode("reader"); setCurrentPage(0) }}
          className="flex-1 gap-2"
        >
          <BookOpen className="h-4 w-4" /> Reader
        </Button>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <section className="py-8 dark:bg-[#030712]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm text-slate-500 mb-6">{catalogPages.length} pages • Click any page to view full size</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {catalogPages.map((item, idx) => (
                <button
                  key={item.page}
                  onClick={() => { setLightbox(idx) }}
                  className="group relative aspect-[3/4] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all"
                >
                  <Image
                    src={item.src}
                    alt={`Catalog page ${item.page}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="absolute bottom-1 right-2 text-[10px] font-medium text-white bg-black/50 px-1.5 py-0.5 rounded">
                    {item.page}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reader View */}
      {viewMode === "reader" && (
        <section className="dark:bg-[#030712] min-h-[80vh]">
          <div className="mx-auto max-w-5xl px-4 py-6">
            {/* Reader Controls */}
            <div className="flex items-center justify-between mb-4 bg-white dark:bg-[#0a0f1a] rounded-xl border border-slate-200 dark:border-slate-800 p-3">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[80px] text-center">
                  Page {currentPage + 1} / {catalogPages.length}
                </span>
                <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === catalogPages.length - 1}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs text-slate-500 min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
                <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.min(3, z + 0.25))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setLightbox(currentPage)}>
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Page Display */}
            <div className="relative bg-slate-100 dark:bg-[#0a0f1a] rounded-xl overflow-auto border border-slate-200 dark:border-slate-800" style={{ maxHeight: "75vh" }}>
              <div className="flex items-center justify-center p-4" style={{ transform: `scale(${zoom})`, transformOrigin: "top center", transition: "transform 0.2s ease" }}>
                <Image
                  src={catalogPages[currentPage].src}
                  alt={`Catalog page ${currentPage + 1}`}
                  width={1200}
                  height={1600}
                  className="rounded-lg shadow-xl max-w-full h-auto"
                  priority
                />
              </div>
            </div>

            {/* Page Thumbnails */}
            <div className="mt-4 overflow-x-auto">
              <div className="flex gap-2 pb-2">
                {catalogPages.map((item, idx) => (
                  <button
                    key={item.page}
                    onClick={() => goToPage(idx)}
                    className={`shrink-0 w-16 h-20 rounded-md overflow-hidden border-2 transition-all ${
                      idx === currentPage
                        ? "border-blue-500 shadow-md"
                        : "border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <Image
                      src={item.src}
                      alt={`Page ${item.page}`}
                      width={64}
                      height={80}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Prev */}
          {lightbox > 0 && (
            <button
              onClick={() => setLightbox(lightbox - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Next */}
          {lightbox < catalogPages.length - 1 && (
            <button
              onClick={() => setLightbox(lightbox + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Page indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-4 py-2 rounded-full z-10">
            Page {lightbox + 1} of {catalogPages.length}
          </div>

          {/* Image */}
          <div className="max-w-[90vw] max-h-[90vh] overflow-auto">
            <Image
              src={catalogPages[lightbox].src}
              alt={`Catalog page ${lightbox + 1}`}
              width={1200}
              height={1600}
              className="max-h-[90vh] w-auto object-contain"
              priority
            />
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="py-12 bg-slate-50 dark:bg-[#020617] border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Interested in Something?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Contact us to get a quote on any product from our catalog.</p>
          <div className="mt-6 flex gap-3 justify-center flex-wrap">
            <IntlLink href="/quote">
              <Button variant="primary" size="lg" className="gap-2">
                Get a Quote <ArrowRight className="h-4 w-4" />
              </Button>
            </IntlLink>
            <IntlLink href="/contact">
              <Button variant="outline" size="lg">Contact Us</Button>
            </IntlLink>
            <IntlLink href="/appointments">
              <Button variant="outline" size="lg">Book Consultation</Button>
            </IntlLink>
          </div>
        </div>
      </section>
    </div>
  )
}
