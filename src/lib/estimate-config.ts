// ── Window & Door Type Configs ──────────────────
export type TypeCategory = "window" | "door"
export interface WindowTypeConfig { modules: string[]; label: string; category: TypeCategory; group: string; hidden?: boolean }

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
  "CAS-R+FIX":          { modules: ["CAS-R", "FIX"],                label: "Casement R + Fixed",          category: "window", group: "Windows — Combo" },
  "FIX+CAS-R":          { modules: ["FIX", "CAS-R"],                label: "Fixed + Casement R",          category: "window", group: "Windows — Combo" },
  "TT-L+FIX":           { modules: ["TT-L", "FIX"],                 label: "Tilt & Turn L + Fixed",       category: "window", group: "Windows — Combo" },
  "FIX+TT-R":           { modules: ["FIX", "TT-R"],                 label: "Fixed + Tilt & Turn R",       category: "window", group: "Windows — Combo" },
  "CAS-L+FIX+FIX":      { modules: ["CAS-L", "FIX", "FIX"],        label: "Casement L + 2 Fixed",        category: "window", group: "Windows — Combo" },
  "FIX+FIX+FIX":        { modules: ["FIX", "FIX", "FIX"],          label: "3 Fixed Panoramic",           category: "window", group: "Windows — Combo" },
  "FIX+FIX+CAS-R":      { modules: ["FIX", "FIX", "CAS-R"],        label: "2 Fixed + Casement R",        category: "window", group: "Windows — Combo" },
  "CAS-L+FIX+FIX+FIX":  { modules: ["CAS-L", "FIX", "FIX", "FIX"],label: "Casement L + 3 Fixed",        category: "window", group: "Windows — Combo" },
  // ── DOORS ──
  // Generic swing door — L/R + In/Out controlled by card buttons, not by type name
  "SWING-DOOR":         { modules: ["SWING"],                        label: "Swing Door",                  category: "door", group: "Doors — Swing" },
  "SWING-FRENCH":       { modules: ["SWING", "SWING"],               label: "French Door (Double)",         category: "door", group: "Doors — Swing" },
  // Legacy aliases (backward compat for saved estimates)
  "SWING-L-IN":         { modules: ["SWING"],                        label: "Swing Door",                  category: "door", group: "Doors — Swing", hidden: true },
  "SWING-R-IN":         { modules: ["SWING"],                        label: "Swing Door",                  category: "door", group: "Doors — Swing", hidden: true },
  "SWING-L-OUT":        { modules: ["SWING"],                        label: "Swing Door",                  category: "door", group: "Doors — Swing", hidden: true },
  "SWING-R-OUT":        { modules: ["SWING"],                        label: "Swing Door",                  category: "door", group: "Doors — Swing", hidden: true },
  "SLIDE-DOOR-2":       { modules: ["SLIDE-D", "FIX-D"],            label: "Sliding Door — 2 Panel",      category: "door", group: "Doors — Sliding" },
  "SLIDE-DOOR-3":       { modules: ["SLIDE-D", "FIX-D", "SLIDE-D"], label: "Sliding Door — 3 Panel",      category: "door", group: "Doors — Sliding" },
  "FOLD-2":             { modules: ["FOLD", "FOLD"],                 label: "Folding Door — 2 Panel",      category: "door", group: "Doors — Folding" },
  "FOLD-4":             { modules: ["FOLD", "FOLD", "FOLD", "FOLD"], label: "Folding Door — 4 Panel",      category: "door", group: "Doors — Folding" },
}

/** Get unique groups for optgroup rendering (excludes hidden legacy types) */
export function getTypeGroups(): { group: string; types: [string, WindowTypeConfig][] }[] {
  const map = new Map<string, [string, WindowTypeConfig][]>()
  Object.entries(WINDOW_TYPES).forEach(([k, v]) => {
    if (v.hidden) return // skip legacy aliases
    const arr = map.get(v.group) || []; arr.push([k, v]); map.set(v.group, arr)
  })
  return Array.from(map.entries()).map(([group, types]) => ({ group, types }))
}

export function isDoorType(typeKey: string): boolean { return WINDOW_TYPES[typeKey]?.category === "door" }

