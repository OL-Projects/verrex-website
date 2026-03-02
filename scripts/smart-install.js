const fs = require('fs');
const path = require('path');

// ═══ 1. estimate-config.ts — Add InstallMethod type + update getItemInstallCost ═══
const cfgPath = path.join(__dirname, '..', 'src', 'lib', 'estimate-config.ts');
let cfg = fs.readFileSync(cfgPath, 'utf8');

// Add InstallMethod type after TrimUnit
if (!cfg.includes('InstallMethod')) {
  cfg = cfg.replace(
    'export type TrimUnit =',
    `// ── Installation Pricing ─────────────────────────
export type InstallMethod = "per-unit" | "per-sqin" | "per-sqft" | "per-sqm" | "pct-price" | "per-lin-in" | "per-lin-ft" | "per-lin-cm"

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

export type TrimUnit =`
  );
  console.log('✅ Added InstallMethod type + INSTALL_METHODS + InstallPricingSettings');
}

// Replace getItemInstallCost with the new smart version
const oldInstallCost = `export function getItemInstallCost(it: EstimateItem, globalInstallPerUnit: number): number {
  if (it.installOverride && it.installPrice > 0) return it.installPrice
  return globalInstallPerUnit
}`;

const newInstallCost = `export function getItemInstallCost(it: EstimateItem, globalInstallPerUnit: number, installSettings?: InstallPricingSettings): number {
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
    case "per-sqin":   return \`\${w}×\${h} = \${w*h} sq in × $\${r.toFixed(2)}\`
    case "per-sqft":   { const sf = ((w/12)*(h/12)); return \`\${sf.toFixed(1)} sq ft × $\${r.toFixed(2)}\` }
    case "per-sqm":    { const sm = ((w*0.0254)*(h*0.0254)); return \`\${sm.toFixed(2)} sq m × $\${r.toFixed(2)}\` }
    case "pct-price":  return \`$\${fmt(it.unitPrice)} × \${r}%\`
    case "per-lin-in": return \`\${perimeterInches(w,h)}" perim × $\${r.toFixed(2)}\`
    case "per-lin-ft": return \`\${perimeterFeet(w,h).toFixed(1)} ft perim × $\${r.toFixed(2)}\`
    case "per-lin-cm": return \`\${(perimeterInches(w,h)*2.54).toFixed(0)} cm perim × $\${r.toFixed(2)}\`
    default: return ""
  }
}`;

if (cfg.includes(oldInstallCost)) {
  cfg = cfg.replace(oldInstallCost, newInstallCost);
  console.log('✅ Replaced getItemInstallCost with smart version');
} else {
  console.log('⚠️ Could not find old getItemInstallCost — trying regex');
  cfg = cfg.replace(
    /export function getItemInstallCost\(it: EstimateItem, globalInstallPerUnit: number\): number \{[^}]+\}/,
    newInstallCost
  );
  console.log('✅ Replaced getItemInstallCost (regex)');
}

// Update calcTotals to accept InstallPricingSettings
cfg = cfg.replace(
  'export function calcTotals(est: EstimateState, gstRate = 5, qstRate = 9.975, glassSettings?: GlassPricingSettings, flags?: CalcTotalsFlags, trimSettings?: TrimRateSettings)',
  'export function calcTotals(est: EstimateState, gstRate = 5, qstRate = 9.975, glassSettings?: GlassPricingSettings, flags?: CalcTotalsFlags, trimSettings?: TrimRateSettings, installSettings?: InstallPricingSettings)'
);

cfg = cfg.replace(
  'installTotal += it.qty * getItemInstallCost(it, est.installPerUnit)',
  'installTotal += it.qty * getItemInstallCost(it, est.installPerUnit, installSettings)'
);

fs.writeFileSync(cfgPath, cfg);
console.log('✅ estimate-config.ts complete');

// ═══ 2. estimate-hooks.ts — Add install settings to EstimateSettings ═══
const hookPath = path.join(__dirname, '..', 'src', 'lib', 'estimate-hooks.ts');
let hook = fs.readFileSync(hookPath, 'utf8');

// Add import for InstallMethod
if (!hook.includes('InstallMethod')) {
  hook = hook.replace(
    'type TrimUnit, type DimensionUnit,',
    'type TrimUnit, type DimensionUnit, type InstallMethod,'
  );
}

// Add fields to EstimateSettings interface
if (!hook.includes('installMethod:')) {
  hook = hook.replace(
    '  // Pricing summary',
    `  // Installation pricing method
  installMethod: InstallMethod
  installRate: number
  // Pricing summary`
  );
  // Add defaults
  hook = hook.replace(
    'showInstallation: true, showDelivery: true,',
    `installMethod: "per-unit" as InstallMethod,
    installRate: 25,
    showInstallation: true, showDelivery: true,`
  );
  console.log('✅ Added installMethod + installRate to settings');
}

