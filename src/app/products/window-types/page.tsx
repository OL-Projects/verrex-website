"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Window3DViewer } from "@/components/ui/window-3d-viewer"
import { X, ArrowRight, ArrowLeft, Home, Building2, Factory, Ruler, Shield, Thermometer, ChevronLeft, ChevronRight } from "lucide-react"

interface WindowType {
  id: string
  name: string
  icon: string
  image: string
  description: string
  bestFor: string[]
  benefits: string[]
  categories: ("residential" | "commercial" | "industrial")[]
}

const windowTypes: WindowType[] = [
  {
    id: "double-hung",
    name: "Double-Hung",
    icon: "⬍",
    image: "/images/window-types/double-hung.png",
    description: "Two sashes that slide vertically within the frame. Both the upper and lower sash can be opened, allowing for versatile ventilation and easy cleaning.",
    bestFor: ["Living rooms", "Bedrooms", "Kitchens", "Traditional homes"],
    benefits: ["Easy to clean from inside", "Excellent ventilation control", "Classic aesthetic", "Compatible with most architectures"],
    categories: ["residential"],
  },
  {
    id: "casement",
    name: "Casement",
    icon: "↗",
    image: "/images/window-types/casement.png",
    description: "Hinged at the side and opens outward like a door using a crank mechanism. Provides maximum airflow and an unobstructed view when open.",
    bestFor: ["Above kitchen sinks", "Hard-to-reach areas", "Modern homes"],
    benefits: ["Maximum ventilation", "Excellent energy efficiency", "Tight seal when closed", "Unobstructed views"],
    categories: ["residential", "commercial"],
  },
  {
    id: "sliding",
    name: "Sliding",
    icon: "⟷",
    image: "/images/window-types/sliding.png",
    description: "Operates horizontally along a track. One or both sashes slide left or right. Low maintenance and space-efficient since they don't protrude outward.",
    bestFor: ["Patios", "Decks", "Wide openings", "Contemporary designs"],
    benefits: ["Easy to operate", "Space-saving design", "Low maintenance", "Wide views"],
    categories: ["residential", "commercial"],
  },
  {
    id: "bay-bow",
    name: "Bay & Bow",
    icon: "🏠",
    image: "/images/window-types/bay-bow.png",
    description: "Bay windows project outward in an angled shape (typically 3 panels), while bow windows use 4-6 panels in a gentle curve. Both add space and light to rooms.",
    bestFor: ["Living rooms", "Master bedrooms", "Dining areas", "Reading nooks"],
    benefits: ["Adds interior space", "Panoramic views", "Dramatic architectural element", "Increased natural light"],
    categories: ["residential"],
  },
  {
    id: "awning",
    name: "Awning",
    icon: "⬆",
    image: "/images/window-types/awning.png",
    description: "Hinged at the top and opens outward from the bottom. Can remain open during light rain without letting water in, making them ideal for ventilation in various weather.",
    bestFor: ["Basements", "Bathrooms", "Above doors", "Rainy climates"],
    benefits: ["Ventilation in rain", "Good security", "Energy efficient", "Weather resistant"],
    categories: ["residential", "commercial"],
  },
  {
    id: "picture",
    name: "Picture / Fixed",
    icon: "🖼",
    image: "/images/window-types/picture-fixed.png",
    description: "Large, non-opening windows designed to frame a view and maximize natural light. Often combined with operable windows on either side.",
    bestFor: ["Scenic views", "High walls", "Accent windows", "Storefronts"],
    benefits: ["Maximum light", "Best energy efficiency", "Unobstructed views", "No moving parts"],
    categories: ["residential", "commercial", "industrial"],
  },
  {
    id: "garden",
    name: "Garden",
    icon: "🌿",
    image: "/images/window-types/garden.jpg",
    description: "Extends outward from the wall creating a small shelf. Originally designed for growing herbs, now used for plants, décor, or additional kitchen space.",
    bestFor: ["Kitchens", "Plant lovers", "Small spaces"],
    benefits: ["Additional shelf space", "Brings nature inside", "Unique design element", "Extra light"],
    categories: ["residential"],
  },
  {
    id: "skylight",
    name: "Skylight",
    icon: "☀",
    image: "/images/window-types/skylight.jpg",
    description: "Installed in the roof or ceiling to bring natural light from above. Available in fixed, vented, and tubular styles for various applications.",
    bestFor: ["Dark rooms", "Hallways", "Bathrooms", "Attics"],
    benefits: ["Natural overhead light", "Reduces energy costs", "Ventilation option", "Star gazing"],
    categories: ["residential", "commercial"],
  },
  {
    id: "transom",
    name: "Transom",
    icon: "▬",
    image: "/images/window-types/transom.jpg",
    description: "Narrow windows placed above doors or other windows. Can be fixed or operable. Add architectural interest and extra light to entryways.",
    bestFor: ["Above front doors", "Above other windows", "Hallways", "Decorative accents"],
    benefits: ["Additional natural light", "Architectural detail", "Privacy maintained", "Classic elegance"],
    categories: ["residential", "commercial"],
  },
  {
    id: "hopper",
    name: "Hopper",
    icon: "⬇",
    image: "/images/window-types/hopper.jpg",
    description: "Hinged at the bottom and opens inward from the top. Commonly used in basements and bathrooms for ventilation while maintaining security.",
    bestFor: ["Basements", "Bathrooms", "Small spaces", "Utility rooms"],
    benefits: ["Good ventilation", "Compact design", "Security", "Water deflection"],
    categories: ["residential"],
  },
  {
    id: "tilt-turn",
    name: "Tilt & Turn",
    icon: "⟳",
    image: "/images/window-types/tilt-turn.jpg",
    description: "European-style window that can tilt inward from the top for ventilation or swing open from the side like a door. Offers maximum flexibility.",
    bestFor: ["Modern buildings", "High-rise apartments", "European-style homes"],
    benefits: ["Dual opening modes", "Easy to clean", "Excellent seal", "Multi-function"],
    categories: ["residential", "commercial"],
  },
  {
    id: "glass-block",
    name: "Glass Block",
    icon: "▦",
    image: "/images/window-types/glass-block.jpg",
    description: "Constructed from thick glass blocks that let light through while providing privacy and security. Ideal for areas where light is wanted without visibility.",
    bestFor: ["Bathrooms", "Basements", "Stairwells", "Privacy areas"],
    benefits: ["Maximum privacy", "Natural light", "Sound insulation", "Security"],
    categories: ["residential", "commercial", "industrial"],
  },
  {
    id: "jalousie",
    name: "Jalousie / Louvre",
    icon: "≡",
    image: "/images/window-types/jalousie.jpg",
    description: "Features horizontal glass slats that open and close like blinds. Provides excellent ventilation control. Common in tropical and warm climates.",
    bestFor: ["Porches", "Sunrooms", "Tropical climates", "Ventilation zones"],
    benefits: ["Maximum airflow", "Adjustable ventilation", "Light control", "Tropical style"],
    categories: ["residential", "commercial"],
  },
  {
    id: "curtain-wall",
    name: "Curtain Wall",
    icon: "▥",
    image: "/images/window-types/curtain-wall.jpg",
    description: "Non-structural glass façade system that hangs from the building structure. Creates seamless glass exteriors for modern commercial and industrial buildings.",
    bestFor: ["Office buildings", "Skyscrapers", "Showrooms", "Atriums"],
    benefits: ["Stunning aesthetics", "Energy efficient systems", "Natural daylight", "Modern appearance"],
    categories: ["commercial", "industrial"],
  },
  {
    id: "storefront",
    name: "Storefront",
    icon: "🏪",
    image: "/images/window-types/storefront.png",
    description: "Large glass panels framed in aluminum, designed for commercial ground-floor applications. Provides maximum product visibility and curb appeal.",
    bestFor: ["Retail stores", "Restaurants", "Lobbies", "Ground-floor commercial"],
    benefits: ["Maximum visibility", "Curb appeal", "Durable framing", "Custom sizing"],
    categories: ["commercial"],
  },
]

