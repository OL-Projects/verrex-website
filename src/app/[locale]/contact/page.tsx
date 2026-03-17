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
import { Phone, Mail, MapPin, Clock, Send, Loader2 } from "lucide-react"
import { useTranslations } from 'next-intl'
import { Link as IntlLink } from '@/i18n/navigation'
import { useToast } from "@/components/ui/use-toast"

function ContactPageContent() {
  const t = useTranslations('ContactPage')
  const { toast } = useToast()
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const [formEntering, setFormEntering] = useState(false)
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

  // Deterministic particle positions (no Math.random in render)
  const particles = [
    { size: 6, x: -40, y: -30, color: '#34d399' },
    { size: 8, x: 35, y: -35, color: '#60a5fa' },
    { size: 5, x: 45, y: 5, color: '#34d399' },
    { size: 7, x: 30, y: 40, color: '#60a5fa' },
    { size: 6, x: -10, y: 45, color: '#34d399' },
    { size: 8, x: -45, y: 25, color: '#60a5fa' },
    { size: 5, x: -35, y: -5, color: '#34d399' },
    { size: 7, x: 10, y: -45, color: '#60a5fa' },
  ]

  const handleSendAnother = () => {
    setFadeOut(true)
    setTimeout(() => {
      setSubmitted(false)
      setFadeOut(false)
      setFormEntering(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
      // Clear entrance animation flag after it completes
      setTimeout(() => setFormEntering(false), 600)
    }, 500)
  }

  if (submitted) {
    return (
      <div className={`min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-[#030712] dark:to-[#020617] transition-all duration-500 ${fadeOut ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
        <div className="mx-auto max-w-md px-6 py-20 text-center">
          {/* Animated SVG Checkmark */}
          <div className="relative mx-auto mb-10 h-28 w-28">
            {/* Ripple rings */}
            <div className="absolute inset-0 rounded-full bg-emerald-400/15 success-ripple-1" />
            <div className="absolute inset-0 rounded-full bg-emerald-400/10 success-ripple-2" />
            <div className="absolute inset-0 rounded-full bg-emerald-400/5 success-ripple-3" />
            {/* Floating particles — deterministic positions via top/left offsets */}
            {particles.map((p, i) => (
              <div key={i} className="success-particle absolute rounded-full" style={{
                left: `calc(50% + ${p.x}px)`,
                top: `calc(50% + ${p.y}px)`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: p.color,
                animationDelay: `${0.4 + i * 0.08}s`,
              }} />
            ))}
            {/* Main circle + check */}
            <svg viewBox="0 0 100 100" className="w-full h-full success-check-circle">
              <defs>
                <linearGradient id="checkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="45" fill="url(#checkGrad)" />
              <path className="success-check-path" d="M30 52 L44 66 L70 38" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white success-slide-1">
            {t('successTitle')}
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 success-slide-2">
            {t('successDesc')}
          </p>
          <p className="mt-2 text-sm text-slate-400 dark:text-slate-500 success-slide-3">
            {t('responseTime')}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center success-slide-4">
            <Button variant="primary" size="lg" onClick={handleSendAnother}>
              <Send className="h-4 w-4" /> {t('sendAnother')}
            </Button>
            <IntlLink href="/">
              <Button variant="outline" size="lg">{t('backToHome')}</Button>
            </IntlLink>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={formEntering ? "form-entrance" : ""}>
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
              <p className="text-slate-600">{t('getInTouchDesc')}</p>

              <div className="space-y-4">
                {[
                  { icon: Phone, label: t('phoneLabel'), value: companyInfo.phone, href: `tel:${companyInfo.phone}`, key: "phone" },
                  { icon: Mail, label: t('emailLabel'), value: companyInfo.email, href: `mailto:${companyInfo.email}`, key: "email" },
                  { icon: MapPin, label: t('addressLabel'), value: companyInfo.address, href: "https://www.google.com/maps/search/?api=1&query=135+Evergreen+Dr+Beaconsfield+QC", key: "address" },
                ].map((item) => (
                  <a key={item.key} href={item.href} className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
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
                      setSubmitted(true)
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    } catch {
                      toast({ title: t('toastFailedTitle'), description: t('toastFailedDesc'), variant: "error" })
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
                          <option value="">{t('selectSubject')}</option>
                          <option value="general">{t('subjectGeneral')}</option>
                          <option value="quote">{t('subjectQuote')}</option>
                          <option value="installation">{t('subjectInstallation')}</option>
                          <option value="support">{t('subjectSupport')}</option>
                          <option value="partnership">{t('subjectPartnership')}</option>
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
                      <Label>{t('attachments')}</Label>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t('attachmentsDesc')}</p>
                      <FileUpload maxFiles={5} maxSizeMB={10} />
                    </div>
                    <div>
                      <Label>{t('preferredContact')}</Label>
                      <div className="mt-2 flex gap-4">
                        {[
                          { key: "email", label: t('contactEmail'), value: "email" },
                          { key: "phone", label: t('contactPhone'), value: "phone" },
                          { key: "either", label: t('contactEither'), value: "either" },
                        ].map((method) => (
                          <label key={method.key} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                            <input type="radio" name="contactMethod" value={method.value} defaultChecked={method.key === "either"} className="text-blue-600" />
                            {method.label}
                          </label>
                        ))}
                      </div>
                    </div>
                    <Button type="submit" variant="primary" size="lg" className="w-full" disabled={sending}>
                      {sending ? <><Loader2 className="h-4 w-4 animate-spin" /> {t('sending')}</> : <><Send className="h-4 w-4" /> {t('submitBtn')}</>}
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
    <Suspense fallback={<div className="py-20 text-center text-slate-400"></div>}>
      <ContactPageContent />
    </Suspense>
  )
}
