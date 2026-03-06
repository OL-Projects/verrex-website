const fs = require('fs');
const path = require('path');
const base = path.join(__dirname, '..', 'src', 'app', '[locale]');

// Remove metadata from client component files
['contact/page.tsx', 'catalog/page.tsx'].forEach(file => {
  const fp = path.join(base, file);
  let c = fs.readFileSync(fp, 'utf8');
  // Remove the metadata block we just added
  c = c.replace(/export const metadata = \{[\s\S]*?\}\n\n/, '');
  fs.writeFileSync(fp, c);
  console.log('Removed metadata from ' + file);
});

// Create layout.tsx files with metadata instead
const layouts = [
  {
    dir: 'contact',
    content: `import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | VEREX',
  description: 'Get in touch with VEREX for premium windows and doors. Call, email, or visit our office for expert consultation on your fenestration project.',
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
`
  },
  {
    dir: 'catalog',
    content: `import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Product Catalog | VEREX',
  description: 'Browse the complete VEREX product catalog featuring premium windows, doors, and fenestration systems with detailed specifications.',
}

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return children
}
`
  },
  {
    dir: 'quote',
    content: `import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get a Free Quote | VEREX',
  description: 'Request a free quote for premium windows and doors from VEREX. Fast response, competitive pricing, and expert consultation.',
}

export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  return children
}
`
  },
  {
    dir: 'appointments',
    content: `import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book an Appointment | VEREX',
  description: 'Schedule a consultation, on-site measurement, or virtual appointment with VEREX fenestration experts.',
}

export default function AppointmentsLayout({ children }: { children: React.ReactNode }) {
  return children
}
`
  },
];

for (const layout of layouts) {
  const layoutPath = path.join(base, layout.dir, 'layout.tsx');
  if (fs.existsSync(layoutPath)) { console.log('⏭️ ' + layout.dir + '/layout.tsx already exists'); continue; }
  fs.writeFileSync(layoutPath, layout.content);
  console.log('✅ Created ' + layout.dir + '/layout.tsx with metadata');
}
