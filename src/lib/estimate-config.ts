// ── Window Types ────────────────────────────────
export interface WindowTypeConfig {
  modules: string[]
  label: string
}

export const WINDOW_TYPES: Record<string, WindowTypeConfig> = {
  FIX:                 { modules: ["FIX"],                        label: "Fixed" },
  "CAS-L":            { modules: ["CAS-L"],                      label: "Casement Left" },
  "CAS-R":            { modules: ["CAS-R"],                      label: "Casement Right" },
  "CAS-L+FIX":        { modules: ["CAS-L", "FIX"],              label: "Casement Left + Fixed" },
  "FIX+CAS-R":        { modules: ["FIX", "CAS-R"],              label: "Fixed + Casement Right" },
  "CAS-L+FIX+FIX":    { modules: ["CAS-L", "FIX", "FIX"],      label: "Casement L + 2 Fixed" },
  "FIX+FIX+FIX":      { modules: ["FIX", "FIX", "FIX"],        label: "3 Fixed Panoramic" },
  "FIX+FIX+CAS-R":    { modules: ["FIX", "FIX", "CAS-R"],      label: "2 Fixed + Casement R" },
  "CAS-L+FIX+FIX+FIX":{ modules: ["CAS-L", "FIX", "FIX", "FIX"], label: "Casement L + 3 Fixed" },
  SLIDER:              { modules: ["SLIDE", "FIX"],              label: "Single Slider" },
}

export const PRODUCTS = [
  { id: "hybrid",     label: '4600 Hybrid PVC/ALU 5¾"', tag: "HYBRID PVC/ALU", tagClass: "bg-slate-900 dark:bg-slate-700 text-white" },
  { id: "pvc",        label: '4600 PVC 5¼"',            tag: "PVC",            tagClass: "bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white" },
  { id: "pvc-slider", label: '4000 PVC 5¼" — Slider',   tag: "PVC",            tagClass: "bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white" },
] as const

export const EXT_COLORS = ["525 Black", "White", "Commercial Brown", "Custom"]
export const INT_COLORS = ["White", "Custom"]

// ── Item Shape ──────────────────────────────────
export interface EstimateItem {
  id: string
  type: string       // key into WINDOW_TYPES
  product: string    // key into PRODUCTS
  extColor: string
  intColor: string
  width: number      // inches
  height: number     // inches
  location: string
  qty: number
  unitPrice: number
}

export interface EstimateState {
  companyName: string
  tagline: string
  estimateNumber: string
  date: string
  validUntil: string
  requiredBy: string
  clientName: string
  clientAddress: string
  clientCity: string
  clientPhone: string
  clientEmail: string
  shipMethod: string
  shipAddress: string
  shipPhone: string
  repName: string
  repRef: string
  items: EstimateItem[]
  installPerUnit: number
  delivery: number
  depositPct: number
}

export function createBlankItem(): EstimateItem {
  return {
    id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: "CAS-L+FIX",
    product: "hybrid",
    extColor: "525 Black",
    intColor: "White",
    width: 48,
    height: 48,
    location: "",
    qty: 1,
    unitPrice: 0,
  }
}

export function createBlankEstimate(): EstimateState {
  return {
    companyName: "VERREX",
    tagline: "WINDOWS & DOORS — FENÊTRES & PORTES",
    estimateNumber: "VX-2025-0001",
    date: new Date().toISOString().slice(0, 10),
    validUntil: "",
    requiredBy: "",
    clientName: "",
    clientAddress: "",
    clientCity: "",
    clientPhone: "",
    clientEmail: "",
    shipMethod: "PICKUP",
    shipAddress: "",
    shipPhone: "",
    repName: "",
    repRef: "",
    items: [createBlankItem()],
    installPerUnit: 275,
    delivery: 850,
    depositPct: 30,
  }
}

// ── Helpers ─────────────────────────────────────
export function toFraction(dec: number): string {
  const whole = Math.floor(dec)
  const frac = dec - whole
  if (frac < 0.01) return `${whole}"`
  const sixteenths = Math.round(frac * 16)
  if (sixteenths === 16) return `${whole + 1}"`
  if (sixteenths === 0) return `${whole}"`
  let n = sixteenths, d = 16
  while (n % 2 === 0) { n /= 2; d /= 2 }
  return `${whole}-${n}/${d}"`
}

export function moduleWidth(totalW: number, numModules: number): number {
  return totalW / numModules - 1 / 16
}

export function fmt(n: number): string {
  return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export function calcTotals(state: EstimateState) {
  let prodTotal = 0, totalUnits = 0
  state.items.forEach(it => { prodTotal += it.qty * it.unitPrice; totalUnits += it.qty })
  const install = totalUnits * state.installPerUnit
  const delivery = state.delivery
  const subtax = prodTotal + install + delivery
  const gst = subtax * 0.05
  const qst = subtax * 0.09975
  const total = subtax + gst + qst
  const deposit = total * (state.depositPct / 100)
  return { prodTotal, totalUnits, install, delivery, subtax, gst, qst, total, deposit, balance: total - deposit }
}
