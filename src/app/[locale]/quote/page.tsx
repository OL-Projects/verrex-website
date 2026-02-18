"use client"

import { useState, useMemo } from "react"
import { useTranslations } from 'next-intl'
import { Link as IntlLink } from '@/i18n/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, FileText, Upload, ArrowRight, ArrowLeft, Phone } from "lucide-react"

const steps = ["Contact Info", "Project Details", "Additional Info", "Review"]

export default function QuotePage() {
  const t = useTranslations('QuotePage')
  const [currentStep, setCurrentStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "",
    projectType: "", serviceType: "", description: "",
    preferredDate: "", preferredTime: "", budget: "",
  })

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="py-20">
        <div className="mx-auto max-w-lg px-4 text-center">
          <div className="h-20 w-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Quote Request Submitted!</h1>
          <p className="mt-4 text-slate-600">
            Thank you for your interest! Our team will review your request and get back to you within 24 hours with a detailed estimate.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Quote Reference: VRX-2026-PENDING
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Button variant="primary" onClick={() => { setSubmitted(false); setCurrentStep(0); setFormData({ name: "", email: "", phone: "", address: "", projectType: "", serviceType: "", description: "", preferredDate: "", preferredTime: "", budget: "" }) }}>
              Submit Another Quote
            </Button>
            <IntlLink href="/"><Button variant="outline">Back to Home</Button></IntlLink>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <section className="bg-slate-900 dark:bg-[#000000] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Request a Free Quote</h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl">
            Fill out the form below and our team will provide you with a detailed estimate for your project within 24 hours.
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
                  {currentStep === 0 && "Please provide your contact information."}
                  {currentStep === 1 && "Tell us about your project."}
                  {currentStep === 2 && "Any additional details that would help us."}
                  {currentStep === 3 && "Review your information before submitting."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Contact Info */}
                {currentStep === 0 && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><Label htmlFor="name">Full Name *</Label><Input id="name" value={formData.name} onChange={(e) => updateField("name", e.target.value)} placeholder="John Smith" required /></div>
                      <div><Label htmlFor="email">Email *</Label><Input id="email" type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} placeholder="john@example.com" required /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><Label htmlFor="phone">Phone *</Label><Input id="phone" type="tel" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="(416) 555-0199" required /></div>
                      <div><Label htmlFor="address">Project Address</Label><Input id="address" value={formData.address} onChange={(e) => updateField("address", e.target.value)} placeholder="123 Main St, Toronto" /></div>
                    </div>
                  </>
                )}

                {/* Step 2: Project Details */}
                {currentStep === 1 && (
                  <>
                    <div>
                      <Label>Project Type *</Label>
                      <div className="mt-2 grid grid-cols-3 gap-3">
                        {["residential", "commercial", "industrial"].map((type) => (
                          <button key={type} type="button" onClick={() => updateField("projectType", type)}
                            className={`p-4 rounded-lg border text-center capitalize transition-all ${formData.projectType === type ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 dark:text-slate-300"}`}>
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Service Needed *</Label>
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {["installation", "measurement", "inspection", "consultation", "repair", "custom"].map((type) => (
                          <button key={type} type="button" onClick={() => updateField("serviceType", type)}
                            className={`p-3 rounded-lg border text-sm text-center capitalize transition-all ${formData.serviceType === type ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 dark:text-slate-300"}`}>
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div><Label htmlFor="description">Project Description *</Label><Textarea id="description" value={formData.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Describe your project, including the number of windows/doors, sizes if known, and any special requirements..." rows={4} required /></div>
                  </>
                )}

                {/* Step 3: Additional Info */}
                {currentStep === 2 && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><Label htmlFor="preferredDate">Preferred Date</Label><Input id="preferredDate" type="date" value={formData.preferredDate} onChange={(e) => updateField("preferredDate", e.target.value)} /></div>
                      <div><Label htmlFor="preferredTime">Preferred Time</Label>
                        <select id="preferredTime" value={formData.preferredTime} onChange={(e) => updateField("preferredTime", e.target.value)}
                          className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                          <option value="">Select time</option>
                          <option value="morning">Morning (9AM-12PM)</option>
                          <option value="afternoon">Afternoon (12PM-4PM)</option>
                          <option value="evening">Evening (4PM-6PM)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label>Budget Range</Label>
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {["Under $1,000", "$1,000-$5,000", "$5,000-$15,000", "$15,000+"].map((budget) => (
                          <button key={budget} type="button" onClick={() => updateField("budget", budget)}
                            className={`p-3 rounded-lg border text-sm text-center transition-all ${formData.budget === budget ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 dark:text-slate-300"}`}>
                            {budget}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Upload Photos/Blueprints (Optional)</Label>
                      <div className="mt-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                        <p className="text-sm text-slate-500">Drag & drop files here, or click to browse</p>
                        <p className="text-xs text-slate-400 mt-1">JPG, PNG, PDF up to 10MB</p>
                      </div>
                    </div>
                  </>
                )}

                {/* Step 4: Review */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-slate-500">Name:</span><p className="font-medium">{formData.name || "—"}</p></div>
                      <div><span className="text-slate-500">Email:</span><p className="font-medium">{formData.email || "—"}</p></div>
                      <div><span className="text-slate-500">Phone:</span><p className="font-medium">{formData.phone || "—"}</p></div>
                      <div><span className="text-slate-500">Address:</span><p className="font-medium">{formData.address || "—"}</p></div>
                      <div><span className="text-slate-500">Project Type:</span><p className="font-medium capitalize">{formData.projectType || "—"}</p></div>
                      <div><span className="text-slate-500">Service:</span><p className="font-medium capitalize">{formData.serviceType || "—"}</p></div>
                      <div><span className="text-slate-500">Budget:</span><p className="font-medium">{formData.budget || "—"}</p></div>
                      <div><span className="text-slate-500">Preferred Date:</span><p className="font-medium">{formData.preferredDate || "—"}</p></div>
                    </div>
                    <div><span className="text-sm text-slate-500">Description:</span><p className="text-sm font-medium mt-1">{formData.description || "—"}</p></div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}>
                    <ArrowLeft className="h-4 w-4" /> Previous
                  </Button>
                  {currentStep < steps.length - 1 ? (
                    <Button type="button" variant="primary" onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}>
                      Next <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="submit" variant="primary">
                      <FileText className="h-4 w-4" /> Submit Quote Request
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Need immediate assistance? Call us at{" "}
              <a href="tel:(416) 555-0199" className="text-blue-600 font-medium">(416) 555-0199</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
