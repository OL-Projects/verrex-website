"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { companyInfo } from "@/lib/data"
import { FileUpload } from "@/components/ui/file-upload"
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, Video, Loader2 } from "lucide-react"
import { useTranslations } from 'next-intl'
import { Link as IntlLink } from '@/i18n/navigation'
import { useToast } from "@/components/ui/use-toast"

function ContactPageContent() {
  const t = useTranslations('ContactPage')
  const { toast } = useToast()
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const [messageGlow, setMessageGlow] = useState(false)
  const searchParams = useSearchParams()
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const fromEmail = searchParams.get("focus") === "message"

  useEffect(() => {
    if (fromEmail && messageRef.current) {
      // Small delay to let page render, then scroll + focus + glow
      const timer = setTimeout(() => {
        messageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        setTimeout(() => {
          messageRef.current?.focus()
          setMessageGlow(true)
          // Remove glow after 3 seconds
          setTimeout(() => setMessageGlow(false), 3000)
        }, 600)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [fromEmail])

  const handleSendAnother = () => {
    setFadeOut(true)
    setTimeout(() => {
      setSubmitted(false)
      setFadeOut(false)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }, 500)
  }

  if (submitted) {
    return (
      <div className={`min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-[#030712] dark:to-[#020617] transition-all duration-500 ${fadeOut ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
        <style>{`
          @keyframes drawCheck { 0% { stroke-dashoffset: 50; } 100% { stroke-dashoffset: 0; } }
          @keyframes scaleIn { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
          @keyframes ripple { 0% { transform: scale(0.8); opacity: 0.6; } 100% { transform: scale(2.2); opacity: 0; } }
          @keyframes floatUp { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-80px) scale(0.5); opacity: 0; } }
          @keyframes slideUp { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
          .check-circle { animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
          .check-path { stroke-dasharray: 50; stroke-dashoffset: 50; animation: drawCheck 0.5s ease-out 0.5s forwards; }
          .ripple-1 { animation: ripple 1.5s ease-out 0.3s forwards; }
          .ripple-2 { animation: ripple 1.5s ease-out 0.6s forwards; }
          .ripple-3 { animation: ripple 1.5s ease-out 0.9s forwards; }
          .particle { animation: floatUp 1.2s ease-out forwards; }
          .slide-up-1 { opacity: 0; animation: slideUp 0.5s ease-out 0.7s forwards; }
          .slide-up-2 { opacity: 0; animation: slideUp 0.5s ease-out 0.9s forwards; }
          .slide-up-3 { opacity: 0; animation: slideUp 0.5s ease-out 1.1s forwards; }
          .slide-up-4 { opacity: 0; animation: slideUp 0.5s ease-out 1.3s forwards; }
        `}</style>
        <div className="mx-auto max-w-md px-6 py-20 text-center">
          {/* Animated SVG Checkmark */}
          <div className="relative mx-auto mb-10 h-28 w-28">
            {/* Ripple rings */}
            <div className="absolute inset-0 rounded-full bg-emerald-400/15 ripple-1" />
            <div className="absolute inset-0 rounded-full bg-emerald-400/10 ripple-2" />
            <div className="absolute inset-0 rounded-full bg-emerald-400/5 ripple-3" />
            {/* Floating particles */}
            {[...Array(8)].map((_, i) => (
              <div key={i} className="particle absolute" style={{
                left: '50%', top: '50%',
                width: `${4 + Math.random() * 6}px`, height: `${4 + Math.random() * 6}px`,
                borderRadius: '50%',
                background: i % 2 === 0 ? '#34d399' : '#60a5fa',
                transform: `rotate(${i * 45}deg) translateX(${30 + Math.random() * 20}px)`,
                animationDelay: `${0.4 + i * 0.08}s`,
              }} />
            ))}
            {/* Main circle + check */}
            <svg viewBox="0 0 100 100" className="w-full h-full check-circle">
              <defs>
                <linearGradient id="checkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="45" fill="url(#checkGrad)" />
              <path className="check-path" d="M30 52 L44 66 L70 38" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white slide-up-1">
            {t('successTitle')}
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 slide-up-2">
            {t('successDesc')}
          </p>
          <p className="mt-2 text-sm text-slate-400 dark:text-slate-500 slide-up-3">
            We typically respond within 24 hours
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center slide-up-4">
            <Button variant="primary" size="lg" onClick={handleSendAnother}>
              <Send className="h-4 w-4" /> {t('sendAnother')}
            </Button>
            <IntlLink href="/">
              <Button variant="outline" size="lg">Back to Home</Button>
            </IntlLink>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <section className="relative bg-slate-50 dark:bg-[#000000] py-20 overflow-hidden">
        {/* Light mode SVG */}
        <div className="absolute inset-0 dark:hidden">
          <Image src="/images/hero/hero-services-light.svg" alt="" fill className="object-cover" sizes="100vw" priority />
        </div>
        {/* Dark mode SVG */}
        <div className="absolute inset-0 hidden dark:block">
          <Image src="/images/hero/hero-services.svg" alt="" fill className="object-cover" sizes="100vw" priority />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/50 via-transparent to-transparent dark:from-black/70 z-10" />
        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl">{t('description')}</p>
        </div>
      </section>

      <section className="py-16 dark:bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">{t('getInTouch')}</h2>
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
                    <h3 className="font-semibold text-slate-900">{t('businessHours')}</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">{t('monFri').split(':')[0]}</span><span className="font-medium">{companyInfo.hours.weekdays}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">{t('saturday').split(':')[0]}</span><span className="font-medium">{companyInfo.hours.saturday}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">{t('sunday').split(':')[0]}</span><span className="font-medium">{companyInfo.hours.sunday}</span></div>
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
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('sendMessage')}</h2>
                  <form onSubmit={async (e) => {
                    e.preventDefault()
                    setSending(true)
                    const form = e.currentTarget
                    const formData = new FormData(form)
                    try {
                      const res = await fetch("/api/send-email", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          type: "contact",
                          name: formData.get("name"),
                          email: formData.get("email"),
                          phone: formData.get("phone"),
                          subject: formData.get("subject"),
                          message: formData.get("message"),
                          contactMethod: formData.get("contactMethod"),
                        }),
                      })
                      if (!res.ok) throw new Error("Failed to send")
                      toast({ title: "Message Sent!", description: "We'll get back to you shortly.", variant: "success" })
                      setSubmitted(true)
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    } catch {
                      toast({ title: "Failed to Send", description: "Please try again or call us directly.", variant: "error" })
                    } finally {
                      setSending(false)
                    }
                  }} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><Label htmlFor="name">{t('fullName')}</Label><Input id="name" name="name" placeholder={t('fullNamePlaceholder')} /></div>
                      <div><Label htmlFor="email">{t('email')} *</Label><Input id="email" name="email" type="email" placeholder={t('emailPlaceholder')} required /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><Label htmlFor="phone">{t('phone')}</Label><Input id="phone" name="phone" type="tel" placeholder={t('phonePlaceholder')} /></div>
                      <div>
                        <Label htmlFor="subject">{t('subject')}</Label>
                        <select id="subject" name="subject" className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
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
                      <div className="flex items-center justify-between">
                        <Label htmlFor="message">{t('message')}</Label>
                        {fromEmail && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                            <Mail className="h-3 w-3" />
                            To: admin@verex.ca
                          </span>
                        )}
                      </div>
                      <Textarea
                        ref={messageRef}
                        id="message"
                        name="message"
                        placeholder={t('messagePlaceholder')}
                        rows={5}
                        className={messageGlow ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-500" : "transition-all duration-500"}
                      />
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
                    <Button type="submit" variant="primary" size="lg" className="w-full" disabled={sending}>
                      {sending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : <><Send className="h-4 w-4" /> {t('submitBtn')}</>}
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

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-400">Loading...</div>}>
      <ContactPageContent />
    </Suspense>
  )
}