/** Generate a human-readable description for a window/door item based on type + settings */
export function getItemDescription(type: string, hingeLeft = false, swingInside = true): string {
  const cfg = WINDOW_TYPES[type]
  if (!cfg) return ""
  const mods = cfg.modules
  const side = hingeLeft ? "left" : "right"
  const swing = swingInside ? "inswing" : "outswing"

  // Swing doors
  if (type === "SWING-DOOR" || type.startsWith("SWING-L") || type.startsWith("SWING-R")) {
    return `Swing door — opens ${side}, ${swing}`
  }
  if (type === "SWING-FRENCH") {
    return `French double swing door — ${swing}`
  }
  // Sliding doors
  if (type.startsWith("SLIDE-DOOR")) {
    const panels = mods.length
    const slideSide = hingeLeft ? "left" : "right"
    return `${panels}-panel sliding door — sliding panel ${slideSide}`
  }
  // Folding doors
  if (type.startsWith("FOLD")) {
    return `${mods.length}-panel folding door — opens ${side}`
  }
  // Casement windows
  if (mods.some(m => m.startsWith("CAS"))) {
    const hasFixed = mods.includes("FIX")
    if (hasFixed) return `Casement + fixed combo (${mods.length} panel) — hinge ${side}`
    return `Casement window — hinge ${side}`
  }
  // Tilt & Turn
  if (mods.some(m => m.startsWith("TT"))) {
    const hasFixed = mods.includes("FIX")
    if (hasFixed) return `Tilt & turn + fixed combo — hinge ${side}`
    return `Tilt & turn window — hinge ${side}`
  }
  // Awning
  if (mods.includes("AWNING")) return "Awning (top-hung) window"
  // Slider
  if (mods.includes("SLIDE")) return `Horizontal slider window (${mods.length} panel)`
  // Fixed
  if (mods.every(m => m === "FIX")) {
    return mods.length > 1 ? `${mods.length}-panel fixed panoramic window` : "Fixed non-operable window"
  }
  return cfg.label
}

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
  hingeLeft: boolean    // hinge side: true=left, false=right
  swingInside: boolean  // swing direction: true=inswing, false=outswing
  trimInstall: boolean  // enable trim for this item
  trimStyle: "flat" | "colonial"  // trim profile style
  trimPrice: number     // trim price override (0 = use global rate)
  installOverride: boolean
  installPrice: number
  // Glass specifications
  thermal: string
  lowE: string
  glassThickness: string
  argonGas: string
  glassType: string
  glassFinish: string
  screen: string
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
    hingeLeft: false, swingInside: true, trimInstall: false, trimStyle: "flat", trimPrice: 0,
    installOverride: false, installPrice: 0,
    thermal: "Double", lowE: "1 Side", glassThickness: "5mm", argonGas: "18mm", glassType: "Ultra Clear", glassFinish: "Clear", screen: "Not Included",
  }
}

export function createRoom(name = "Room"): Room {
  return { id: uid("rm"), name, items: [createItem()] }
}

