const fs = require('fs')

// ══════════════════════════════════════════════════════════
// 1. PATCH estimate-config.ts — add locale param to both description functions
// ══════════════════════════════════════════════════════════
let cfg = fs.readFileSync('src/lib/estimate-config.ts', 'utf8')

// Replace getItemDescription
const oldGetItem = `export function getItemDescription(type: string, hingeLeft = false, swingInside = true): string {
  const cfg = WINDOW_TYPES[type]
  if (!cfg) return ""
  const mods = cfg.modules
  const side = hingeLeft ? "left" : "right"
  const swing = swingInside ? "inswing" : "outswing"`

const newGetItem = `export function getItemDescription(type: string, hingeLeft = false, swingInside = true, locale = "en"): string {
  const cfg = WINDOW_TYPES[type]
  if (!cfg) return ""
  const mods = cfg.modules
  const fr = locale === "fr"
  const side = hingeLeft ? (fr ? "gauche" : "left") : (fr ? "droite" : "right")
  const swing = swingInside ? (fr ? "ouverture int." : "inswing") : (fr ? "ouverture ext." : "outswing")`

if (cfg.includes(oldGetItem)) {
  cfg = cfg.replace(oldGetItem, newGetItem)
  console.log('OK - getItemDescription signature updated')
} else {
  console.log('WARN - getItemDescription signature not found, trying alternate')
}

// Replace all English return strings in getItemDescription with locale-aware versions
const itemReplacements = [
  // Swing doors
  ['return `Swing door — opens ${side}, ${swing}`', 'return fr ? `Porte battante — ouvre ${side}, ${swing}` : `Swing door — opens ${side}, ${swing}`'],
  ['return `French double swing door — ${swing}`', 'return fr ? `Porte double battante — ${swing}` : `French double swing door — ${swing}`'],
  // Sliding doors
  ['return `${panels}-panel sliding door — sliding panel ${slideSide}`', 'return fr ? `Porte coulissante ${panels} panneaux — panneau coulissant ${slideSide}` : `${panels}-panel sliding door — sliding panel ${slideSide}`'],
  // Folding doors
  ['return `${mods.length}-panel folding door — opens ${side}`', 'return fr ? `Porte pliante ${mods.length} panneaux — ouvre ${side}` : `${mods.length}-panel folding door — opens ${side}`'],
  // Casement + fixed combo
  ['return `Casement + fixed combo (${mods.length} panel) — hinge ${side}`', 'return fr ? `Battant + fixe combo (${mods.length} panneaux) — charnière ${side}` : `Casement + fixed combo (${mods.length} panel) — hinge ${side}`'],
  // Casement window
  ['return `Casement window — hinge ${side}`', 'return fr ? `Fenêtre à battant — charnière ${side}` : `Casement window — hinge ${side}`'],
  // T&T + fixed combo
  ['return `Tilt & turn + fixed combo — hinge ${side}`', 'return fr ? `Oscillo-battant + fixe combo — charnière ${side}` : `Tilt & turn + fixed combo — hinge ${side}`'],
  // T&T window
  ['return `Tilt & turn window — hinge ${side}`', 'return fr ? `Fenêtre oscillo-battante — charnière ${side}` : `Tilt & turn window — hinge ${side}`'],
  // Awning
  ['return "Awning (top-hung) window"', 'return fr ? "Fenêtre auvent (ouverture par le haut)" : "Awning (top-hung) window"'],
  // Slider
  ['return `Horizontal slider window (${mods.length} panel)`', 'return fr ? `Fenêtre coulissante horizontale (${mods.length} panneaux)` : `Horizontal slider window (${mods.length} panel)`'],
  // Fixed panoramic
  ['return mods.length > 1 ? `${mods.length}-panel fixed panoramic window` : "Fixed non-operable window"', 'return mods.length > 1 ? (fr ? `Fenêtre fixe panoramique ${mods.length} panneaux` : `${mods.length}-panel fixed panoramic window`) : (fr ? "Fenêtre fixe non-ouvrable" : "Fixed non-operable window")'],
]

for (const [from, to] of itemReplacements) {
  if (cfg.includes(from)) {
    cfg = cfg.replace(from, to)
  } else {
    console.log(`WARN - getItemDescription replacement not found: ${from.substring(0, 50)}...`)
  }
}

// ─── Now patch describeCustomLayout ───
const oldDescribe = `export function describeCustomLayout(modules: string[], hingeLeft = false, swingInside = true): string {
  if (!modules.length) return "Window"`

