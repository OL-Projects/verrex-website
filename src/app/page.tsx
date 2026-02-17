"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { products, services, testimonials, companyInfo, projects } from "@/lib/data"
import { formatCurrency } from "@/lib/utils"
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

const iconMap: Record<string, React.ElementType> = {
  MessageSquare, Ruler, Wrench, Search, Sparkles, Settings,
}

const stats = [
  { value: "500+", label: "Projects Delivered" },
  { value: "2M+", label: "Sq Ft Installed" },
  { value: "98%", label: "On-Time Completion" },
  { value: "15+", label: "Years in Industry" },
]

const certifications = [
  { name: "AAMA Certified", icon: BadgeCheck },
  { name: "NFRC Rated", icon: ShieldCheck },
  { name: "Energy Star", icon: Award },
  { name: "WDMA Member", icon: Shield },
]

const categoryCards = [
  { title: "Residential & Multi-Family", description: "Energy-efficient window and door systems for homes, condominiums, and multi-unit developments.", icon: Home, href: "/products?category=residential", image: "/images/hero/hero-residential.jpg" },
  { title: "Commercial & Institutional", description: "Storefront systems, curtain walls, and entry doors for offices, government buildings, and retail.", icon: Landmark, href: "/products?category=commercial", image: "/images/hero/hero-commercial.jpg" },
  { title: "Industrial & Manufacturing", description: "Heavy-duty fire-rated doors, safety glazing, and high-performance systems for industrial facilities.", icon: Factory, href: "/products?category=industrial", image: "/images/hero/hero-industrial.jpg" },
]

