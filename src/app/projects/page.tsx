"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { projects } from "@/lib/data"
import { ProductCategory } from "@/types"
import {
  LayoutGrid,
  List,
  GalleryHorizontalEnd,
  MapPin,
  Calendar,
  Clock,
  Package,
  Quote,
  ArrowRight,
  Home,
  Building2,
  Factory,
  SlidersHorizontal,
  Star,
  X,
  Maximize2,
} from "lucide-react"

type ViewMode = "grid" | "masonry" | "list"

const categories: { value: ProductCategory | "all"; label: string; icon: React.ElementType }[] = [
  { value: "all", label: "All Projects", icon: SlidersHorizontal },
  { value: "residential", label: "Residential", icon: Home },
  { value: "commercial", label: "Commercial", icon: Building2 },
  { value: "industrial", label: "Industrial", icon: Factory },
]

const categoryColors: Record<string, string> = {
  residential: "from-blue-500 to-blue-600",
  commercial: "from-slate-600 to-slate-700",
  industrial: "from-amber-500 to-amber-600",
}

const categoryEmoji: Record<string, string> = {
  residential: "🏠",
  commercial: "🏢",
  industrial: "🏭",
}

export default function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "all">("all")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [expandedProject, setExpandedProject] = useState<string | null>(null)

  const filteredProjects = useMemo(() => {
    if (activeCategory === "all") return projects
    return projects.filter((p) => p.category === activeCategory)
  }, [activeCategory])

  const featuredProjects = projects.filter((p) => p.isFeatured)

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative bg-slate-900 dark:bg-[#000000] py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div>
            <Badge variant="primary" className="mb-4 text-sm px-4 py-1">Our Portfolio</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Completed <span className="text-blue-400">Projects</span>
            </h1>
            <p className="mt-4 text-lg text-slate-300 max-w-2xl">
              Explore our portfolio of completed window and door installations across residential, commercial, and industrial sectors.
            </p>
          </div>

          {/* Stats */}
          <div
            className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { value: `${projects.length}+`, label: "Projects Completed" },
              { value: `${projects.filter(p => p.category === "residential").length}`, label: "Residential" },
              { value: `${projects.filter(p => p.category === "commercial").length}`, label: "Commercial" },
              { value: `${projects.filter(p => p.category === "industrial").length}`, label: "Industrial" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Showcase */}
      <section className="py-16 dark:bg-[#020617]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-8">
            <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Featured Projects</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredProjects.slice(0, 4).map((project, index) => (
              <div
                key={project.id}
              >
                <Card className="group overflow-hidden hover:shadow-xl transition-all duration-500 h-full">
                  {/* Image placeholder with gradient */}
                  <div className={`relative h-56 bg-gradient-to-br ${categoryColors[project.category]} overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <span className="text-5xl mb-3 block">{categoryEmoji[project.category]}</span>
                        <span className="text-sm font-medium opacity-80">Project Image</span>
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 text-xs">
                        {project.category}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-amber-500/90 text-white border-0 text-xs">
                        <Star className="h-3 w-3 fill-white mr-1" /> Featured
                      </Badge>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                      <h3 className="text-xl font-bold text-white">{project.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-sm text-white/80">
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{project.location}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{project.completionDate}</span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{project.shortDescription}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.productsUsed.map((product) => (
                        <Badge key={product} variant="secondary" className="text-[10px]">{product}</Badge>
                      ))}
                    </div>
                    {project.testimonial && (
                      <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-[#0a0f1a] border-l-2 border-blue-500">
                        <p className="text-xs text-slate-600 dark:text-slate-400 italic">&ldquo;{project.testimonial.quote}&rdquo;</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-1 font-medium">— {project.testimonial.author}</p>
                      </div>
                    )}
                    <button
                      onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                      className="mt-4 text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      View Details <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Projects Gallery */}
      <section className="py-16 dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Filters & View Toggle */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">All Projects</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Showing {filteredProjects.length} of {projects.length} projects
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Category Filters */}
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <Button
                    key={cat.value}
                    variant={activeCategory === cat.value ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(cat.value)}
                    className="gap-1.5"
                  >
                    <cat.icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{cat.label}</span>
                  </Button>
                ))}
              </div>

              {/* View Toggle */}
              <div className="flex gap-1 bg-slate-100 dark:bg-[#0a0f1a] rounded-lg p-1 border border-slate-200 dark:border-[#1e293b]">
                {[
                  { mode: "grid" as ViewMode, icon: LayoutGrid },
                  { mode: "masonry" as ViewMode, icon: GalleryHorizontalEnd },
                  { mode: "list" as ViewMode, icon: List },
                ].map(({ mode, icon: Icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`p-2 rounded-md transition-all ${viewMode === mode ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid View */}
          <>
            {viewMode === "grid" && (
              <div
                key="grid"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredProjects.map((project, i) => (
                  <div
                    key={project.id}
                  >
                    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                      <div className={`relative h-48 bg-gradient-to-br ${categoryColors[project.category]}`}>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center text-4xl">
                          {categoryEmoji[project.category]}
                        </div>
                        <Badge className="absolute top-3 left-3 bg-white/20 backdrop-blur-md text-white border-white/30 text-xs capitalize">
                          {project.category}
                        </Badge>
                        {project.isFeatured && (
                          <Star className="absolute top-3 right-3 h-5 w-5 text-amber-400 fill-amber-400" />
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                          <h3 className="text-lg font-bold text-white">{project.title}</h3>
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{project.location}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{project.duration}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{project.shortDescription}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {project.productsUsed.slice(0, 2).map((p) => (
                            <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}

            {/* Masonry View */}
            {viewMode === "masonry" && (
              <div
                key="masonry"
                className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
              >
                {filteredProjects.map((project, i) => {
                  const isLarge = i % 3 === 0
                  return (
                    <div
                      key={project.id}
                      className="break-inside-avoid"
                    >
                      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                        <div className={`relative ${isLarge ? "h-72" : "h-48"} bg-gradient-to-br ${categoryColors[project.category]}`}>
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                          <div className="absolute inset-0 flex items-center justify-center text-5xl">
                            {categoryEmoji[project.category]}
                          </div>
                          <Badge className="absolute top-3 left-3 bg-white/20 backdrop-blur-md text-white border-white/30 text-xs capitalize">
                            {project.category}
                          </Badge>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                            <h3 className="text-lg font-bold text-white">{project.title}</h3>
                            <div className="flex items-center gap-2 mt-1 text-xs text-white/70">
                              <MapPin className="h-3 w-3" />{project.location}
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-5">
                          <p className="text-sm text-slate-600 dark:text-slate-400">{project.shortDescription}</p>
                          {project.testimonial && isLarge && (
                            <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-[#0a0f1a] border-l-2 border-blue-500">
                              <Quote className="h-4 w-4 text-blue-400 mb-1" />
                              <p className="text-xs text-slate-600 dark:text-slate-400 italic">&ldquo;{project.testimonial.quote}&rdquo;</p>
                              <p className="text-[10px] text-slate-500 mt-1 font-medium">— {project.testimonial.author}</p>
                            </div>
                          )}
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {project.productsUsed.slice(0, 2).map((p) => (
                                <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                              ))}
                            </div>
                            <span className="text-xs text-slate-400">{project.completionDate}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )
                })}
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <div
                key="list"
                className="space-y-4"
              >
                {filteredProjects.map((project, i) => (
                  <div
                    key={project.id}
                  >
                    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                      <div className="flex flex-col md:flex-row">
                        <div className={`relative w-full md:w-64 h-48 md:h-auto bg-gradient-to-br ${categoryColors[project.category]} shrink-0`}>
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                          <div className="absolute inset-0 flex items-center justify-center text-5xl">
                            {categoryEmoji[project.category]}
                          </div>
                          <Badge className="absolute top-3 left-3 bg-white/20 backdrop-blur-md text-white border-white/30 text-xs capitalize">
                            {project.category}
                          </Badge>
                        </div>
                        <CardContent className="p-6 flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {project.title}
                              </h3>
                              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{project.location}</span>
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{project.completionDate}</span>
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{project.duration}</span>
                                {project.squareFootage && (
                                  <span className="flex items-center gap-1"><Maximize2 className="h-3 w-3" />{project.squareFootage}</span>
                                )}
                              </div>
                            </div>
                            {project.isFeatured && (
                              <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 shrink-0">
                                <Star className="h-3 w-3 fill-current mr-1" /> Featured
                              </Badge>
                            )}
                          </div>
                          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{project.description}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex flex-wrap gap-1.5">
                              {project.productsUsed.map((p) => (
                                <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                              ))}
                            </div>
                            <span className="text-sm text-slate-500 dark:text-slate-400">Client: {project.client}</span>
                          </div>
                          {project.testimonial && (
                            <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-[#0a0f1a] border-l-2 border-blue-500">
                              <p className="text-xs text-slate-600 dark:text-slate-400 italic">&ldquo;{project.testimonial.quote}&rdquo;</p>
                              <p className="text-[10px] text-slate-500 mt-1 font-medium">— {project.testimonial.author}, {project.testimonial.role}</p>
                            </div>
                          )}
                        </CardContent>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 dark:bg-[#020617]">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Want Your Project Featured Here?</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Let&apos;s discuss your next window and door project. Get a free consultation today.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quote"><Button variant="primary" size="lg">Get Free Quote <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link href="/appointments"><Button variant="outline" size="lg">Book Consultation</Button></Link>
          </div>
        </div>
      </section>
    </div>
  )
}
