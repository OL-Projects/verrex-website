const fs = require('fs');
const path = require('path');
const base = path.join(__dirname, '..', 'src', 'app', '[locale]');

// Pages that need generateMetadata (server components)
const serverPages = [
  {
    file: 'products/page.tsx',
    search: 'export default async function',
    metadata: `export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isEn = locale === 'en'
  return {
    title: isEn ? 'Products — Windows & Doors' : 'Produits — Fenêtres et portes',
    description: isEn ? 'Browse our complete range of premium windows and doors for residential, commercial, and industrial applications.' : 'Parcourez notre gamme complète de fenêtres et portes haut de gamme pour les applications résidentielles, commerciales et industrielles.',
    alternates: { canonical: 'https://verex.ca/' + locale + '/products', languages: { en: 'https://verex.ca/en/products', fr: 'https://verex.ca/fr/products' } },
  }
}\n\n`
  },
  {
    file: 'contact/page.tsx',
    search: 'export default',
    metadata: `export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with VEREX for premium windows and doors. Call, email, or visit our office for expert consultation on your fenestration project.',
  alternates: { languages: { en: 'https://verex.ca/en/contact', fr: 'https://verex.ca/fr/contact' } },
}\n\n`
  },
  {
    file: 'projects/page.tsx',
    search: 'export default async function',
    metadata: `export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isEn = locale === 'en'
  return {
    title: isEn ? 'Our Projects' : 'Nos projets',
    description: isEn ? 'Explore our portfolio of completed fenestration projects across residential, commercial, and industrial sectors.' : 'Explorez notre portfolio de projets de fenestration réalisés dans les secteurs résidentiel, commercial et industriel.',
    alternates: { canonical: 'https://verex.ca/' + locale + '/projects', languages: { en: 'https://verex.ca/en/projects', fr: 'https://verex.ca/fr/projects' } },
  }
}\n\n`
  },
  {
    file: 'catalog/page.tsx',
    search: 'export default',
    metadata: `export const metadata = {
  title: 'Product Catalog',
  description: 'Browse the complete VEREX product catalog featuring premium windows, doors, and fenestration systems with detailed specifications.',
  alternates: { languages: { en: 'https://verex.ca/en/catalog', fr: 'https://verex.ca/fr/catalog' } },
}\n\n`
  },
];

for (const page of serverPages) {
  const filePath = path.join(base, page.file);
  if (!fs.existsSync(filePath)) { console.log('⚠️ Skipping ' + page.file + ' (not found)'); continue; }
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('generateMetadata') || content.includes('export const metadata')) {
    console.log('⏭️ ' + page.file + ' already has metadata');
    continue;
  }
  const idx = content.indexOf(page.search);
  if (idx === -1) { console.log('⚠️ Could not find insertion point in ' + page.file); continue; }
  content = content.slice(0, idx) + page.metadata + content.slice(idx);
  fs.writeFileSync(filePath, content);
  console.log('✅ Added metadata to ' + page.file);
}
