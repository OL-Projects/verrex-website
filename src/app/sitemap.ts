import type { MetadataRoute } from 'next'

const baseUrl = 'https://verex.ca'

const routes = [
  '',
  '/about',
  '/products',
  '/products/windows',
  '/products/doors',
  '/products/window-types',
  '/services',
  '/projects',
  '/catalog',
  '/contact',
  '/quote',
  '/appointments',
  '/search',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['en', 'fr']
  const entries: MetadataRoute.Sitemap = []

  for (const route of routes) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1.0 : route === '/products' ? 0.9 : 0.7,
        alternates: {
          languages: {
            en: `${baseUrl}/en${route}`,
            fr: `${baseUrl}/fr${route}`,
          },
        },
      })
    }
  }

  return entries
}