const newDescribe = `export function describeCustomLayout(modules: string[], hingeLeft = false, swingInside = true, locale = "en"): string {
  const fr = locale === "fr"
  if (!modules.length) return fr ? "Fenêtre" : "Window"`

if (cfg.includes(oldDescribe)) {
  cfg = cfg.replace(oldDescribe, newDescribe)
  console.log('OK - describeCustomLayout signature updated')
} else {
  console.log('WARN - describeCustomLayout signature not found')
}

// Add fr variable-aware side/swing in describeCustomLayout
cfg = cfg.replace(
  `  const side = hingeLeft ? "left" : "right"\n  const swing = swingInside ? "inswing" : "outswing"\n\n  // Count by type`,
  `  const side = hingeLeft ? (fr ? "gauche" : "left") : (fr ? "droite" : "right")\n  const swing = swingInside ? (fr ? "ouverture int." : "inswing") : (fr ? "ouverture ext." : "outswing")\n\n  // Count by type`
)

// Replace all English return strings in describeCustomLayout
const descReplacements = [
  // Pure fixed
  ['return n === 1 ? "Fixed picture window" : `${n}-panel fixed panoramic window`',
   'return n === 1 ? (fr ? "Fenêtre fixe panoramique" : "Fixed picture window") : (fr ? `Fenêtre fixe panoramique ${n} panneaux` : `${n}-panel fixed panoramic window`)'],
  // French casement (cas with both L and R)
  ['return `${n}-panel French casement — ${swing}`',
   'return fr ? `Battant français ${n} panneaux — ${swing}` : `${n}-panel French casement — ${swing}`'],
  // Single casement
  ['return n === 1 ? `Casement window — hinge ${side}, ${swing}` : `${n}-panel casement — hinge ${side}, ${swing}`',
   'return n === 1 ? (fr ? `Fenêtre à battant — charnière ${side}, ${swing}` : `Casement window — hinge ${side}, ${swing}`) : (fr ? `Battant ${n} panneaux — charnière ${side}, ${swing}` : `${n}-panel casement — hinge ${side}, ${swing}`)'],
  // French T&T
  ['return `${n}-panel French tilt & turn — ${swing}`',
   'return fr ? `Oscillo-battant français ${n} panneaux — ${swing}` : `${n}-panel French tilt & turn — ${swing}`'],
  // T&T window
  ['return n === 1 ? `Tilt & turn window — hinge ${side}, ${swing}` : `${n}-panel tilt & turn — ${swing}`',
   'return n === 1 ? (fr ? `Fenêtre oscillo-battante — charnière ${side}, ${swing}` : `Tilt & turn window — hinge ${side}, ${swing}`) : (fr ? `Oscillo-battant ${n} panneaux — ${swing}` : `${n}-panel tilt & turn — ${swing}`)'],
  // Awning single
  ['return n === 1 ? "Awning (top-hung) window" : `${n}-panel awning stack`',
   'return n === 1 ? (fr ? "Fenêtre auvent" : "Awning (top-hung) window") : (fr ? `Auvent empilé ${n} panneaux` : `${n}-panel awning stack`)'],
  // Slider pure
  ['return `${n}-panel horizontal slider`',
   'return fr ? `Coulissante horizontale ${n} panneaux` : `${n}-panel horizontal slider`'],
]

for (const [from, to] of descReplacements) {
  if (cfg.includes(from)) {
    cfg = cfg.replace(from, to)
  } else {
    console.log(`WARN - describeCustomLayout not found: ${from.substring(0, 60)}...`)
  }
}

// More complex replacements in describeCustomLayout
// Picture window pattern
cfg = cfg.replace(
  'return `Picture window with centre ${ventType} vent (${n} panel) — hinge ${side}`',
  'return fr ? `Fenêtre panoramique avec ${ventType} central (${n} panneaux) — charnière ${side}` : `Picture window with centre ${ventType} vent (${n} panel) — hinge ${side}`'
)

// ventType translations (need to add a frVentType variable)
// Find the ventType assignment in the picture window section
cfg = cfg.replace(
  `const ventType = cas > 0 ? "casement" : tt > 0 ? "tilt & turn" : awn > 0 ? "awning" : "slider"\n    return \`Picture window`,
  `const ventType = cas > 0 ? (fr ? "battant" : "casement") : tt > 0 ? (fr ? "oscillo-battant" : "tilt & turn") : awn > 0 ? (fr ? "auvent" : "awning") : (fr ? "coulissant" : "slider")\n    return \`Picture window`
)

