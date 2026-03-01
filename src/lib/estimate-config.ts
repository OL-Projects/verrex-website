// ── Window & Door Type Configs ──────────────────
export type TypeCategory = "window" | "door"
export interface WindowTypeConfig { modules: string[]; label: string; category: TypeCategory; group: string }

export const WINDOW_TYPES: Record<string, WindowTypeConfig> = {
  // ── WINDOWS ──
  FIX:                  { modules: ["FIX"],                          label: "Fixed",                       category: "window", group: "Windows" },
  "TOP-HUNG":           { modules: ["AWNING"],                       label: "Top Hung (Awning)",           category: "window", group: "Windows" },
  SLIDER:               { modules: ["SLIDE", "FIX"],                 label: "Horizontal Slider",           category: "window", group: "Windows" },
  "CAS-L":              { modules: ["CAS-L"],                        label: "Casement Left — Crank Out",   category: "window", group: "Windows" },
  "CAS-R":              { modules: ["CAS-R"],                        label: "Casement Right — Crank Out",  category: "window", group: "Windows" },
  "TT-L":               { modules: ["TT-L"],                         label: "Tilt & Turn Left (Inswing)",  category: "window", group: "Windows" },
  "TT-R":               { modules: ["TT-R"],                         label: "Tilt & Turn Right (Inswing)", category: "window", group: "Windows" },
  "CAS-L+FIX":          { modules: ["CAS-L", "FIX"],                label: "Casement L + Fixed",          category: "window", group: "Windows — Combo" },
  "FIX+CAS-R":          { modules: ["FIX", "CAS-R"],                label: "Fixed + Casement R",          category: "window", group: "Windows — Combo" },
  "TT-L+FIX":           { modules: ["TT-L", "FIX"],                 label: "Tilt & Turn L + Fixed",       category: "window", group: "Windows — Combo" },
  "FIX+TT-R":           { modules: ["FIX", "TT-R"],                 label: "Fixed + Tilt & Turn R",       category: "window", group: "Windows — Combo" },
  "CAS-L+FIX+FIX":      { modules: ["CAS-L", "FIX", "FIX"],        label: "Casement L + 2 Fixed",        category: "window", group: "Windows — Combo" },
  "FIX+FIX+FIX":        { modules: ["FIX", "FIX", "FIX"],          label: "3 Fixed Panoramic",           category: "window", group: "Windows — Combo" },
  "FIX+FIX+CAS-R":      { modules: ["FIX", "FIX", "CAS-R"],        label: "2 Fixed + Casement R",        category: "window", group: "Windows — Combo" },
  "CAS-L+FIX+FIX+FIX":  { modules: ["CAS-L", "FIX", "FIX", "FIX"],label: "Casement L + 3 Fixed",        category: "window", group: "Windows — Combo" },
  // ── DOORS ──
  "SWING-L-IN":         { modules: ["SWING-L-IN"],                   label: "Swing Door — Left Inswing",   category: "door", group: "Doors — Swing" },
  "SWING-R-IN":         { modules: ["SWING-R-IN"],                   label: "Swing Door — Right Inswing",  category: "door", group: "Doors — Swing" },
  "SWING-L-OUT":        { modules: ["SWING-L-OUT"],                  label: "Swing Door — Left Outswing",  category: "door", group: "Doors — Swing" },
  "SWING-R-OUT":        { modules: ["SWING-R-OUT"],                  label: "Swing Door — Right Outswing", category: "door", group: "Doors — Swing" },
  "SWING-FRENCH":       { modules: ["SWING-L-IN", "SWING-R-IN"],    label: "French Door (Double Swing)",   category: "door", group: "Doors — Swing" },
  "SLIDE-DOOR-2":       { modules: ["SLIDE-D", "FIX-D"],            label: "Sliding Door — 2 Panel",      category: "door", group: "Doors — Sliding" },
  "SLIDE-DOOR-3":       { modules: ["SLIDE-D", "FIX-D", "SLIDE-D"], label: "Sliding Door — 3 Panel",      category: "door", group: "Doors — Sliding" },
  "FOLD-2":             { modules: ["FOLD", "FOLD"],                 label: "Folding Door — 2 Panel",      category: "door", group: "Doors — Folding" },
  "FOLD-4":             { modules: ["FOLD", "FOLD", "FOLD", "FOLD"], label: "Folding Door — 4 Panel",      category: "door", group: "Doors — Folding" },
}

