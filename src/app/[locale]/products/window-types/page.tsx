"use client"

import { useState } from "react"
import { useTranslations } from 'next-intl'
import { Link as IntlLink } from '@/i18n/navigation'
import Image from "next/image"
import dynamic from "next/dynamic"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, ArrowRight, ArrowLeft, Ruler, Shield, Thermometer, ChevronLeft, ChevronRight, AppWindow, DoorOpen } from "lucide-react"

// Dynamically import 3D configurator (no SSR - WebGL needs browser)
const Window3DConfigurator = dynamic(
  () => import("@/components/ui/Window3DConfigurator").then((mod) => mod.Window3DConfigurator),
  { ssr: false, loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#0a0f1a] dark:to-[#060b14] rounded-2xl">
      <div className="text-center">
        <div className="h-10 w-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading 3D Viewer...</p>
      </div>
    </div>
  )}
)

interface WindowType {
  id: string
  name: string
  image: string
  description: string
  bestFor: string[]
  benefits: string[]
  type: "window" | "door"
  defaultWidth: number
  defaultHeight: number
}

const windowTypes: WindowType[] = [
  // ── WINDOWS ──
  {
    id: "double-hung",
    name: "Top Hung",
    image: "/images/window-types/double-hung.png",
    description: "Hinged at the top and opening outward from the bottom. Ideal for ventilation while preventing rain entry. Commonly used in bathrooms, basements, and kitchens where space-efficient ventilation is needed.",
    bestFor: ["Basements", "Bathrooms", "Kitchens", "Utility rooms"],
    benefits: ["Rain protection when open", "Excellent ventilation control", "Compact operation", "Easy to clean"],
    type: "window",
    defaultWidth: 36,
    defaultHeight: 60,
  },
  {
    id: "sliding",
    name: "Sliding Window",
    image: "/images/window-types/sliding.png",
    description: "Horizontal sliding sash windows that glide smoothly on precision tracks. Space-efficient and easy to operate. Available in 2-panel and 3-panel configurations for wide, unobstructed views.",
    bestFor: ["Living rooms", "Bedrooms", "Offices", "Contemporary designs"],
    benefits: ["Space-saving operation", "Smooth gliding tracks", "Multi-panel options", "Wide unobstructed views"],
    type: "window",
    defaultWidth: 60,
    defaultHeight: 36,
  },
  {
    id: "casement",
    name: "Casement",
    image: "/images/window-types/casement.png",
    description: "Side-hinged windows that open outward like a door. Provide maximum ventilation and unobstructed views. Available in tilt & turn and hand-cranked variants for different applications.",
    bestFor: ["Residential homes", "Light commercial", "Modern buildings"],
    benefits: ["Maximum ventilation", "Unobstructed views", "Multi-point locking", "Energy efficient seals"],
    type: "window",
    defaultWidth: 30,
    defaultHeight: 48,
  },
  {
    id: "tilt-turn",
    name: "Tilt & Turn",
    image: "/images/window-types/tilt-turn.jpg",
    description: "European-style casement that tilts inward from the top for secure ventilation or swings fully inward for cleaning and emergency egress. Dual-function hardware offers maximum flexibility.",
    bestFor: ["High-rise condos", "Modern homes", "European-style buildings"],
    benefits: ["Tilt mode for secure ventilation", "Full inward opening for cleaning", "Emergency egress capable", "Child-safe tilt position"],
    type: "window",
    defaultWidth: 30,
    defaultHeight: 48,
  },
  {
    id: "hand-cranked",
    name: "Hand Cranked Casement",
    image: "/images/window-types/casement.png",
    description: "Traditional casement operated by a hand crank mechanism that pushes the sash outward. Provides precise control over the opening angle and excellent weatherseal when closed.",
    bestFor: ["Residential homes", "Heritage buildings", "Hard-to-reach areas"],
    benefits: ["Precise opening control", "Outward projection for airflow", "Traditional crank mechanism", "Tight weatherseal when closed"],
    type: "window",
    defaultWidth: 30,
    defaultHeight: 48,
  },
  // ── DOORS ──
  {
    id: "sliding-door",
    name: "Sliding Door",
    image: "/images/products/sliding-door-1.jpg",
    description: "Large-panel doors that glide horizontally on precision tracks. Available in 2, 3, and 4-panel configurations. Ideal for connecting indoor and outdoor spaces with seamless transitions.",
    bestFor: ["Patios", "Balconies", "Terraces", "Open-plan living"],
    benefits: ["Seamless indoor-outdoor flow", "Heavy-duty roller systems", "Multi-point security locks", "Thermal break frames"],
    type: "door",
    defaultWidth: 72,
    defaultHeight: 84,
  },
  {
    id: "folding-door",
    name: "Folding Door",
    image: "/images/products/commercial-entry-1.jpg",
    description: "Multi-panel bi-fold door systems that fold and stack to create wide open passages. Transform entire walls into open-air spaces. Available in 3 to 7-panel configurations.",
    bestFor: ["Restaurants", "Patios", "Showrooms", "Open-concept spaces"],
    benefits: ["Full wall opening capability", "Bi-fold panel stacking", "Flush threshold options", "Weather-rated seals"],
    type: "door",
    defaultWidth: 96,
    defaultHeight: 84,
  },
  {
    id: "swing-door",
    name: "Swing Door",
    image: "/images/products/commercial-entry-2.jpg",
    description: "Traditional hinged doors that swing open on side-mounted hinges. Available as single or double-leaf, inward or outward opening. ADA compliant options with panic hardware available.",
    bestFor: ["Main entries", "Commercial buildings", "Institutional facilities"],
    benefits: ["Classic reliable operation", "Single or double leaf options", "ADA compliant options", "Panic hardware available"],
    type: "door",
    defaultWidth: 36,
    defaultHeight: 84,
  },
]

