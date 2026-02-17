"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { appointmentTimeSlots } from "@/lib/data"
import { Calendar, MapPin, Video, Building2, Wrench, Search, CheckCircle2, Clock } from "lucide-react"

const appointmentTypes = [
  { id: "on-site-measurement", label: "On-Site Measurement", icon: MapPin, desc: "A technician visits your location for precise measurements" },
  { id: "virtual-consultation", label: "Virtual Consultation", icon: Video, desc: "Video call with our experts from the comfort of your home" },
  { id: "showroom-visit", label: "Showroom Visit", icon: Building2, desc: "Visit our showroom to see products in person" },
  { id: "installation", label: "Installation", icon: Wrench, desc: "Schedule your window or glass installation" },
  { id: "inspection", label: "Site Inspection", icon: Search, desc: "Comprehensive evaluation of existing windows/glass" },
]

export default function AppointmentsPage() {
  const [submitted, setSubmitted] = useState(false)
  const [selectedType, setSelectedType] = useState("")
  const [selectedTime, setSelectedTime] = useState("")

  if (submitted) {
    return (
      <div className="py-20">
        <div className="mx-auto max-w-lg px-4 text-center">
          <div className="h-20 w-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Appointment Booked!</h1>
          <p className="mt-4 text-slate-600">Your appointment has been scheduled. You&apos;ll receive a confirmation email shortly with all the details.</p>
          <p className="mt-2 text-sm text-slate-500">We&apos;ll send you a reminder 24 hours before your appointment.</p>
          <div className="mt-8 flex gap-4 justify-center">
            <Button variant="primary" onClick={() => { setSubmitted(false); setSelectedType(""); setSelectedTime("") }}>Book Another</Button>
            <Link href="/"><Button variant="outline">Back to Home</Button></Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <section className="bg-slate-900 dark:bg-[#000000] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Book an Appointment</h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl">Schedule a consultation, measurement, or installation at a time that works for you.</p>
        </div>
      </section>

      <section className="py-12 dark:bg-[#030712]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }} className="space-y-8">
            {/* Appointment Type */}
            <Card>
              <CardHeader>
                <CardTitle>1. Select Appointment Type</CardTitle>
                <CardDescription>Choose the type of appointment you need.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {appointmentTypes.map((type) => (
                    <button key={type.id} type="button" onClick={() => setSelectedType(type.id)}
                      className={`p-4 rounded-lg border text-left transition-all ${selectedType === type.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500/20" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`}>
                      <type.icon className={`h-6 w-6 mb-2 ${selectedType === type.id ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                      <p className="font-medium text-sm dark:text-slate-200">{type.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{type.desc}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Date & Time */}
            <Card>
              <CardHeader>
                <CardTitle>2. Choose Date & Time</CardTitle>
                <CardDescription>Select your preferred date and time slot.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="date">Preferred Date *</Label>
                  <Input id="date" type="date" required min={new Date().toISOString().split("T")[0]} />
                </div>
                <div>
                  <Label>Preferred Time *</Label>
                  <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {appointmentTimeSlots.map((time) => (
                      <button key={time} type="button" onClick={() => setSelectedTime(time)}
                        className={`py-2 px-3 rounded-md border text-sm text-center transition-all ${selectedTime === time ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 dark:text-slate-300"}`}>
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>3. Your Information</CardTitle>
                <CardDescription>How can we reach you?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label htmlFor="name">Full Name *</Label><Input id="name" placeholder="John Smith" required /></div>
                  <div><Label htmlFor="email">Email *</Label><Input id="email" type="email" placeholder="john@example.com" required /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label htmlFor="phone">Phone *</Label><Input id="phone" type="tel" placeholder="(416) 555-0199" required /></div>
                  <div><Label htmlFor="location">Location / Address</Label><Input id="location" placeholder="123 Main St, Toronto" /></div>
                </div>
                <div><Label htmlFor="notes">Additional Notes</Label><Textarea id="notes" placeholder="Any specific details about your appointment..." rows={3} /></div>
              </CardContent>
            </Card>

            <Button type="submit" variant="primary" size="xl" className="w-full">
              <Calendar className="h-5 w-5" /> Confirm Appointment
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}
