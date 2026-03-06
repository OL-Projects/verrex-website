import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Product Catalog | VEREX',
  description: 'Browse the complete VEREX product catalog featuring premium windows, doors, and fenestration systems with detailed specifications.',
}

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return children
}
