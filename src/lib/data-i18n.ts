import { products as rawProducts } from "./data"
import type { Product } from "@/types"

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

/** Safe translation that returns empty string instead of throwing */
function safeTrans(t: (key: string) => string, key: string): string {
  try {
    const result = t(key)
    // next-intl returns the key path if not found
    if (result === key || result.startsWith("ProductData.")) return ""
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