const categoryIcons = {
  residential: Home,
  commercial: Building2,
  industrial: Factory,
}

export default function WindowTypesPage() {
  const [selectedType, setSelectedType] = useState<WindowType | null>(null)
  const [filter, setFilter] = useState<"all" | "residential" | "commercial" | "industrial">("all")

  const filtered = filter === "all" ? windowTypes : windowTypes.filter(w => w.categories.includes(filter))

  return (
    <div>
      {/* Header */}
      <section className="bg-slate-900 dark:bg-[#000000] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/products" className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 mb-4 text-sm">
            <ArrowLeft className="h-4 w-4" /> Back to Products
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Types of Windows</h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl">
            Explore every window style available. Click on any type to see details, benefits, and best applications.
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 border-b border-slate-200 dark:border-slate-800 dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 flex-wrap">
            {(["all", "residential", "commercial", "industrial"] as const).map((cat) => (
              <Button
                key={cat}
                variant={filter === cat ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter(cat)}
                className="gap-2"
              >
                {cat !== "all" && (() => { const Icon = categoryIcons[cat]; return <Icon className="h-4 w-4" /> })()}
                {cat === "all" ? "All Types" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Button>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-500">Showing {filtered.length} window types</p>
        </div>
      </section>

      {/* Window Types Grid */}
      <section className="py-12 dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((type) => (
              <button
                key={type.id}
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
                      {type.categories.map((cat) => (
                        <Badge key={cat} variant="secondary" className="text-[9px] px-1.5">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Full-Screen Split View with 3D Viewer */}
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
              {selectedType.categories.map((cat) => (
                <Badge key={cat} variant="secondary" className="text-[10px]">{cat}</Badge>
              ))}
            </div>
            {/* Prev / Next navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  const idx = windowTypes.findIndex(w => w.id === selectedType.id)
                  if (idx > 0) setSelectedType(windowTypes[idx - 1])
                }}
                className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors disabled:opacity-30"
                disabled={windowTypes.findIndex(w => w.id === selectedType.id) === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  const idx = windowTypes.findIndex(w => w.id === selectedType.id)
                  if (idx < windowTypes.length - 1) setSelectedType(windowTypes[idx + 1])
                }}
                className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors disabled:opacity-30"
                disabled={windowTypes.findIndex(w => w.id === selectedType.id) === windowTypes.length - 1}
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
            {/* LEFT: 3D Viewer */}
            <div className="w-full lg:w-1/2 h-[45vh] lg:h-full p-3 sm:p-4">
              <Window3DViewer windowType={selectedType.id} icon={selectedType.icon} />
            </div>

            {/* RIGHT: Specifications */}
            <div className="w-full lg:w-1/2 h-[55vh] lg:h-full overflow-y-auto border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800">
              <div className="p-6 sm:p-8 space-y-6">
                {/* Title */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{selectedType.icon}</span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{selectedType.name}</h2>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {selectedType.categories.map((cat) => (
                      <Badge key={cat} variant="secondary">{cat}</Badge>
                    ))}
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
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">A+ Rated</p>
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
                  <Link href="/quote" className="flex-1">
                    <Button variant="primary" size="lg" className="w-full gap-2">
                      Get a Quote <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/appointments">
                    <Button variant="outline" size="lg" className="gap-2">
                      Book Consultation
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