/** Get unique groups for optgroup rendering */
export function getTypeGroups(): { group: string; types: [string, WindowTypeConfig][] }[] {
  const map = new Map<string, [string, WindowTypeConfig][]>()
  Object.entries(WINDOW_TYPES).forEach(([k, v]) => {
    const arr = map.get(v.group) || []; arr.push([k, v]); map.set(v.group, arr)
  })
  return Array.from(map.entries()).map(([group, types]) => ({ group, types }))
}

export function isDoorType(typeKey: string): boolean { return WINDOW_TYPES[typeKey]?.category === "door" }

export const PRODUCTS = [
  { id: "double-tempered", label: "Double Tempered Glass", tag: "DTG", cls: "bg-blue-600 dark:bg-blue-700 text-white" },
  { id: "triple-tempered", label: "Triple Tempered Glass", tag: "TTG", cls: "bg-slate-900 dark:bg-slate-700 text-white" },
  { id: "hybrid",     label: '4600 Hybrid PVC/ALU 5¾"', tag: "HYBRID PVC/ALU", cls: "bg-slate-600 dark:bg-slate-600 text-white" },
  { id: "pvc",        label: '4600 PVC 5¼"',            tag: "PVC",            cls: "bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white" },
  { id: "pvc-slider", label: '4000 PVC 5¼" — Slider',   tag: "PVC SLIDER",     cls: "bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white" },
] as const

export const DEFAULT_EXT_COLORS = ["White", "Grey", "Wood Grain", "Walnut Wood", "Cherry", "Black"]
export const DEFAULT_INT_COLORS = ["White", "Grey", "Wood Grain", "Walnut Wood", "Cherry", "Black"]

// ── Data Models ─────────────────────────────────
export interface EstimateItem {
  id: string
  type: string
  product: string
  extColor: string
  intColor: string
  width: number
  height: number
  depth: number
  thickness: number     // glass thickness in mm
  customLabel: string   // e.g. "Front – 2nd Floor"
  location: string      // kept for legacy compat
  qty: number
  unitPrice: number
  notes: string
  attachmentNames: string[] // file names only (not uploaded)
  hingeLeft: boolean    // flip SVG render left/right
  trimInstall: boolean  // enable trim installation for this item
  trimStyle: "flat" | "colonial"  // trim profile style
  trimPrice: number     // trim installation cost (per unit)
}

export interface Room {
  id: string
  name: string
  items: EstimateItem[]
}

export interface CompanyInfo {
  name: string
  tagline: string
  address: string
  city: string
  phone: string
  email: string
  website: string
  logoUrl: string // base64 data URL
}

export interface EstimateState {
  company: CompanyInfo
  estimateNumber: string
  date: string
  validUntil: string
  requiredBy: string
  soldToLabel: string
  clientName: string
  clientAddress: string
  clientCity: string
  clientPhone: string
  clientEmail: string
  shipToLabel: string
  shipMethod: string
  shipAddress: string
  shipPhone: string
  repName: string
  repRef: string
  rooms: Room[]
  installPerUnit: number
  delivery: number
  depositPct: number
  termsLines: string[]
}

// ── Defaults / Factories ────────────────────────
let _c = Date.now()
function uid(p: string) { return `${p}_${(++_c).toString(36)}` }

