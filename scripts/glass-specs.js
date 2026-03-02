const fs = require('fs');

// ─── 1. estimate-config.ts: Add 6 fields to EstimateItem + createItem() ───
let cfg = fs.readFileSync('src/lib/estimate-config.ts', 'utf8');

// Add fields to EstimateItem interface (before the closing })
cfg = cfg.replace(
  /  installOverride: boolean.*\n  installPrice: number.*\n}/,
  `  installOverride: boolean
  installPrice: number
  // Glass specifications
  thermal: string
  lowE: string
  glassThickness: string
  argonGas: string
  glassType: string
  glassFinish: string
}`
);

// Add defaults to createItem()
cfg = cfg.replace(
  /    installOverride: false, installPrice: 0,\n  }/,
  `    installOverride: false, installPrice: 0,
    thermal: "Double", lowE: "1 Side", glassThickness: "5mm", argonGas: "18mm", glassType: "Ultra Clear", glassFinish: "Clear",
  }`
);

// Add GLASS_SPEC_DEFAULTS constant for settings
const glassSpecConst = `
// ═══ GLASS SPECIFICATION DEFAULTS ═══
export const GLASS_SPEC_DEFAULTS = {
  thermalOptions: ["Double", "Triple"],
  lowEOptions: ["1 Side", "2 Sides"],
  glassThicknessOptions: ["5mm", "6mm"],
  argonGasOptions: ["18mm", "24mm"],
  glassTypeOptions: ["Ultra Clear", "Other"],
  glassFinishOptions: ["Clear", "Frosted"],
} as const
`;

// Add before INSTALL_METHODS or at end of constants section
if (cfg.includes('export const INSTALL_METHODS')) {
  cfg = cfg.replace('export const INSTALL_METHODS', glassSpecConst + '\nexport const INSTALL_METHODS');
} else {
  cfg += glassSpecConst;
}

fs.writeFileSync('src/lib/estimate-config.ts', cfg);
console.log('✅ estimate-config.ts updated (EstimateItem + createItem + GLASS_SPEC_DEFAULTS)');

// ─── 2. estimate-hooks.ts: Add 6 option arrays to EstimateSettings ───
let hooks = fs.readFileSync('src/lib/estimate-hooks.ts', 'utf8');

// Add to EstimateSettings interface (before closing })
hooks = hooks.replace(
  /  installMethod\?: string\n  installRate\?: number\n}/,
  `  installMethod?: string
  installRate?: number
  // Glass spec options (customizable choices)
  thermalOptions?: string[]
  lowEOptions?: string[]
  glassThicknessOptions?: string[]
  argonGasOptions?: string[]
  glassTypeOptions?: string[]
  glassFinishOptions?: string[]
}`
);

// If no installMethod line, try another pattern
if (!hooks.includes('thermalOptions')) {
  // Try finding the end of EstimateSettings differently
  const settingsEnd = hooks.indexOf('\n}', hooks.indexOf('export interface EstimateSettings'));
  if (settingsEnd > 0) {
    hooks = hooks.slice(0, settingsEnd) + `
  // Glass spec options (customizable choices)
  thermalOptions?: string[]
  lowEOptions?: string[]
  glassThicknessOptions?: string[]
  argonGasOptions?: string[]
  glassTypeOptions?: string[]
  glassFinishOptions?: string[]
` + hooks.slice(settingsEnd);
  }
}

// Add defaults to the DEFAULT_SETTINGS object
hooks = hooks.replace(
  /installMethod: "per-unit",\s*installRate: 25,/,
  `installMethod: "per-unit", installRate: 25,
  thermalOptions: ["Double", "Triple"],
  lowEOptions: ["1 Side", "2 Sides"],
  glassThicknessOptions: ["5mm", "6mm"],
  argonGasOptions: ["18mm", "24mm"],
  glassTypeOptions: ["Ultra Clear", "Other"],
  glassFinishOptions: ["Clear", "Frosted"],`
);

// Bump version
hooks = hooks.replace(/const SETTINGS_VERSION = "v\d+"/, 'const SETTINGS_VERSION = "v9"');
// If no version found, try other patterns
if (!hooks.includes('v9')) {
  hooks = hooks.replace(/const SETTINGS_VERSION = "\w+"/, 'const SETTINGS_VERSION = "v9"');
}

fs.writeFileSync('src/lib/estimate-hooks.ts', hooks);
console.log('✅ estimate-hooks.ts updated (EstimateSettings + defaults + version bump)');

// ─── 3. page.tsx: Add 6 button-group rows to window card ───
let page = fs.readFileSync('src/app/[locale]/portal/dashboard/estimates/page.tsx', 'utf8');

