"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { companyInfo } from "@/lib/data"
import { FileUpload } from "@/components/ui/file-upload"
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, MessageSquare, Video } from "lucide-react"

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="py-20">
        <div className="mx-auto max-w-lg px-4 text-center">
          <div className="h-20 w-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Message Sent!</h1>
          <p className="mt-4 text-slate-600">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
          <Button variant="primary" className="mt-8" onClick={() => setSubmitted(false)}>Send Another Message</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <section className="bg-slate-900 dark:bg-[#000000] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Contact Us</h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl">Have questions? We&apos;d love to hear from you. Reach out through any of the methods below.</p>
        </div>
      </section>

      <section className="py-16 dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Get in Touch</h2>
              <p className="text-slate-600">Reach us by phone, email, or visit our office. We&apos;re here to help with all your window and door needs.</p>

              <div className="space-y-4">
                {[
                  { icon: Phone, label: "Phone", value: companyInfo.phone, href: `tel:${companyInfo.phone}` },
                  { icon: Mail, label: "Email", value: companyInfo.email, href: `mailto:${companyInfo.email}` },
                  { icon: MapPin, label: "Address", value: companyInfo.address, href: "#" },
                ].map((item) => (
                  <a key={item.label} href={item.href} className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.label}</p>
                      <p className="text-sm text-slate-600">{item.value}</p>
                    </div>
                  </a>
                ))}
              </div>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-slate-900">Business Hours</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Monday - Friday</span><span className="font-medium">{companyInfo.hours.weekdays}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Saturday</span><span className="font-medium">{companyInfo.hours.saturday}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Sunday</span><span className="font-medium">{companyInfo.hours.sunday}</span></div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <Card className="cursor-pointer hover:shadow-md transition-all">
                  <CardContent className="p-4 text-center">
                    <MessageSquare className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Live Chat</p>
                    <p className="text-xs text-slate-500">Coming Soon</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-all">
                  <CardContent className="p-4 text-center">
                    <Video className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Video Call</p>
                    <p className="text-xs text-slate-500">Book Online</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Send Us a Message</h2>
                  <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><Label htmlFor="name">Full Name *</Label><Input id="name" placeholder="John Smith" required /></div>
                      <div><Label htmlFor="email">Email *</Label><Input id="email" type="email" placeholder="john@example.com" required /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><Label htmlFor="phone">Phone</Label><Input id="phone" type="tel" placeholder="(416) 555-0199" /></div>
                      <div>
                        <Label htmlFor="subject">Subject *</Label>
                        <select id="subject" required className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                          <option value="">Select a subject</option>
                          <option value="general">General Inquiry</option>
                          <option value="quote">Quote Request</option>
                          <option value="installation">Installation Question</option>
                          <option value="support">Support</option>
                          <option value="partnership">Partnership</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea id="message" placeholder="How can we help you?" rows={5} required />
                    </div>
                    <div>
                      <Label>Attachments</Label>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Add photos of your windows or relevant documents</p>
                      <FileUpload maxFiles={5} maxSizeMB={10} />
                    </div>
                    <div>
                      <Label>Preferred Contact Method</Label>
                      <div className="mt-2 flex gap-4">
                        {["Email", "Phone", "Either"].map((method) => (
                          <label key={method} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                            <input type="radio" name="contactMethod" value={method.toLowerCase()} defaultChecked={method === "Either"} className="text-blue-600" />
                            {method}
                          </label>
                        ))}
                      </div>
                    </div>
                    <Button type="submit" variant="primary" size="lg" className="w-full">
                      <Send className="h-4 w-4" /> Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