const windows = windowTypes.filter(t => t.type === "window")
const doors = windowTypes.filter(t => t.type === "door")

export default function WindowTypesPage() {
  const t = useTranslations('WindowTypes')
  const [selectedType, setSelectedType] = useState<WindowType | null>(null)
  const [filter, setFilter] = useState<"all" | "windows" | "doors">("all")

  const filtered = filter === "all" ? windowTypes : filter === "windows" ? windows : doors

  return (
    <div>
      {/* Header */}
      <section className="bg-slate-50 dark:bg-[#000000] py-16 border-b border-slate-200 dark:border-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <IntlLink href="/products" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200 mb-4 text-sm">
            <ArrowLeft className="h-4 w-4" /> Back to Products
          </IntlLink>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
            {t('description')}
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 border-b border-slate-200 dark:border-slate-800 dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 flex-wrap">
            {(["all", "windows", "doors"] as const).map((cat) => (
              <Button
                key={cat}
                variant={filter === cat ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter(cat)}
                className="gap-2"
              >
                {cat === "all" ? "All Types" : cat === "windows" ? "Windows" : "Doors"}
              </Button>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-500">Showing {filtered.length} of {windowTypes.length} types</p>
        </div>
      </section>

      {/* Window Types Grid */}
      <section className="py-12 dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((type) => (
              <button
                key={type.name}
                onClick={() => setSelectedType(type)}
                className="group text-left"
              >
                <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600 overflow-hidden">
                  <div className="aspect-[4/3] relative bg-slate-100 dark:bg-slate-800">
                    <Image
                      src={type.image}
                      alt={type.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <CardContent className="p-3 text-center">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {type.name}
                    </h3>
                    <div className="flex gap-1 mt-1.5 flex-wrap justify-center">
                      <Badge variant="secondary" className="text-[9px] px-1.5">{type.type === "window" ? "Window" : "Door"}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Full-Screen Split View with 3D Configurator */}
      {selectedType && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-[#030712] overflow-hidden">
          {/* Top Bar */}
          <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 bg-white/95 dark:bg-[#020617]/95 backdrop-blur-md">
            <button
              onClick={() => setSelectedType(null)}
              className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Grid
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{selectedType.name}</span>
              <Badge variant="secondary" className="text-[10px]">{selectedType.type === "window" ? "Window" : "Door"}</Badge>
            </div>
            {/* Prev / Next navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  const idx = windowTypes.findIndex(w => w.name === selectedType.name)
                  if (idx > 0) setSelectedType(windowTypes[idx - 1])
                }}
                className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors disabled:opacity-30"
                disabled={windowTypes.findIndex(w => w.name === selectedType.name) === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  const idx = windowTypes.findIndex(w => w.name === selectedType.name)
                  if (idx < windowTypes.length - 1) setSelectedType(windowTypes[idx + 1])
                }}
                className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors disabled:opacity-30"
                disabled={windowTypes.findIndex(w => w.name === selectedType.name) === windowTypes.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setSelectedType(null)}
                className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-300 transition-colors ml-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Split Layout */}
          <div className="h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row">
            {/* LEFT: 3D Configurator */}
            <div className="w-full lg:w-1/2 h-[45vh] lg:h-full p-3 sm:p-4">
              <Window3DConfigurator
                key={selectedType.id}
                windowType={selectedType.id}
                defaultWidth={selectedType.defaultWidth}
                defaultHeight={selectedType.defaultHeight}
              />
            </div>

            {/* RIGHT: Specifications */}
            <div className="w-full lg:w-1/2 h-[55vh] lg:h-full overflow-y-auto border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800">
              <div className="p-6 sm:p-8 space-y-6">
                {/* Title */}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{selectedType.name}</h2>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{selectedType.type === "window" ? "Window" : "Door"}</Badge>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Description</h3>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{selectedType.description}</p>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center">
                    <Ruler className="h-5 w-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Sizes</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Custom</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-center">
                    <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Warranty</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">25 Years</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-center">
                    <Thermometer className="h-5 w-5 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Energy</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">ENERGY STAR\u00AE</p>
                  </div>
                </div>

                {/* Best For */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Best For</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedType.bestFor.map((use) => (
                      <Badge key={use} variant="outline" className="text-sm px-3 py-1">{use}</Badge>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Key Benefits</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedType.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3 pt-2">
                  <IntlLink href="/quote" className="flex-1">
                    <Button variant="primary" size="lg" className="w-full gap-2">
                      {t('getQuote')} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </IntlLink>
                  <IntlLink href="/appointments">
                    <Button variant="outline" size="lg" className="gap-2">
                      Book Consultation
                    </Button>
                  </IntlLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