export function createItem(): EstimateItem {
  return {
    id: uid("itm"), type: "CAS-L+FIX", product: "double-tempered",
    extColor: "White", intColor: "White",
    width: 48, height: 48, depth: 5.75, thickness: 4,
    customLabel: "", location: "", qty: 1, unitPrice: 0,
    notes: "", attachmentNames: [],
    hingeLeft: false, trimInstall: false, trimStyle: "flat", trimPrice: 0,
  }
}

export function createRoom(name = "Room"): Room {
  return { id: uid("rm"), name, items: [createItem()] }
}

export const DEFAULT_TERMS = [
  "This estimate is valid for 30 days from issue date.",
  "A deposit of 30% is required at contract signing. Remaining 70% due 24 hours before delivery.",
  "Approximate delivery as per required-by date — subject to manufacturer lead times.",
  "All products carry full manufacturer warranty. Installation warranty provided separately.",
  "Any modifications must be submitted in writing and may affect pricing and delivery timelines.",
  "The value of delivered/installed products must be paid upon receipt of merchandise.",
  "Prices include all listed products and services. Additional work quoted separately.",
]

export function defaultCompany(): CompanyInfo {
  return { name: "VEREX", tagline: "WINDOWS & DOORS — FENÊTRES & PORTES", address: "", city: "", phone: "", email: "", website: "VEREX-website.vercel.app", logoUrl: "" }
}

export function createBlankEstimate(): EstimateState {
  return {
    company: defaultCompany(),
    estimateNumber: "VX-2025-0001",
    date: new Date().toISOString().slice(0, 10),
    validUntil: "", requiredBy: "",
    soldToLabel: "Sold To", clientName: "", clientAddress: "", clientCity: "", clientPhone: "", clientEmail: "",
    shipToLabel: "Ship To", shipMethod: "PICKUP", shipAddress: "", shipPhone: "",
    repName: "", repRef: "",
    rooms: [createRoom("GROUND FLOOR")],
    installPerUnit: 275, delivery: 850, depositPct: 30,
    termsLines: [...DEFAULT_TERMS],
  }
}

// ── Glass Rate Unit Labels ──────────────────────
export const GLASS_RATE_UNITS = [
  { id: "sqin" as const, label: "per sq inch", short: "/sq in" },
  { id: "sqft" as const, label: "per sq foot", short: "/sq ft" },
  { id: "sqm" as const, label: "per sq meter", short: "/sq m" },
]

export type GlassRateUnit = "sqin" | "sqft" | "sqm"

/** Compute glass area in the chosen unit (width & height are always in inches) */
export function glassArea(widthIn: number, heightIn: number, unit: GlassRateUnit): number {
  switch (unit) {
    case "sqft": return (widthIn / 12) * (heightIn / 12)
    case "sqm":  return (widthIn * 0.0254) * (heightIn * 0.0254)
    default:     return widthIn * heightIn // sqin
  }
}

/**
 * Compute the calculated glass price for an item.
 * Pass the relevant settings fields (works for both windows and doors).
 */
export function computeCalculatedPrice(
  item: EstimateItem,
  rate: number,
  unit: GlassRateUnit,
): number {
  if (rate <= 0) return 0
  const area = glassArea(item.width, item.height, unit)
  return area * rate
}

/**
 * Get the correct glass rate for an item based on its product and whether it's a door.
 * Returns { rate, unit, show } from the settings object.
 */
export function getGlassRateForItem(
  item: EstimateItem,
  settings: {
    showCalculatedPrice: boolean
    glassRateUnit: GlassRateUnit
    doubleTemperedRate: number
    tripleTemperedRate: number
    doorShowCalculatedPrice: boolean
    doorGlassRateUnit: GlassRateUnit
    doorDoubleTemperedRate: number
    doorTripleTemperedRate: number
  },
): { rate: number; unit: GlassRateUnit; show: boolean } {
  const door = isDoorType(item.type)
  const show = door ? (settings.doorShowCalculatedPrice ?? true) : (settings.showCalculatedPrice ?? true)
  const unit = door ? (settings.doorGlassRateUnit ?? "sqin") : (settings.glassRateUnit ?? "sqin")

  let rate = 0
  if (item.product === "double-tempered") {
    rate = door ? (settings.doorDoubleTemperedRate ?? 0.50) : (settings.doubleTemperedRate ?? 0.50)
  } else if (item.product === "triple-tempered") {
    rate = door ? (settings.doorTripleTemperedRate ?? 0.75) : (settings.tripleTemperedRate ?? 0.75)
  }

  return { rate, unit, show }
}