export const DEFAULT_TERMS = [
  "This estimate is valid for 30 days from issue date.",
  "A deposit of 35% is required at contract signing. The remaining 65% is due on installation day.",
  "Approximate delivery 90 days after deposit payment.",
  "All products carry a full manufacturer warranty: 15 years on color, 25 years on frame structure, and 10 years on thermal glazing. Installation warranty of 5 years. (All argon-filled glazing loses 1–2% of its thermal R-value per year).",
  "Interior finishes (e.g. interior casing) are not included and cost $4.50/linear foot.",
  "The value of delivered/installed products must be paid upon receipt of merchandise before installation.",
  "Installation must be paid on the day it is completed.",
  "Prices include all listed products and services. Additional work is quoted separately.",
  "Window and door flashing is covered by Blueskin membrane, a self-adhesive rubberized asphalt compound (Blueskin membrane is part of the installation).",
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

// ── Payment Stage Config ────────────────────────
export interface PaymentStageConfig {
  id: string
  label: string
  pct: number       // percentage of grand total (0 = auto-remainder)
  show: boolean
}
export function defaultPaymentStages(): PaymentStageConfig[] {
  return [
    { id: "deposit", label: "Deposit Required", pct: 30, show: true },
    { id: "balance", label: "Balance Remaining", pct: 0, show: true },
    { id: "after_install", label: "After Installation Complete", pct: 0, show: false },
  ]
}

// ── Trim Rate Units ─────────────────────────────
// ── Installation Pricing ─────────────────────────
export type InstallMethod = "per-unit" | "per-sqin" | "per-sqft" | "per-sqm" | "pct-price" | "per-lin-in" | "per-lin-ft" | "per-lin-cm"


// ═══ GLASS SPECIFICATION DEFAULTS ═══
export const GLASS_SPEC_DEFAULTS = {
  thermalOptions: ["Double", "Triple"],
  lowEOptions: ["1 Side", "2 Sides"],
  glassThicknessOptions: ["5mm", "6mm"],
  argonGasOptions: ["18mm", "24mm"],
  glassTypeOptions: ["Ultra Clear", "Other"],
  glassFinishOptions: ["Clear", "Frosted"],
} as const

export const INSTALL_METHODS: { id: InstallMethod; label: string; short: string }[] = [
  { id: "per-unit",   label: "Per Unit (flat)",    short: "/unit" },
  { id: "per-sqin",   label: "Per Square Inch",    short: "/sq in" },
  { id: "per-sqft",   label: "Per Square Foot",    short: "/sq ft" },
  { id: "per-sqm",    label: "Per Square Meter",   short: "/sq m" },
  { id: "pct-price",  label: "% of Product Price", short: "%" },
  { id: "per-lin-in", label: "Per Linear Inch (perimeter)",  short: "/lin in" },
  { id: "per-lin-ft", label: "Per Linear Foot (perimeter)",  short: "/lin ft" },
  { id: "per-lin-cm", label: "Per Linear CM (perimeter)",    short: "/lin cm" },
]

export interface InstallPricingSettings {
  installMethod: InstallMethod
  installRate: number
}

export type TrimUnit = "in" | "lft" | "m" | "cm"
export const TRIM_UNITS = [
  { id: "in" as const, label: "per inch", short: "/in" },
  { id: "lft" as const, label: "per linear foot", short: "/lft" },
  { id: "m" as const, label: "per meter", short: "/m" },
  { id: "cm" as const, label: "per cm", short: "/cm" },
]
/** Convert perimeter from inches to the given trim unit */
export function perimeterInUnit(w: number, h: number, unit: TrimUnit): number {
  const pIn = 2 * (w + h)
  switch (unit) {
    case "lft": return pIn / 12
    case "m":   return pIn * 0.0254
    case "cm":  return pIn * 2.54
    default:    return pIn // inches
  }
}

// ── Dimension Units ─────────────────────────────
export type DimensionUnit = "in" | "cm"
/** Convert stored inches to display value */
export function inToDisplay(inches: number, unit: DimensionUnit): number {
  return unit === "cm" ? Math.round(inches * 2.54 * 10) / 10 : inches
}
/** Convert display input back to inches for storage */
export function displayToIn(val: number, unit: DimensionUnit): number {
  return unit === "cm" ? val / 2.54 : val
}
export function dimLabel(unit: DimensionUnit): string { return unit === "cm" ? "cm" : "in" }

/** Perimeter of a window/door in inches = 2×(W+H) */
export function perimeterInches(w: number, h: number): number { return 2 * (w + h) }
/** Perimeter in linear feet */
export function perimeterFeet(w: number, h: number): number { return perimeterInches(w, h) / 12 }

export function fmt(n: number) { return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") }

// ── Translation Engine ──────────────────────────
// Maps English labels → French for all data-driven strings
const FR_LABELS: Record<string, string> = {
  // ── Window Types ──
  "Fixed": "Fixe",
  "Top Hung (Awning)": "Auvent (haut)",
  "Horizontal Slider": "Coulissant horizontal",
  "Casement Left — Crank Out": "Battant gauche — manivelle",
  "Casement Right — Crank Out": "Battant droit — manivelle",
  "Tilt & Turn Left (Inswing)": "Oscillo-battant gauche",
  "Tilt & Turn Right (Inswing)": "Oscillo-battant droit",
  "Casement L + Fixed": "Battant G + Fixe",
  "Casement R + Fixed": "Battant D + Fixe",
  "Fixed + Casement R": "Fixe + Battant D",
  "Tilt & Turn L + Fixed": "Oscillo-battant G + Fixe",
  "Fixed + Tilt & Turn R": "Fixe + Oscillo-battant D",
  "Casement L + 2 Fixed": "Battant G + 2 Fixes",
  "3 Fixed Panoramic": "3 Fixes panoramiques",
  "2 Fixed + Casement R": "2 Fixes + Battant D",
  "Casement L + 3 Fixed": "Battant G + 3 Fixes",
  // ── Door Types ──
  "Swing Door": "Porte battante",
  "French Door (Double)": "Porte française (double)",
  "Sliding Door — 2 Panel": "Porte coulissante — 2 panneaux",
  "Sliding Door — 3 Panel": "Porte coulissante — 3 panneaux",
  "Folding Door — 2 Panel": "Porte pliante — 2 panneaux",
  "Folding Door — 4 Panel": "Porte pliante — 4 panneaux",
  // ── Type Groups ──
  "Windows": "Fenêtres",
  "Windows — Combo": "Fenêtres — Combo",
  "Doors — Swing": "Portes — Battantes",
  "Doors — Sliding": "Portes — Coulissantes",
  "Doors — Folding": "Portes — Pliantes",
  // ── Products ──
  "Double Tempered Glass": "Verre double trempé",
  "Triple Tempered Glass": "Verre triple trempé",
  '4600 Hybrid PVC/ALU 5¾"': '4600 Hybride PVC/ALU 5¾"',
  '4600 PVC 5¼"': '4600 PVC 5¼"',
  '4000 PVC 5¼" — Slider': '4000 PVC 5¼" — Coulissant',
  // ── Colors ──
  "White": "Blanc",
  "Grey": "Gris",
  "Wood Grain": "Grain de bois",
  "Walnut Wood": "Bois de noyer",
  "Cherry": "Cerisier",
  "Black": "Noir",
  "Bronze": "Bronze",
  "Clay": "Argile",
  "Beige": "Beige",
  "Sand": "Sable",
  "Cream": "Crème",
  "Brown": "Brun",
  "Custom": "Personnalisé",
  // ── Payment Stages ──
  "Deposit Required": "Dépôt requis",
  "Balance Remaining": "Solde restant",
  "After Installation Complete": "Après l'installation complétée",
  // ── Glass Rate Units ──
  "per sq inch": "par po²",
  "per sq foot": "par pi²",
  "per sq meter": "par m²",
  // ── Trim Units ──
  "per inch": "par pouce",
  "per linear foot": "par pied linéaire",
  "per meter": "par mètre",
  "per cm": "par cm",
  // ── Trim Styles ──
  "Flat": "Plat",
  "flat": "plat",
  "Colonial": "Colonial",
  "colonial": "colonial",
  // ── Ship Methods ──
  "PICKUP": "RAMASSAGE",
  "DELIVERY": "LIVRAISON",
  // ── Labels ──
  "Sold To": "VENDU À",
  "Ship To": "LIVRÉ À",
  "Room": "Pièce",
  "GROUND FLOOR": "REZ-DE-CHAUSSÉE",
  "NEW ROOM": "NOUVELLE PIÈCE",
  // ── Dimension Units ──
  "Inches (in)": "Pouces (po)",
  "Centimeters (cm)": "Centimètres (cm)",
  // ── Misc ──
  "Standard": "Standard",
  "Window": "Fenêtre",
  "Door": "Porte",
  "Left": "Gauche",
  "Right": "Droite",
  "In": "Intérieur",
  "Out": "Extérieur",
  "Hinge": "Charnière",
  "Swing": "Ouverture",
}

/**
 * Translate a label from English to French (or return as-is for English).
 * This is the universal "translator engine" for all data-driven strings.
 * Usage: tl("Double Tempered Glass", locale) → "Verre double trempé"
 */
export function tl(label: string, locale: string): string {
  if (locale !== "fr") return label
  return FR_LABELS[label] ?? label
}

export const DEFAULT_TERMS_FR = [
  "Ce devis est valable pendant 30 jours à compter de la date d'émission.",
  "Un acompte de 35% est exigé à la signature du contrat. Les 65% restants sont dus le jour de l'installation.",
  "Livraison approximative 90 jours après le versement de l'acompte.",
  "Tous les produits bénéficient d'une garantie constructeur complète de 15 ans sur la couleur. 25 ans sur la structure du cadre et de 10 ans sur le vitrage thermique. Garantie d'installation de 5 ans. (Tous les vitrages remplis d'argon perdent 1 à 2% par an de leur valeur R thermique).",
  "Les finitions intérieures (ex: carriage intérieur) ne sont pas incluses et coûtent 4,5 $/pied linéaire.",
  "La valeur des produits livrés/installés doit être payée à la réception de la marchandise avant l'installation.",
  "L'installation doit être payée le jour où elle est terminée.",
  "Les prix comprennent tous les produits et services indiqués. Les travaux supplémentaires sont facturés séparément.",
  "Le solin des fenêtres et de portes sont couverts par la membrane Blueskin qui est auto-adhésive composée d'un composé d'asphalte caoutchouté (la membrane Blueskin fait partie de l'installation).",
]

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

export interface TrimRateSettings {
  trimUnit: TrimUnit
  flatTrimRate: number
  colonialTrimRate: number
}

/** Get the effective trim cost for one item (qty×1) */
export function getItemTrimCost(it: EstimateItem, trimSettings?: TrimRateSettings): number {
  if (!it.trimInstall) return 0
  // Manual override
  if ((it.trimPrice ?? 0) > 0) return it.trimPrice
  // Auto from global rate
  if (!trimSettings) return 0
  const rate = it.trimStyle === "colonial" ? trimSettings.colonialTrimRate : trimSettings.flatTrimRate
  if (rate <= 0) return 0
  const peri = perimeterInUnit(it.width, it.height, trimSettings.trimUnit)
  return peri * rate
}

/** Get the effective installation cost for one item (qty×1) */
export function getItemInstallCost(it: EstimateItem, globalInstallPerUnit: number, installSettings?: InstallPricingSettings): number {
  if (it.installOverride && it.installPrice > 0) return it.installPrice
  if (!installSettings) return globalInstallPerUnit
  const { installMethod, installRate } = installSettings
  const w = it.width, h = it.height
  switch (installMethod) {
    case "per-unit":   return installRate || globalInstallPerUnit
    case "per-sqin":   return w * h * installRate
    case "per-sqft":   return (w / 12) * (h / 12) * installRate
    case "per-sqm":    return (w * 0.0254) * (h * 0.0254) * installRate
    case "pct-price":  return it.unitPrice * (installRate / 100)
    case "per-lin-in": return perimeterInches(w, h) * installRate
    case "per-lin-ft": return perimeterFeet(w, h) * installRate
    case "per-lin-cm": return perimeterInches(w, h) * 2.54 * installRate
    default:           return globalInstallPerUnit
  }
}

/** Get a human-readable install formula description */
export function getInstallFormula(it: EstimateItem, installSettings?: InstallPricingSettings): string {
  if (!installSettings || installSettings.installMethod === "per-unit") return ""
  const w = it.width, h = it.height, r = installSettings.installRate
  const m = installSettings.installMethod
  switch (m) {
    case "per-sqin":   return `${w}×${h} = ${w*h} sq in × ${r.toFixed(2)}`
    case "per-sqft":   { const sf = ((w/12)*(h/12)); return `${sf.toFixed(1)} sq ft × ${r.toFixed(2)}` }
    case "per-sqm":    { const sm = ((w*0.0254)*(h*0.0254)); return `${sm.toFixed(2)} sq m × ${r.toFixed(2)}` }
    case "pct-price":  return `${fmt(it.unitPrice)} × ${r}%`
    case "per-lin-in": return `${perimeterInches(w,h)}" perim × ${r.toFixed(2)}`
    case "per-lin-ft": return `${perimeterFeet(w,h).toFixed(1)} ft perim × ${r.toFixed(2)}`
    case "per-lin-cm": return `${(perimeterInches(w,h)*2.54).toFixed(0)} cm perim × ${r.toFixed(2)}`
    default: return ""
  }
}

export function calcTotals(est: EstimateState, gstRate = 5, qstRate = 9.975, glassSettings?: GlassPricingSettings, flags?: CalcTotalsFlags, trimSettings?: TrimRateSettings, installSettings?: InstallPricingSettings) {
  const { showInstallation = true, showDelivery = true, showGST = true, showQST = true } = flags || {}
  const items = allItems(est)
  let prodTotal = 0, totalUnits = 0, trimTotal = 0, installTotal = 0
  items.forEach(it => {
    const eff = getEffectiveUnitPrice(it, glassSettings)
    prodTotal += it.qty * eff
    totalUnits += it.qty
    trimTotal += it.qty * getItemTrimCost(it, trimSettings)
    if (showInstallation) {
      installTotal += it.qty * getItemInstallCost(it, est.installPerUnit, installSettings)
    }
  })
  const install = installTotal
  const delivery = showDelivery ? est.delivery : 0
  const subtax = prodTotal + install + delivery + trimTotal
  const gst = showGST ? subtax * (gstRate / 100) : 0
  const qst = showQST ? subtax * (qstRate / 100) : 0
  const total = subtax + gst + qst
  const deposit = total * (est.depositPct / 100)
  return { prodTotal, totalUnits, items: items.length, install, delivery, trimTotal, subtax, gst, qst, total, deposit, balance: total - deposit }
}
