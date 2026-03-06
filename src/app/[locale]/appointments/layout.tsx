import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book an Appointment | VEREX',
  description: 'Schedule a consultation, on-site measurement, or virtual appointment with VEREX fenestration experts.',
}

export default function AppointmentsLayout({ children }: { children: React.ReactNode }) {
  return children
}
