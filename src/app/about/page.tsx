import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { partners } from "@/lib/data"
import { Shield, Award, Users, Target, ArrowRight, CheckCircle2, Handshake, Globe } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "About Us" }

const team = [
  { name: "Alexandra Dumont", role: "CEO & Founder", desc: "15+ years in the window and door industry." },
  { name: "Marcus Chen", role: "Head of Operations", desc: "Expert in project management and logistics." },
  { name: "Sarah Williams", role: "Lead Designer", desc: "Specializing in custom door systems." },
  { name: "David Petrov", role: "Installation Director", desc: "Master craftsman with 20+ years experience." },
]

export default function AboutPage() {
  return (
    <div>
      <section className="bg-slate-900 dark:bg-[#000000] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">About VERREX</h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl">A premier window and door corporation dedicated to transforming spaces with quality, precision, and innovation.</p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">At VERREX, we believe every space deserves the perfect window. Our mission is to provide premium glass and window solutions that combine beauty, energy efficiency, and security for residential, commercial, and industrial clients.</p>
              <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">Founded with a commitment to excellence, we have grown into a trusted name in the industry, serving hundreds of satisfied clients across Canada.</p>
              <div className="mt-8 grid grid-cols-2 gap-6">
                {[
                  { icon: Shield, label: "Licensed & Insured" },
                  { icon: Award, label: "Quality Certified" },
                  { icon: Users, label: "Expert Team" },
                  { icon: Target, label: "Client Focused" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="aspect-square bg-gradient-to-br from-blue-100 via-blue-50 to-slate-100 dark:from-blue-950/50 dark:via-[#0a0f1a] dark:to-[#020617] rounded-2xl flex items-center justify-center">
              <div className="text-center p-8">
                <div className="h-32 w-32 mx-auto bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
                  <span className="text-white font-bold text-4xl tracking-tight">VX</span>
                </div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">VERREX</p>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Excellence in Every Pane</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-slate-50 dark:bg-[#020617]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Quality", desc: "We use only premium materials and partner with top manufacturers to ensure lasting results." },
              { title: "Integrity", desc: "Transparent pricing, honest communication, and keeping our promises on every project." },
              { title: "Innovation", desc: "Staying ahead with the latest glass technologies and installation techniques." },
              { title: "Service", desc: "Going above and beyond to exceed client expectations at every touchpoint." },
            ].map((value) => (
              <Card key={value.title} className="text-center">
                <CardContent className="p-6">
                  <div className="h-12 w-12 mx-auto bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{value.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{value.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <Card key={member.name}>
                <CardContent className="p-6 text-center">
                  <div className="h-20 w-20 mx-auto bg-gradient-to-br from-slate-200 to-slate-300 dark:from-[#0f172a] dark:to-[#0a0f1a] rounded-full flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-slate-500 dark:text-slate-300" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{member.name}</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{member.role}</p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{member.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section id="partners" className="py-16 bg-slate-50 dark:bg-[#020617]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Partners & Affiliates</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">We work with industry-leading manufacturers and partners.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner) => (
              <Card key={partner.id}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      {partner.type === "manufacturer" ? <Globe className="h-6 w-6 text-slate-500 dark:text-slate-400" /> : <Handshake className="h-6 w-6 text-slate-500 dark:text-slate-400" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{partner.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{partner.type}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{partner.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 dark:bg-[#030712]">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Ready to Work With Us?</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Let&apos;s discuss your project and find the perfect solution.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact"><Button variant="primary" size="lg">Contact Us <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link href="/quote"><Button variant="outline" size="lg">Get a Quote</Button></Link>
          </div>
        </div>
      </section>
    </div>
  )
}