// ── Helpers ──────────────────────────────────────
export function toFraction(dec: number): string {
  const w = Math.floor(dec), f = dec - w
  if (f < 0.01) return `${w}"`
  const s = Math.round(f * 16)
  if (s === 16) return `${w + 1}"`
  if (s === 0) return `${w}"`
  let n = s, d = 16
  while (n % 2 === 0) { n /= 2; d /= 2 }
  return `${w}-${n}/${d}"`
}

export function moduleWidth(totalW: number, n: number) { return totalW / n - 1 / 16 }

/** Perimeter of a window/door in inches = 2×(W+H) */
export function perimeterInches(w: number, h: number): number { return 2 * (w + h) }
/** Perimeter in linear feet */
export function perimeterFeet(w: number, h: number): number { return perimeterInches(w, h) / 12 }

export function fmt(n: number) { return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }

export function allItems(est: EstimateState): EstimateItem[] {
  return est.rooms.flatMap(r => r.items)
}

/** Settings shape needed for effective pricing (subset of EstimateSettings) */
export type GlassPricingSettings = {
  showCalculatedPrice: boolean
  glassRateUnit: GlassRateUnit
  doubleTemperedRate: number
  tripleTemperedRate: number
  doorShowCalculatedPrice: boolean
  doorGlassRateUnit: GlassRateUnit
  doorDoubleTemperedRate: number
  doorTripleTemperedRate: number
}

/**
 * Get the effective unit price for an item:
 * - If the user entered a manual unitPrice > 0, use that.
 * - Otherwise, use the calculated glass price (if enabled and applicable).
 */
export function getEffectiveUnitPrice(item: EstimateItem, glassSettings?: GlassPricingSettings): number {
  if (item.unitPrice > 0) return item.unitPrice
  if (!glassSettings) return item.unitPrice
  const gl = getGlassRateForItem(item, glassSettings)
  if (gl.show && gl.rate > 0) return computeCalculatedPrice(item, gl.rate, gl.unit)
  return item.unitPrice
}

export interface CalcTotalsFlags {
  showInstallation?: boolean
  showDelivery?: boolean
  showGST?: boolean
  showQST?: boolean
}

export function calcTotals(est: EstimateState, gstRate = 5, qstRate = 9.975, glassSettings?: GlassPricingSettings, flags?: CalcTotalsFlags) {
  const { showInstallation = true, showDelivery = true, showGST = true, showQST = true } = flags || {}
  const items = allItems(est)
  let prodTotal = 0, totalUnits = 0, trimTotal = 0
  items.forEach(it => {
    const eff = getEffectiveUnitPrice(it, glassSettings)
    prodTotal += it.qty * eff
    totalUnits += it.qty
    if (it.trimInstall && (it.trimPrice ?? 0) > 0) {
      trimTotal += it.qty * it.trimPrice
    }
  })
  const install = showInstallation ? totalUnits * est.installPerUnit : 0
  const delivery = showDelivery ? est.delivery : 0
  const subtax = prodTotal + install + delivery + trimTotal
  const gst = showGST ? subtax * (gstRate / 100) : 0
  const qst = showQST ? subtax * (qstRate / 100) : 0
  const total = subtax + gst + qst
  const deposit = total * (est.depositPct / 100)
  return { prodTotal, totalUnits, items: items.length, install, delivery, trimTotal, subtax, gst, qst, total, deposit, balance: total - deposit }
}
