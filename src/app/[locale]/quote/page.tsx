"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { useTranslations } from 'next-intl'
import { Link as IntlLink } from '@/i18n/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, FileText, Upload, ArrowRight, ArrowLeft, Phone, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function QuotePage() {
  const t = useTranslations('QuotePage')
  const steps = [t("step1"), t("step2"), t("step3"), t("step4")]
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "",
    projectType: "", serviceType: "", description: "",
    preferredDate: "", preferredTime: "", budget: "",
  })

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "quote", ...formData }),
      })
      if (!res.ok) throw new Error("Failed to send")
      toast({ title: t("toastSuccessTitle"), description: t("toastSuccessDesc"), variant: "success" })
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch {
      toast({ title: t("toastFailedTitle"), description: t("toastFailedDesc"), variant: "error" })
    } finally {
      setSending(false)
    }
  }

  if (submitted) {
    return (
      <div className="py-20">
        <div className="mx-auto max-w-lg px-4 text-center">
          <div className="h-20 w-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{t("successTitle")}</h1>
          <p className="mt-4 text-slate-600">
            {t("successDesc")}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {t("quoteReference")}: VRX-2026-PENDING
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Button variant="primary" onClick={() => { setSubmitted(false); setCurrentStep(0); setFormData({ name: "", email: "", phone: "", address: "", projectType: "", serviceType: "", description: "", preferredDate: "", preferredTime: "", budget: "" }) }}>
              {t("submitAnother")}
            </Button>
            <IntlLink href="/"><Button variant="outline">{t("backToHome")}</Button></IntlLink>
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
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t("title")}</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
            {t("description")}
          </p>
        </div>
      </section>

      <section className="py-12 dark:bg-[#030712]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium ${index <= currentStep ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                    {index < currentStep ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                  </div>
                  <span className={`ml-2 text-sm hidden sm:inline ${index <= currentStep ? "text-blue-600 font-medium" : "text-slate-500"}`}>
                    {step}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`mx-4 h-0.5 w-8 sm:w-16 ${index < currentStep ? "bg-blue-600" : "bg-slate-200"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>{steps[currentStep]}</CardTitle>
                <CardDescription>
                  {currentStep === 0 && t("contactInfo")}
                  {currentStep === 1 && t("projectDetails")}
                  {currentStep === 2 && t("additionalInfo")}
                  {currentStep === 3 && t("reviewTitle")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Contact Info */}
                {currentStep === 0 && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><Label htmlFor="name">{t("firstName")} *</Label><Input id="name" value={formData.name} onChange={(e) => updateField("name", e.target.value)} placeholder="John Smith" required /></div>
                      <div><Label htmlFor="email">{t("email")} *</Label><Input id="email" type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} placeholder="john@example.com" required /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><Label htmlFor="phone">{t("phone")} *</Label><Input id="phone" type="tel" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="(514) 992-4080" required /></div>
                      <div><Label htmlFor="address">{t("address")}</Label><Input id="address" value={formData.address} onChange={(e) => updateField("address", e.target.value)} placeholder="135 Evergreen Dr., Beaconsfield" /></div>
                    </div>
                  </>
                )}

                {/* Step 2: Project Details */}
                {currentStep === 1 && (
                  <>
                    <div>
                      <Label>{t("projectType")} *</Label>
                      <div className="mt-2 grid grid-cols-3 gap-3">
                        {[
                          { key: "residential", label: t("typeResidential") },
                          { key: "commercial", label: t("typeCommercial") },
                          { key: "industrial", label: t("typeIndustrial") },
                        ].map((type) => (
                          <button key={type.key} type="button" onClick={() => updateField("projectType", type.key)}
                            className={`p-4 rounded-lg border text-center transition-all ${formData.projectType === type.key ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 dark:text-slate-300"}`}>
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>{t("projectScope")} *</Label>
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { key: "installation", label: t("scopeInstallation") },
                          { key: "measurement", label: t("scopeMeasurement") },
                          { key: "inspection", label: t("scopeInspection") },
                          { key: "consultation", label: t("scopeConsultation") },
                          { key: "repair", label: t("scopeRepair") },
                          { key: "custom", label: t("scopeCustom") },
                        ].map((type) => (
                          <button key={type.key} type="button" onClick={() => updateField("serviceType", type.key)}
                            className={`p-3 rounded-lg border text-sm text-center transition-all ${formData.serviceType === type.key ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 dark:text-slate-300"}`}>
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div><Label htmlFor="description">{t("additionalDetails")} *</Label><Textarea id="description" value={formData.description} onChange={(e) => updateField("description", e.target.value)} placeholder={t("descriptionPlaceholder")} rows={4} required /></div>
                  </>
                )}

                {/* Step 3: Additional Info */}
                {currentStep === 2 && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><Label htmlFor="preferredDate">{t("preferredDate")}</Label><Input id="preferredDate" type="date" value={formData.preferredDate} onChange={(e) => updateField("preferredDate", e.target.value)} /></div>
                      <div><Label htmlFor="preferredTime">{t("preferredTime")}</Label>
                        <select id="preferredTime" value={formData.preferredTime} onChange={(e) => updateField("preferredTime", e.target.value)}
                          className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                          <option value="">{t("selectTime")}</option>
                          <option value="morning">{t("timeMorning")}</option>
                          <option value="afternoon">{t("timeAfternoon")}</option>
                          <option value="evening">{t("timeEvening")}</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label>{t("budget")}</Label>
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { key: "under1k", label: t("budgetUnder1k") },
                          { key: "1kTo5k", label: t("budget1kTo5k") },
                          { key: "5kTo15k", label: t("budget5kTo15k") },
                          { key: "15kPlus", label: t("budget15kPlus") },
                        ].map((budget) => (
                          <button key={budget.key} type="button" onClick={() => updateField("budget", budget.key)}
                            className={`p-3 rounded-lg border text-sm text-center transition-all ${formData.budget === budget.key ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 dark:text-slate-300"}`}>
                            {budget.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>{t("uploadPhotos")}</Label>
                      <div className="mt-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                        <p className="text-sm text-slate-500">{t("dragDropText")}</p>
                        <p className="text-xs text-slate-400 mt-1">{t("fileFormats")}</p>
                      </div>
                    </div>
                  </>
                )}

                {/* Step 4: Review */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-slate-500">{t("reviewName")}</span><p className="font-medium">{formData.name || "—"}</p></div>
                      <div><span className="text-slate-500">{t("reviewEmail")}</span><p className="font-medium">{formData.email || "—"}</p></div>
                      <div><span className="text-slate-500">{t("reviewPhone")}</span><p className="font-medium">{formData.phone || "—"}</p></div>
                      <div><span className="text-slate-500">{t("reviewAddress")}</span><p className="font-medium">{formData.address || "—"}</p></div>
                      <div><span className="text-slate-500">{t("reviewProjectType")}</span><p className="font-medium capitalize">{formData.projectType || "—"}</p></div>
                      <div><span className="text-slate-500">{t("reviewService")}</span><p className="font-medium capitalize">{formData.serviceType || "—"}</p></div>
                      <div><span className="text-slate-500">{t("reviewBudget")}</span><p className="font-medium">{formData.budget || "—"}</p></div>
                      <div><span className="text-slate-500">{t("reviewPreferredDate")}</span><p className="font-medium">{formData.preferredDate || "—"}</p></div>
                    </div>
                    <div><span className="text-sm text-slate-500">{t("reviewDescription")}</span><p className="text-sm font-medium mt-1">{formData.description || "—"}</p></div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}>
                    <ArrowLeft className="h-4 w-4" /> {t("back")}
                  </Button>
                  {currentStep < steps.length - 1 ? (
                    <Button type="button" variant="primary" onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}>
                      {t("next")} <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="submit" variant="primary" disabled={sending}>
                      {sending ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("sending")}</> : <><FileText className="h-4 w-4" /> {t("submitRequest")}</>}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              {t("needHelp")}{" "}
              <a href="tel:+15149924080" className="text-blue-600 font-medium">(514) 992-4080</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
