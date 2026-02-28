"use client"

import { useState } from "react"
import { useTranslations } from 'next-intl'
import { Link as IntlLink } from '@/i18n/navigation'
import dynamic from "next/dynamic"
import { WindowTypeDiagram } from "@/components/ui/WindowTypeDiagram"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft, Ruler, Shield, Thermometer, AppWindow, DoorOpen, ChevronRight, X } from "lucide-react"

const Window3DConfigurator = dynamic(
  () => import("@/components/ui/Window3DConfigurator").then((mod) => mod.Window3DConfigurator),
  { ssr: false, loading: () => (
    <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#0a0f1a] dark:to-[#060b14] rounded-2xl">
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
  description: string
  bestFor: string[]
  benefits: string[]
  type: "window" | "door"
  defaultWidth: number
  defaultHeight: number
}

const productTypes: WindowType[] = [
  {
    id: "double-hung", name: "Top Hung", type: "window", defaultWidth: 36, defaultHeight: 60,
    description: "Hinged at the top and opening outward from the bottom. Ideal for ventilation while preventing rain entry. Commonly used in bathrooms, basements, and kitchens.",
    bestFor: ["Basements", "Bathrooms", "Kitchens", "Utility rooms"],
    benefits: ["Rain protection when open", "Excellent ventilation control", "Compact operation", "Easy to clean"],
  },
  {
    id: "sliding", name: "Sliding Window", type: "window", defaultWidth: 60, defaultHeight: 36,
    description: "Horizontal sliding sash windows that glide smoothly on precision tracks. Space-efficient and easy to operate. Available in 2 and 3-panel configurations.",
    bestFor: ["Living rooms", "Bedrooms", "Offices", "Contemporary designs"],
    benefits: ["Space-saving operation", "Smooth gliding tracks", "Multi-panel options", "Wide unobstructed views"],
  },
  {
    id: "casement", name: "Casement", type: "window", defaultWidth: 30, defaultHeight: 48,
    description: "Side-hinged windows that open outward like a door. Provide maximum ventilation and unobstructed views. Available in tilt & turn and hand-cranked variants.",
    bestFor: ["Residential homes", "Light commercial", "Modern buildings"],
    benefits: ["Maximum ventilation", "Unobstructed views", "Multi-point locking", "Energy efficient seals"],
  },
  {
    id: "tilt-turn", name: "Tilt & Turn", type: "window", defaultWidth: 30, defaultHeight: 48,
    description: "European-style casement that tilts inward from the top for ventilation or swings fully inward for cleaning. Dual-function hardware offers maximum flexibility.",
    bestFor: ["High-rise condos", "Modern homes", "European-style buildings"],
    benefits: ["Tilt mode for secure ventilation", "Full inward opening for cleaning", "Emergency egress capable", "Child-safe tilt position"],
  },
  {
    id: "hand-cranked", name: "Hand Cranked", type: "window", defaultWidth: 30, defaultHeight: 48,
    description: "Traditional casement operated by a hand crank mechanism. Provides precise control over the opening angle and excellent weatherseal when closed.",
    bestFor: ["Residential homes", "Heritage buildings", "Hard-to-reach areas"],
    benefits: ["Precise opening control", "Outward projection for airflow", "Traditional crank mechanism", "Tight weatherseal when closed"],
  },
  {
    id: "sliding-door", name: "Sliding Door", type: "door", defaultWidth: 72, defaultHeight: 84,
    description: "Large-panel doors that glide horizontally on precision tracks. Available in 2, 3, and 4-panel configurations for seamless indoor-outdoor transitions.",
    bestFor: ["Patios", "Balconies", "Terraces", "Open-plan living"],
    benefits: ["Seamless indoor-outdoor flow", "Heavy-duty roller systems", "Multi-point security locks", "Thermal break frames"],
  },
  {
    id: "folding-door", name: "Folding Door", type: "door", defaultWidth: 96, defaultHeight: 84,
    description: "Multi-panel bi-fold door systems that fold and stack to create wide open passages. Transform entire walls into open-air spaces.",
    bestFor: ["Restaurants", "Patios", "Showrooms", "Open-concept spaces"],
    benefits: ["Full wall opening capability", "Bi-fold panel stacking", "Flush threshold options", "Weather-rated seals"],
  },
  {
    id: "swing-door", name: "Swing Door", type: "door", defaultWidth: 36, defaultHeight: 84,
    description: "Traditional hinged doors on side-mounted hinges. Single or double-leaf, inward or outward. ADA compliant options with panic hardware.",
    bestFor: ["Main entries", "Commercial buildings", "Institutional facilities"],
    benefits: ["Classic reliable operation", "Single or double leaf options", "ADA compliant options", "Panic hardware available"],
  },
]

const windows = productTypes.filter(t => t.type === "window")
const doors = productTypes.filter(t => t.type === "door")

export default function WindowTypesPage() {
  const t = useTranslations('WindowTypes')
  const [selected, setSelected] = useState<WindowType>(productTypes[0])
  const [isMobileSelectorOpen, setIsMobileSelectorOpen] = useState(false)

  const selectType = (type: WindowType) => {
    setSelected(type)
    setIsMobileSelectorOpen(false)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-slate-50 dark:bg-[#000000] py-10 border-b border-slate-200 dark:border-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <IntlLink href="/products/windows" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200 mb-3 text-sm">
            <ArrowLeft className="h-4 w-4" /> {t('backToWindows')}
          </IntlLink>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Windows & Doors</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-xl text-sm">
            Select a product type to explore it in 3D. Click any item to instantly preview the rendering.
          </p>
        </div>
      </section>

      {/* Split Layout */}
      <section className="dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* LEFT: Type Selector List (Desktop only) */}
            <aside className="hidden lg:block lg:w-72 shrink-0">
              <div className="lg:sticky lg:top-20 space-y-4">
                {/* Windows Section */}
                <div>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <AppWindow className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Windows</h3>
                  </div>
                  <div className="space-y-1.5">
                    {windows.map((type) => (
                      <button
                        key={type.name}
                        onClick={() => setSelected(type)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all duration-200 ${
                          selected.name === type.name
                            ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-600 shadow-sm"
                            : "bg-white dark:bg-slate-800/50 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm"
                        }`}
                      >
                        <div className="w-14 h-10 rounded-lg overflow-hidden shrink-0">
                          <WindowTypeDiagram id={type.id} className="p-1" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            selected.name === type.name
                              ? "text-blue-700 dark:text-blue-400"
                              : "text-slate-700 dark:text-slate-300"
                          }`}>
                            {type.name}
                          </p>
                        </div>
                        {selected.name === type.name && (
                          <div className="ml-auto shrink-0 h-2 w-2 rounded-full bg-blue-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Doors Section */}
                <div>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <DoorOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Doors</h3>
                  </div>
                  <div className="space-y-1.5">
                    {doors.map((type) => (
                      <button
                        key={type.name}
                        onClick={() => setSelected(type)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all duration-200 ${
                          selected.name === type.name
                            ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-600 shadow-sm"
                            : "bg-white dark:bg-slate-800/50 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm"
                        }`}
                      >
                        <div className="w-14 h-10 rounded-lg overflow-hidden shrink-0">
                          <WindowTypeDiagram id={type.id} className="p-1" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            selected.name === type.name
                              ? "text-blue-700 dark:text-blue-400"
                              : "text-slate-700 dark:text-slate-300"
                          }`}>
                            {type.name}
                          </p>
                        </div>
                        {selected.name === type.name && (
                          <div className="ml-auto shrink-0 h-2 w-2 rounded-full bg-blue-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* RIGHT: 3D Viewer + Specs */}
            <div className="flex-1 min-w-0 space-y-5">
              {/* Mobile Type Selector Trigger */}
              <div className="lg:hidden">
                <button
                  onClick={() => setIsMobileSelectorOpen(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-blue-300 dark:hover:border-blue-600 transition-all"
                >
                  <div className="w-12 h-9 rounded-lg overflow-hidden shrink-0">
                    <WindowTypeDiagram id={selected.id} className="p-0.5" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs text-slate-400 dark:text-slate-500">Currently viewing</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{selected.name}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 shrink-0">
                    Change <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </button>
              </div>

              {/* Mobile Type Selector Drawer */}
              {isMobileSelectorOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm drawer-backdrop" onClick={() => setIsMobileSelectorOpen(false)} />
                  <div className="relative w-[300px] max-w-[85vw] h-full bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto drawer-slide-in">
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                      <h2 className="text-base font-semibold text-slate-900 dark:text-white">Select Type</h2>
                      <button onClick={() => setIsMobileSelectorOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    {/* Content */}
                    <div className="p-5 space-y-4">
                      {/* Windows */}
                      <div>
                        <div className="flex items-center gap-2 mb-2 px-1">
                          <AppWindow className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Windows</h3>
                        </div>
                        <div className="space-y-1.5">
                          {windows.map((type) => (
                            <button key={type.name} onClick={() => selectType(type)}
                              className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all duration-200 ${
                                selected.name === type.name
                                  ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-600 shadow-sm"
                                  : "bg-white dark:bg-slate-800/50 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                              }`}
                            >
                              <div className="w-14 h-10 rounded-lg overflow-hidden shrink-0">
                                <WindowTypeDiagram id={type.id} className="p-1" />
                              </div>
                              <p className={`text-sm font-medium truncate ${
                                selected.name === type.name ? "text-blue-700 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"
                              }`}>{type.name}</p>
                              {selected.name === type.name && <div className="ml-auto shrink-0 h-2 w-2 rounded-full bg-blue-500" />}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Doors */}
                      <div>
                        <div className="flex items-center gap-2 mb-2 px-1">
                          <DoorOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Doors</h3>
                        </div>
                        <div className="space-y-1.5">
                          {doors.map((type) => (
                            <button key={type.name} onClick={() => selectType(type)}
                              className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all duration-200 ${
                                selected.name === type.name
                                  ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-600 shadow-sm"
                                  : "bg-white dark:bg-slate-800/50 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                              }`}
                            >
                              <div className="w-14 h-10 rounded-lg overflow-hidden shrink-0">
                                <WindowTypeDiagram id={type.id} className="p-1" />
                              </div>
                              <p className={`text-sm font-medium truncate ${
                                selected.name === type.name ? "text-blue-700 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"
                              }`}>{type.name}</p>
                              {selected.name === type.name && <div className="ml-auto shrink-0 h-2 w-2 rounded-full bg-blue-500" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3D Configurator */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800" style={{ height: "clamp(320px, 50vh, 500px)" }}>
                <Window3DConfigurator
                  key={selected.id}
                  windowType={selected.id}
                  defaultWidth={selected.defaultWidth}
                  defaultHeight={selected.defaultHeight}
                />
              </div>

              {/* Specs Panel */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 sm:p-6 space-y-5">
                {/* Title */}
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{selected.name}</h2>
                  <Badge variant="secondary">{selected.type === "window" ? "Window" : "Door"}</Badge>
                </div>

                {/* Description */}
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{selected.description}</p>

                {/* Quick Specs */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center">
                    <Ruler className="h-5 w-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Sizes</p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">Custom</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-center">
                    <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Warranty</p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">25 Years</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-center">
                    <Thermometer className="h-5 w-5 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Energy</p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">ENERGY STAR®</p>
                  </div>
                </div>

                {/* Best For + Benefits side by side */}
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Best For</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.bestFor.map((use) => (
                        <Badge key={use} variant="outline" className="text-xs px-2 py-0.5">{use}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Key Benefits</h3>
                    <div className="space-y-1.5">
                      {selected.benefits.map((b) => (
                        <div key={b} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                          {b}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex gap-3 pt-1">
                  <IntlLink href="/quote" className="flex-1">
                    <Button variant="primary" size="lg" className="w-full gap-2">
                      {t('getQuote')} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </IntlLink>
                  <IntlLink href="/appointments">
                    <Button variant="outline" size="lg">Book Consultation</Button>
                  </IntlLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
