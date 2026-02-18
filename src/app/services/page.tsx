import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { services } from "@/lib/data"
import { ArrowRight, Clock, CheckCircle2, MessageSquare, Ruler, Wrench, Search, Sparkles, Settings, Phone } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Services" }

const iconMap: Record<string, LucideIcon> = { MessageSquare, Ruler, Wrench, Search, Sparkles, Settings }

const process_steps = [
  { step: "01", title: "Initial Consultation", description: "Free consultation to understand your needs, budget, and timeline. Available in-person or via video call." },
  { step: "02", title: "On-Site Assessment", description: "Our certified technicians visit your location for precise measurements and site evaluation." },
  { step: "03", title: "Custom Quote", description: "Receive a detailed, itemized quote with product recommendations and installation timeline." },
  { step: "04", title: "Production & Delivery", description: "Your custom windows and doors are manufactured to exact specifications and delivered on schedule." },
  { step: "05", title: "Professional Installation", description: "Our expert team installs everything to the highest standards with minimal disruption." },
  { step: "06", title: "Quality Inspection", description: "Final walkthrough to ensure everything meets our quality standards and your expectations." },
]

export default function ServicesPage() {
  return (
    <div>
      <section className="bg-slate-900 dark:bg-[#000000] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Our Services</h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl">
            From initial consultation to final installation, we provide comprehensive window and door solutions tailored to your needs.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const IconComp = iconMap[service.icon] ?? Settings
              return (
                <Card key={service.id} className="h-full hover:shadow-lg transition-all">
                  <CardContent className="p-8">
                    <div className="h-14 w-14 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center mb-5">
                      {IconComp && <IconComp className="h-7 w-7 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{service.name}</h3>
                    <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed">{service.description}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Clock className="h-4 w-4" />
                      {service.estimatedDuration}
                    </div>
                    <ul className="mt-5 space-y-2">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="py-16 bg-slate-50 dark:bg-[#020617]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Our Process</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">From first contact to project completion, here&apos;s how we work.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {process_steps.map((item) => (
              <div key={item.step} className="relative">
                <div className="text-5xl font-bold text-blue-100 dark:text-blue-900/60 mb-2">{item.step}</div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 dark:bg-[#030712]">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Ready to Get Started?</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Book a free consultation or request a quote today.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quote"><Button variant="primary" size="lg">Request a Quote <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link href="/appointments"><Button variant="outline" size="lg">Book Consultation</Button></Link>
          </div>
        </div>
      </section>
    </div>
  )
}