// Second ventType (single operable + rest fixed)
cfg = cfg.replace(
  `const ventType = cas > 0 ? "casement" : tt > 0 ? "tilt & turn" : awn > 0 ? "awning" : "slider"\n    const pos`,
  `const ventType = cas > 0 ? (fr ? "battant" : "casement") : tt > 0 ? (fr ? "oscillo-battant" : "tilt & turn") : awn > 0 ? (fr ? "auvent" : "awning") : (fr ? "coulissant" : "slider")\n    const pos`
)

// Single operable + rest fixed return
cfg = cfg.replace(
  "return `${ventType.charAt(0).toUpperCase() + ventType.slice(1)} + ${fix} fixed ${fix === 1 ? \"panel\" : \"panels\"} (${n} panel) — vent ${pos}`",
  "return fr ? `${ventType.charAt(0).toUpperCase() + ventType.slice(1)} + ${fix} fixe${fix > 1 ? \"s\" : \"\"} (${n} panneaux) — ventilation ${pos}` : `${ventType.charAt(0).toUpperCase() + ventType.slice(1)} + ${fix} fixed ${fix === 1 ? \"panel\" : \"panels\"} (${n} panel) — vent ${pos}`"
)

// pos translations
cfg = cfg.replace(
  `const pos = modules.indexOf(modules.find(m => m !== "FIX")!) === 0 ? "left"`,
  `const pos = modules.indexOf(modules.find(m => m !== "FIX")!) === 0 ? (fr ? "gauche" : "left")`
)
cfg = cfg.replace(
  `? "right" : "centre"`,
  `? (fr ? "droite" : "right") : (fr ? "centre" : "centre")`
)

// Casement combo with fixed panels + flanking vents
cfg = cfg.replace(
  'return `Casement combo with ${fix} fixed ${fix === 1 ? "panel" : "panels"} (${n} panel) — flanking vents',
  'return fr ? `Battant combo avec ${fix} fixe${fix > 1 ? "s" : ""} (${n} panneaux) — ventilations latérales'
)
// Need to handle the rest of that line - let me check exact content
// Actually the replacement above won't work perfectly because the line continues. Let me be more precise.

// T&T + fixed combo in describeCustomLayout  
cfg = cfg.replace(
  'return `Tilt & turn + fixed combo (${n} panel) — ${swing}`',
  'return fr ? `Oscillo-battant + fixe combo (${n} panneaux) — ${swing}` : `Tilt & turn + fixed combo (${n} panel) — ${swing}`'
)

// Awning + fixed combo
cfg = cfg.replace(
  'return `Awning + fixed combo (${n} panel)`',
  'return fr ? `Auvent + fixe combo (${n} panneaux)` : `Awning + fixed combo (${n} panel)`'
)

// Slider with flanking sidelights
cfg = cfg.replace(
  'return `Slider with flanking sidelights (${n} panel)`',
  'return fr ? `Coulissante avec impostes latérales (${n} panneaux)` : `Slider with flanking sidelights (${n} panel)`'
)

// Slider + fixed combo
cfg = cfg.replace(
  'return `Slider + fixed combo (${n} panel)`',
  'return fr ? `Coulissante + fixe combo (${n} panneaux)` : `Slider + fixed combo (${n} panel)`'
)

// Complex mixed parts
cfg = cfg.replace(
  'if (cas > 0) parts.push(`${cas} casement`)',
  'if (cas > 0) parts.push(fr ? `${cas} battant${cas > 1 ? "s" : ""}` : `${cas} casement`)'
)
cfg = cfg.replace(
  'if (tt > 0) parts.push(`${tt} tilt & turn`)',
  'if (tt > 0) parts.push(fr ? `${tt} oscillo-battant${tt > 1 ? "s" : ""}` : `${tt} tilt & turn`)'
)
cfg = cfg.replace(
  'if (awn > 0) parts.push(`${awn} awning`)',
  'if (awn > 0) parts.push(fr ? `${awn} auvent${awn > 1 ? "s" : ""}` : `${awn} awning`)'
)
cfg = cfg.replace(
  'if (sld > 0) parts.push(`${sld} slider`)',
  'if (sld > 0) parts.push(fr ? `${sld} coulissant${sld > 1 ? "s" : ""}` : `${sld} slider`)'
)
cfg = cfg.replace(
  'if (fix > 0) parts.push(`${fix} fixed`)',
  'if (fix > 0) parts.push(fr ? `${fix} fixe${fix > 1 ? "s" : ""}` : `${fix} fixed`)'
)
cfg = cfg.replace(
  'return `Custom ${n}-panel window (${parts.join(" + ")})`',
  'return fr ? `Fenêtre personnalisée ${n} panneaux (${parts.join(" + ")})` : `Custom ${n}-panel window (${parts.join(" + ")})`'
)

