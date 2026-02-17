export type ProductCategory = "residential" | "commercial" | "industrial"

export type ServiceType =
  | "installation"
  | "measurement"
  | "inspection"
  | "consultation"
  | "repair"
  | "custom"

export type AppointmentType =
  | "on-site-measurement"
  | "virtual-consultation"
  | "showroom-visit"
  | "installation"
  | "inspection"

export type QuoteStatus =
  | "pending"
  | "reviewed"
  | "sent"
  | "accepted"
  | "declined"
  | "expired"

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "rescheduled"

export interface Product {
  id: string
  name: string
  description: string
  shortDescription: string
  category: ProductCategory
  subcategory: string
  images: string[]
  features: string[]
  specifications: Record<string, string>
  priceRange: {
    min: number
    max: number
  }
  isCustomizable: boolean
  isFeatured: boolean
  tags: string[]
}

export interface Service {
  id: string
  name: string
  description: string
  icon: string
  type: ServiceType
  features: string[]
  estimatedDuration: string
}

export interface QuoteRequest {
  id: string
  quoteNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  projectType: ProductCategory
  serviceType: ServiceType
  description: string
  address: string
  preferredDate: string
  status: QuoteStatus
  estimatedAmount?: number
  notes?: string
  createdAt: string
}

export interface Appointment {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  type: AppointmentType
  date: string
  time: string
  duration: string
  location: string
  notes?: string
  status: AppointmentStatus
}

export interface Testimonial {
  id: string
  name: string
  role: string
  company?: string
  content: string
  rating: number
  image?: string
}

export interface Partner {
  id: string
  name: string
  logo: string
  description: string
  website: string
  type: "manufacturer" | "supplier" | "affiliate"
}

export interface Project {
  id: string
  title: string
  description: string
  shortDescription: string
  category: ProductCategory
  client: string
  location: string
  completionDate: string
  duration: string
  productsUsed: string[]
  squareFootage?: string
  images: string[]
  tags: string[]
  isFeatured: boolean
  testimonial?: {
    quote: string
    author: string
    role: string
  }
}

export interface ContactFormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  preferredContact: "email" | "phone" | "either"
}

export interface QuoteFormData {
  name: string
  email: string
  phone: string
  address: string
  projectType: ProductCategory
  serviceType: ServiceType
  description: string
  preferredDate: string
  preferredTime: string
  budget: string
  files?: FileList
}

export interface AppointmentFormData {
  name: string
  email: string
  phone: string
  type: AppointmentType
  date: string
  time: string
  location: string
  notes: string
}