fs.writeFileSync(hookPath, hook);
console.log('✅ estimate-hooks.ts complete');

// ═══ 3. page.tsx — pass installSettings to calculations + show formula ═══
const pgPath = path.join(__dirname, '..', 'src', 'app', '[locale]', 'portal', 'dashboard', 'estimates', 'page.tsx');
let pg = fs.readFileSync(pgPath, 'utf8');

// Import getInstallFormula and INSTALL_METHODS
if (!pg.includes('getInstallFormula')) {
  pg = pg.replace(
    "inToDisplay, displayToIn, dimLabel, TRIM_UNITS, tl,",
    "inToDisplay, displayToIn, dimLabel, TRIM_UNITS, tl, getInstallFormula, INSTALL_METHODS, type InstallPricingSettings,"
  );
}

// Add installS memo (like trimS)
if (!pg.includes('installS:')) {
  pg = pg.replace(
    'const trimS: TrimRateSettings',
    'const installS: InstallPricingSettings = useMemo(() => ({ installMethod: estCfg.installMethod ?? "per-unit", installRate: estCfg.installRate ?? 25 }), [estCfg.installMethod, estCfg.installRate])\n  const trimS: TrimRateSettings'
  );
}

// Update calcTotals call to include installSettings
pg = pg.replace(
  'calcTotals(est, estCfg.gstRate, estCfg.qstRate, estCfg, { showInstallation: estCfg.showInstallation, showDelivery: estCfg.showDelivery, showGST: estCfg.showGST, showQST: estCfg.showQST }, trimS)',
  'calcTotals(est, estCfg.gstRate, estCfg.qstRate, estCfg, { showInstallation: estCfg.showInstallation, showDelivery: estCfg.showDelivery, showGST: estCfg.showGST, showQST: estCfg.showQST }, trimS, installS)'
);

// Update getItemInstallCost calls in the item card to pass installS
pg = pg.replace(
  /getItemInstallCost\(item, est\.installPerUnit\)/g,
  'getItemInstallCost(item, est.installPerUnit, installS)'
);

// Add formula display in the installation box — after the install cost display
// Find the install cost line and add formula below it
pg = pg.replace(
  `<span className="text-xs font-bold text-blue-600 dark:text-blue-400">{fmt(getItemInstallCost(item, est.installPerUnit, installS))}</span>`,
  `<span className="text-xs font-bold text-blue-600 dark:text-blue-400">{fmt(getItemInstallCost(item, est.installPerUnit, installS))}</span>
                          </div>
                          {getInstallFormula(item, installS) && <p className="text-[8px] text-blue-400 mt-0.5">{getInstallFormula(item, installS)}</p>`
);

fs.writeFileSync(pgPath, pg);
console.log('✅ page.tsx complete');

// ═══ 4. estimate-customize-panel.tsx — add install method settings UI ═══
const panelPath = path.join(__dirname, '..', 'src', 'components', 'portal', 'estimate-customize-panel.tsx');
let panel = fs.readFileSync(panelPath, 'utf8');

// Add INSTALL_METHODS import
if (!panel.includes('INSTALL_METHODS')) {
  panel = panel.replace(
    'WINDOW_TYPES, PRODUCTS, GLASS_RATE_UNITS, TRIM_UNITS, type PaymentStageConfig',
    'WINDOW_TYPES, PRODUCTS, GLASS_RATE_UNITS, TRIM_UNITS, INSTALL_METHODS, type PaymentStageConfig'
  );
}

// Find the installation section in settings and add method controls
// Look for the showInstallation toggle and add method controls after it
if (!panel.includes('installMethod')) {
  // Find the installation toggle checkbox and add the method selector after it
  panel = panel.replace(
    /{\/\* Installation \*\/}[\s\S]*?<label[^>]*>[\s\S]*?showInstallation[\s\S]*?<\/label>/,
    (match) => {
      return match + `
              {settings.showInstallation && (
                <div className="ml-6 mt-2 space-y-2 border-l-2 border-blue-200 dark:border-blue-500/20 pl-3">
                  <div>
                    <label className={CLS.lbl}>Install Pricing Method</label>
                    <select value={settings.installMethod ?? "per-unit"} onChange={e => onUpdateSettings({ installMethod: e.target.value as any })} className={CLS.sel}>
                      {INSTALL_METHODS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={CLS.lbl}>Rate {INSTALL_METHODS.find(m => m.id === (settings.installMethod ?? "per-unit"))?.short}</label>
                    <input type="number" min={0} step={0.01} value={settings.installRate ?? 25} onChange={e => onUpdateSettings({ installRate: +e.target.value })} className={CLS.inp} />
                  </div>
                </div>
              )}`
    }
  );
  console.log('✅ Added install method controls to settings panel');
}

fs.writeFileSync(panelPath, panel);
console.log('✅ estimate-customize-panel.tsx complete');

console.log('\n✅ Smart Installation Pricing — all files updated');
