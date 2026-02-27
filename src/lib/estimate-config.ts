// ── Window Type Configs ─────────────────────────
export interface WindowTypeConfig { modules: string[]; label: string }

export const WINDOW_TYPES: Record<string, WindowTypeConfig> = {
  FIX:                  { modules: ["FIX"],                          label: "Fixed" },
  "CAS-L":             { modules: ["CAS-L"],                        label: "Casement Left" },
  "CAS-R":             { modules: ["CAS-R"],                        label: "Casement Right" },
  "CAS-L+FIX":         { modules: ["CAS-L", "FIX"],                label: "Casement Left + Fixed" },
  "FIX+CAS-R":         { modules: ["FIX", "CAS-R"],                label: "Fixed + Casement Right" },
  "CAS-L+FIX+FIX":     { modules: ["CAS-L", "FIX", "FIX"],        label: "Casement L + 2 Fixed" },
  "FIX+FIX+FIX":       { modules: ["FIX", "FIX", "FIX"],          label: "3 Fixed Panoramic" },
  "FIX+FIX+CAS-R":     { modules: ["FIX", "FIX", "CAS-R"],        label: "2 Fixed + Casement R" },
  "CAS-L+FIX+FIX+FIX": { modules: ["CAS-L", "FIX", "FIX", "FIX"],label: "Casement L + 3 Fixed" },
  SLIDER:               { modules: ["SLIDE", "FIX"],                label: "Single Slider" },
}

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
