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
  { id: "hybrid",     label: '4600 Hybrid PVC/ALU 5¾"', tag: "HYBRID PVC/ALU", cls: "bg-slate-900 dark:bg-slate-700 text-white" },
  { id: "pvc",        label: '4600 PVC 5¼"',            tag: "PVC",            cls: "bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white" },
  { id: "pvc-slider", label: '4000 PVC 5¼" — Slider',   tag: "PVC SLIDER",     cls: "bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white" },
] as const

export const DEFAULT_EXT_COLORS = ["525 Black", "White", "Commercial Brown"]
export const DEFAULT_INT_COLORS = ["White"]

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
  customLabel: string   // e.g. "Front – 2nd Floor"
  location: string      // kept for legacy compat
  qty: number
  unitPrice: number
  notes: string
  attachmentNames: string[] // file names only (not uploaded)
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
    id: uid("itm"), type: "CAS-L+FIX", product: "hybrid",
    extColor: "525 Black", intColor: "White",
    width: 48, height: 48, depth: 5.75,
    customLabel: "", location: "", qty: 1, unitPrice: 0,
    notes: "", attachmentNames: [],
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
  return { name: "VERREX", tagline: "WINDOWS & DOORS — FENÊTRES & PORTES", address: "", city: "", phone: "", email: "", website: "verrex-website.vercel.app", logoUrl: "" }
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

export function fmt(n: number) { return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }

export function allItems(est: EstimateState): EstimateItem[] {
  return est.rooms.flatMap(r => r.items)
}

export function calcTotals(est: EstimateState) {
  const items = allItems(est)
  let prodTotal = 0, totalUnits = 0
  items.forEach(it => { prodTotal += it.qty * it.unitPrice; totalUnits += it.qty })
  const install = totalUnits * est.installPerUnit
  const delivery = est.delivery
  const subtax = prodTotal + install + delivery
  const gst = subtax * 0.05, qst = subtax * 0.09975
  const total = subtax + gst + qst
  const deposit = total * (est.depositPct / 100)
  return { prodTotal, totalUnits, items: items.length, install, delivery, subtax, gst, qst, total, deposit, balance: total - deposit }
}