export default function HomePage() {
  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 4)

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[85vh] flex flex-col justify-end">
        {/* Background Image */}
        <Image
          src="/images/hero/hero-main-new.jpg"
          alt="VERREX premium window and door systems"
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
                  Premium Windows & Doors
                </Badge>
              </FadeIn>
              <FadeIn delay={0.15}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
                  Engineered for
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent">Every Project</span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.3}>
                <p className="mt-5 text-base md:text-lg text-slate-300 leading-relaxed">
                  VERREX delivers high-performance window and door systems for
                  residential, commercial, institutional, and industrial projects.
                  Trusted by developers, architects, and facility managers across Ontario.
                </p>
              </FadeIn>
              <FadeIn delay={0.45}>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link href="/catalog">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white hover:scale-[1.03] active:scale-[0.97] transition-transform">
                      View Product Catalog
                    </Button>
                  </Link>
                  <Link href="/appointments">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white hover:scale-[1.03] active:scale-[0.97] transition-transform">
                      <Phone className="h-4 w-4" /> Book Consultation
                    </Button>
                  </Link>
                </div>
              </FadeIn>
              {/* Certification badges */}
              <FadeIn delay={0.6}>
                <div className="mt-8 flex flex-wrap items-center gap-5">
                  {certifications.map((cert) => (
                    <div key={cert.name} className="flex items-center gap-2 text-white/60 hover:text-white/90 transition-colors">
                      <cert.icon className="h-4 w-4" />
                      <span className="text-xs font-medium tracking-wide uppercase">{cert.name}</span>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>

            {/* Right: Quick Quote Form */}
            <FadeIn delay={0.3}>
              <div className="hidden lg:block bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-6 shadow-2xl hero-quote-form">
                <h3 className="text-lg font-bold text-white mb-1">Request a Free Quote</h3>
                <p className="text-xs text-white/60 mb-4">Get a personalized estimate for your project</p>
                <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Full Name" className="w-full px-3 py-2 bg-white/10 border border-white/15 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50" />
                    <input type="email" placeholder="Email" className="w-full px-3 py-2 bg-white/10 border border-white/15 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="tel" placeholder="Phone Number" className="w-full px-3 py-2 bg-white/10 border border-white/15 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50" />
                    <input type="text" placeholder="City" className="w-full px-3 py-2 bg-white/10 border border-white/15 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50" />
                  </div>
                  <input type="text" placeholder="Postal Code" className="w-full px-3 py-2 bg-white/10 border border-white/15 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50" />
                  <div>
                    <p className="text-xs font-medium text-white/70 mb-2">Select Product Type</p>
                    <div className="grid grid-cols-2 gap-2">
                      {["Casement Windows", "Sliding Doors", "Double Hung", "Storefront", "Curtain Wall", "Entry Doors"].map((product) => (
                        <label key={product} className="flex items-center gap-2 text-xs text-white/70 hover:text-white/90 cursor-pointer">
                          <input type="checkbox" className="rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-400/50 h-3.5 w-3.5" />
                          {product}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-white/70 mb-1 block">Quantity / Units</label>
                    <input type="number" placeholder="e.g. 10" min="1" className="w-full px-3 py-2 bg-white/10 border border-white/15 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50" />
                  </div>
                  <Button variant="primary" size="lg" className="w-full hover:scale-[1.02] active:scale-[0.98] transition-transform">
                    Submit Quote Request <ArrowRight className="h-4 w-4" />
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
              Solutions For Every Sector
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Comprehensive window and door systems engineered for every building type — 
              from multi-family developments to government facilities and manufacturing plants.
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categoryCards.map((cat) => (
              <StaggerItem key={cat.title}>
                <Link href={cat.href}>
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
                          View Products
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </HoverCard>
                </Link>
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
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Featured Products</h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Our most popular window and door solutions.</p>
            </div>
            <Link href="/products" className="hidden md:flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <StaggerItem key={product.id}>
                <Link href={`/products/${product.id}`}>
                  <HoverCard>
                    <Card className="group h-full cursor-pointer hover:shadow-lg transition-all duration-300">
                      <div className="aspect-[4/3] relative rounded-t-xl overflow-hidden bg-slate-100 dark:bg-[#0a0f1a]">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <CardContent className="p-5">
                        <Badge variant="secondary" className="mb-2 text-xs">{product.category}</Badge>
                        <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{product.shortDescription}</p>
                        <div className="mt-3 text-sm font-medium text-blue-600 dark:text-blue-400">
                          From {formatCurrency(product.priceRange.min)}
                        </div>
                      </CardContent>
                    </Card>
                  </HoverCard>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </RevealSection>

      {/* Services Section */}
      <RevealSection className="py-20 bg-slate-50 dark:bg-[#020617]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Complete Service Solutions</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              From initial consultation to final installation, we provide end-to-end service for all your window and door needs.
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const Icon = iconMap[service.icon] || Settings
              return (
                <StaggerItem key={service.id}>
                  <HoverCard>
                    <Card className="h-full">
                      <CardContent className="p-6">
                        <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center mb-4">
                          <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
            <Link href="/services">
              <Button variant="primary" size="lg" className="hover:scale-[1.03] active:scale-[0.97] transition-transform">
                Learn More About Our Services <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </FadeIn>
        </div>
      </RevealSection>

      {/* Why Choose VERREX — Day/Night Theme-Aware Background */}
      <section className="relative overflow-hidden min-h-[600px]">
        {/* Day Background (Light Mode) */}
        <div className="absolute inset-0 z-0 block dark:hidden">
          <Image
            src="/images/hero/Day.svg"
            alt="Modern home with VERREX windows — daytime"
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
            alt="Modern home with VERREX windows — nighttime"
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

        <div className="relative z-[2] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-xl">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg">
                Why Choose <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent">VERREX</span>?
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="mt-5 text-lg text-white/80 leading-relaxed drop-shadow-md">
                We are your strategic partner for fenestration projects of any scale — combining manufacturer-direct pricing, certified installation, and comprehensive project management to deliver results.
              </p>
            </FadeIn>

            <div className="mt-10 space-y-6">
              {[
                { icon: Shield, title: "Fully Licensed & Bonded", desc: "Complete liability coverage, WSIB compliant, and licensed professionals on every project." },
                { icon: BadgeCheck, title: "Code Compliant", desc: "All products meet or exceed Ontario Building Code, AAMA, and NFRC standards." },
                { icon: Truck, title: "On-Time, On-Budget", desc: "98% on-time completion rate with transparent project management and milestone tracking." },
                { icon: FileText, title: "Volume & Contract Pricing", desc: "Competitive pricing for multi-unit, institutional, and recurring maintenance contracts." },
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
                <Link href="/quote">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto hover:scale-[1.03] active:scale-[0.97] transition-transform">
                    Get a Free Quote <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 text-white border-white/25 hover:bg-white/20 hover:text-white hover:scale-[1.03] active:scale-[0.97] transition-transform">
                    Learn More About Us
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <RevealSection className="py-20 bg-slate-50 dark:bg-[#020617]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Trusted by Industry Leaders</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">What property managers, architects, and facility directors say about working with VERREX.</p>
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

      {/* Featured Projects Showcase */}
      <RevealSection className="py-20 dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="flex items-end justify-between mb-12">
            <div>
              <Badge variant="primary" className="mb-3 text-xs">Portfolio</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Recent Projects</h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">See the quality of our work firsthand.</p>
            </div>
            <Link href="/projects" className="hidden md:flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300">
              View All Projects <ArrowRight className="h-4 w-4" />
            </Link>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.filter(p => p.isFeatured).slice(0, 3).map((project) => (
              <StaggerItem key={project.id}>
                <HoverCard>
                  <Card className="group overflow-hidden h-full">
                    <div className="relative h-52 bg-slate-200 dark:bg-[#0a0f1a]">
                      <Image
                        src={project.images[0]}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5">
                        <h3 className="text-lg font-bold text-white">{project.title}</h3>
                        <p className="text-sm text-white/70 mt-1">{project.location}</p>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{project.shortDescription}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {project.productsUsed.slice(0, 2).map((p) => (
                          <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                        ))}
                      </div>
                      {project.testimonial && (
                        <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-[#0a0f1a] border-l-2 border-blue-500">
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-2">&ldquo;{project.testimonial.quote}&rdquo;</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </HoverCard>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeIn delay={0.3} className="mt-8 text-center md:hidden">
            <Link href="/projects">
              <Button variant="outline" size="lg">View All Projects <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </FadeIn>
        </div>
      </RevealSection>

      {/* CTA Section */}
      <section className="relative py-20 bg-slate-900 dark:bg-[#000000] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Let&apos;s Discuss Your Next Project
            </h2>
            <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
              Whether you&apos;re planning a multi-unit development, government facility upgrade, or industrial retrofit — our team is ready to deliver.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote">
                <Button variant="primary" size="xl" className="w-full sm:w-auto hover:scale-[1.03] active:scale-[0.97] transition-transform">
                  Request a Proposal <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/appointments">
                <Button variant="outline" size="xl" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 hover:text-white hover:scale-[1.03] active:scale-[0.97] transition-transform">
                  <Phone className="h-5 w-5" /> Schedule Consultation
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}