// Add after the egress line and before the Trim section
const egressLine = `<p className={\`text-xs font-bold \${egress ? "text-green-600" : "text-red-500"}\`}>{T.est.egress}: {egress ? T.est.egressCompliant : T.est.egressNonCompliant}</p>`;

const glassSpecUI = `<p className={\`text-xs font-bold \${egress ? "text-green-600" : "text-red-500"}\`}>{T.est.egress}: {egress ? T.est.egressCompliant : T.est.egressNonCompliant}</p>
                        {/* Glass Specifications */}
                        <div className="rounded-lg border border-slate-200 dark:border-white/10 p-2.5 space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Glass Specifications</p>
                          {([
                            ["thermal", "Thermal", estCfg.thermalOptions ?? ["Double", "Triple"]],
                            ["lowE", "Low E", estCfg.lowEOptions ?? ["1 Side", "2 Sides"]],
                            ["glassThickness", "Glass Thickness", estCfg.glassThicknessOptions ?? ["5mm", "6mm"]],
                            ["argonGas", "Argon Gas", estCfg.argonGasOptions ?? ["18mm", "24mm"]],
                            ["glassType", "Glass Type", estCfg.glassTypeOptions ?? ["Ultra Clear", "Other"]],
                            ["glassFinish", "Glass Finish", estCfg.glassFinishOptions ?? ["Clear", "Frosted"]],
                          ] as [string, string, string[]][]).map(([field, label, options]) => (
                            <div key={field} className="flex items-center gap-2">
                              <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 w-24 shrink-0">{label}</span>
                              <div className="flex gap-0.5 flex-1">
                                {options.map(opt => (
                                  <button key={opt} onClick={() => updateItem(room.id, item.id, { [field]: opt })}
                                    className={\`flex-1 py-1 px-1.5 rounded-lg text-[9px] font-bold transition \${(item as any)[field] === opt || (!(item as any)[field] && opt === options[0]) ? "bg-slate-800 dark:bg-blue-600 text-white shadow-sm" : "bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10"}\`}>
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>`;

page = page.replace(egressLine, glassSpecUI);

fs.writeFileSync('src/app/[locale]/portal/dashboard/estimates/page.tsx', page);
console.log('✅ page.tsx updated (6 glass spec button groups on window cards)');

// ─── 4. estimate-customize-panel.tsx: Add option managers in Window Card settings ───
let panel = fs.readFileSync('src/components/portal/estimate-customize-panel.tsx', 'utf8');

// Add after the Interior Colors section, before Calculated Price
const glassSettingsUI = `
          <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-white/5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 mb-1.5">🔍 Glass Specifications</p>
            {([
              ["thermalOptions", "Thermal"],
              ["lowEOptions", "Low E"],
              ["glassThicknessOptions", "Glass Thickness"],
              ["argonGasOptions", "Argon Gas"],
              ["glassTypeOptions", "Glass Type"],
              ["glassFinishOptions", "Glass Finish"],
            ] as [keyof typeof s, string][]).map(([key, label]) => {
              const opts: string[] = (s as any)[key] ?? []
              return (
                <div key={key} className="mb-2">
                  <label className={CLS.lbl}>{label}</label>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {opts.map((opt: string, i: number) => (
                      <div key={i} className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <span className="text-[10px] font-medium">{opt}</span>
                        <button onClick={() => { const next = opts.filter((_: string, j: number) => j !== i); uSet({ [key]: next } as any) }}
                          className="text-red-400 hover:text-red-600"><Trash2 className="h-2.5 w-2.5" /></button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <input id={\`gs_\${key}\`} placeholder="Add option…" className={CLS.inp}
                      onKeyDown={e => { if (e.key === "Enter") { const inp = e.target as HTMLInputElement; if (inp.value.trim()) { uSet({ [key]: [...opts, inp.value.trim()] } as any); inp.value = "" } } }} />
                    <button onClick={() => { const inp = document.getElementById(\`gs_\${key}\`) as HTMLInputElement; if (inp?.value.trim()) { uSet({ [key]: [...opts, inp.value.trim()] } as any); inp.value = "" } }}
                      className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[9px] font-bold shrink-0"><Plus className="h-2.5 w-2.5 inline" /></button>
                  </div>
                </div>
              )
            })}
          </div>`;

// Insert before "Calculated Price" section
panel = panel.replace(
  `          <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-white/5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1.5">🔢 Calculated Price</p>`,
  glassSettingsUI + `

          <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-white/5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1.5">🔢 Calculated Price</p>`
);

fs.writeFileSync('src/components/portal/estimate-customize-panel.tsx', panel);
console.log('✅ estimate-customize-panel.tsx updated (Glass Spec option managers in Settings)');

console.log('\n✅ All 4 files updated for Glass Specifications feature');
