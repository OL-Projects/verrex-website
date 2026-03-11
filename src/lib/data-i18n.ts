import { products as rawProducts, services as rawServices, testimonials as rawTestimonials } from "./data"
import type { Product, Service, Testimonial } from "@/types"

/**
 * Returns localized product data using translation function.
 * Works with both useTranslations('ProductData') and getTranslations('ProductData').
 */
export function getLocalizedProducts(
  t: (key: string) => string
): Product[] {
  return rawProducts.map((p) => {
    // Try to get translated name; fall back to raw data
    const name = safeTrans(t, `${p.id}.name`) || p.name
    const description = safeTrans(t, `${p.id}.description`) || p.description
    const shortDescription = safeTrans(t, `${p.id}.shortDescription`) || p.shortDescription
    const subcategory = (safeTrans(t, `subcategory.${p.subcategory}`) || p.subcategory) as "Windows" | "Doors"

    // Translate features
    const features = p.features.map((feat, i) => {
      const translated = safeTrans(t, `${p.id}.feature${i + 1}`)
      return translated || feat
    })

    // Translate specification keys and values
    const specs: Record<string, string> = {}
    Object.entries(p.specifications).forEach(([key, val]) => {
      const tKey = safeTrans(t, `specKey.${normalizeKey(key)}`) || key
      const tVal = safeTrans(t, `specVal.${normalizeKey(val)}`) || val
      specs[tKey] = tVal
    })

    return {
      ...p,
      name,
      description,
      shortDescription,
      subcategory,
      features,
      specifications: specs,
    }
  })
}

/**
 * Returns localized service data using translation function.
 * Works with both useTranslations('ServiceData') and getTranslations('ServiceData').
 */
export function getLocalizedServices(
  t: (key: string) => string
): Service[] {
  return rawServices.map((s) => {
    const name = safeTrans(t, `${s.id}.name`) || s.name
    const description = safeTrans(t, `${s.id}.description`) || s.description
    const duration = safeTrans(t, `duration.${s.id}`) || s.estimatedDuration
    const features = s.features.map((feat, i) => {
      const translated = safeTrans(t, `${s.id}.features.${i}`)
      return translated || feat
    })
    return { ...s, name, description, features, estimatedDuration: duration }
  })
}

/**
 * Returns localized testimonial data using translation function.
 * Works with both useTranslations('TestimonialData') and getTranslations('TestimonialData').
 */
export function getLocalizedTestimonials(
  t: (key: string) => string
): Testimonial[] {
  return rawTestimonials.map((tm) => {
    const content = safeTrans(t, `${tm.id}.content`) || tm.content
    const role = safeTrans(t, `${tm.id}.role`) || tm.role
    return { ...tm, content, role }
  })
}

/** Safe translation that returns empty string instead of throwing */
function safeTrans(t: (key: string) => string, key: string): string {
  try {
    const result = t(key)
    // next-intl returns the key path if not found
    if (result === key || result.startsWith("ProductData.") || result.startsWith("ServiceData.") || result.startsWith("TestimonialData.")) return ""
    return result
  } catch {
    return ""
  }
}

/** Normalize a specification key/value to a translation key */
function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .replace(/[®™]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
}