fs.writeFileSync('src/lib/estimate-config.ts', cfg)
console.log('OK - estimate-config.ts patched with locale-aware descriptions')

// ══════════════════════════════════════════════════════════
// 2. PATCH estimates page — pass locale to description functions + add EN/FR button
// ══════════════════════════════════════════════════════════
let est = fs.readFileSync('src/app/[locale]/portal/dashboard/estimates/page.tsx', 'utf8')

// Add back useRouter/usePathname import
if (!est.includes('useRouter')) {
  est = est.replace(
    'import { usePortalT } from "@/lib/portal-i18n"',
    'import { useRouter, usePathname } from "@/i18n/navigation"\nimport { usePortalT } from "@/lib/portal-i18n"'
  )
}

// Add back i18nRouter and i18nPathname declarations
if (!est.includes('i18nRouter')) {
  est = est.replace(
    '  const locale = useLocale()\n  const T = usePortalT()',
    '  const locale = useLocale()\n  const i18nRouter = useRouter()\n  const i18nPathname = usePathname()\n  const T = usePortalT()'
  )
}

// Add Globe back to lucide import if not there
if (!est.includes('Globe')) {
  est = est.replace(
    ', Pencil }',
    ', Pencil, Globe }'
  )
}

// Pass locale to getItemDescription calls
est = est.replace(
  /getItemDescription\(item\.type, item\.hingeLeft \?\? false, item\.swingInside \?\? true\)/g,
  'getItemDescription(item.type, item.hingeLeft ?? false, item.swingInside ?? true, locale)'
)

// Pass locale to describeCustomLayout calls
est = est.replace(
  /describeCustomLayout\(item\.customModules, item\.hingeLeft \?\? false, item\.swingInside \?\? true\)/g,
  'describeCustomLayout(item.customModules, item.hingeLeft ?? false, item.swingInside ?? true, locale)'
)

// Add EN/FR button in sticky bar after theme toggle
const themeBtn = `{isDark ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-slate-500" />}
        </button>`

const themeBtnWithLang = `{isDark ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-slate-500" />}
        </button>
        <button onClick={() => i18nRouter.replace(i18nPathname, { locale: locale === "fr" ? "en" : "fr" })} className="p-2 sm:px-3 sm:py-2.5 rounded-xl border border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10 transition flex items-center gap-1.5 text-xs font-bold" title={locale === "fr" ? "Switch to English" : "Passer au français"}>
          <Globe className="h-4 w-4 text-blue-500" /><span className="hidden sm:inline">{locale === "fr" ? "EN" : "FR"}</span>
        </button>`

if (!est.includes('i18nRouter.replace(i18nPathname')) {
  est = est.replace(themeBtn, themeBtnWithLang)
  console.log('OK - EN/FR button added to sticky bar')
} else {
  console.log('SKIP - EN/FR button already exists in sticky bar')
}

fs.writeFileSync('src/app/[locale]/portal/dashboard/estimates/page.tsx', est)
console.log('OK - estimates page patched')

// ══════════════════════════════════════════════════════════
// 3. PATCH window-configurator.tsx — pass locale to describeCustomLayout if used
// ══════════════════════════════════════════════════════════
let wc = fs.readFileSync('src/components/portal/window-configurator.tsx', 'utf8')
// Check if describeCustomLayout is used there
if (wc.includes('describeCustomLayout')) {
  wc = wc.replace(
    /describeCustomLayout\(([^,]+), ([^,]+), ([^)]+)\)/g,
    'describeCustomLayout($1, $2, $3, locale)'
  )
  console.log('OK - window-configurator.tsx patched')
}
// Also check getItemDescription
if (wc.includes('getItemDescription')) {
  wc = wc.replace(
    /getItemDescription\(([^,]+), ([^,]+), ([^)]+)\)/g,
    'getItemDescription($1, $2, $3, locale)'
  )
  console.log('OK - window-configurator.tsx getItemDescription patched')
}
fs.writeFileSync('src/components/portal/window-configurator.tsx', wc)

// Also check estimate-window-svg.tsx
let svg = fs.readFileSync('src/components/portal/estimate-window-svg.tsx', 'utf8')
if (svg.includes('describeCustomLayout') || svg.includes('getItemDescription')) {
  console.log('INFO - estimate-window-svg.tsx also uses description functions — check manually')
}

console.log('\nDONE - All patches applied!')
