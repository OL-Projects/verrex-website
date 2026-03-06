import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | VEREX',
  description: 'Get in touch with VEREX for premium windows and doors. Call, email, or visit our office for expert consultation on your fenestration project.',
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
