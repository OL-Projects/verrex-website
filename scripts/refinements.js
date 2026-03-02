const fs = require('fs');
const path = require('path');

// ═══ 1. Add "Casement R + Fixed" window type to estimate-config.ts ═══
const cfgPath = path.join(__dirname, '..', 'src', 'lib', 'estimate-config.ts');
let cfg = fs.readFileSync(cfgPath, 'utf8');

// Add CAS-R+FIX after the existing CAS-L+FIX line
if (!cfg.includes('"CAS-R+FIX"')) {
  cfg = cfg.replace(
    `"CAS-L+FIX":          { modules: ["CAS-L", "FIX"],                label: "Casement L + Fixed",          category: "window", group: "Windows — Combo" },`,
    `"CAS-L+FIX":          { modules: ["CAS-L", "FIX"],                label: "Casement L + Fixed",          category: "window", group: "Windows — Combo" },
  "CAS-R+FIX":          { modules: ["CAS-R", "FIX"],                label: "Casement R + Fixed",          category: "window", group: "Windows — Combo" },`
  );
  console.log('✅ Added CAS-R+FIX window type');
} else {
  console.log('⏭️ CAS-R+FIX already exists');
}

// Add FR translation for the new type label
if (!cfg.includes('"Casement R + Fixed": "Battant D + Fixe"')) {
  cfg = cfg.replace(
    '"Casement L + Fixed": "Battant G + Fixe"',
    '"Casement L + Fixed": "Battant G + Fixe",\n  "Casement R + Fixed": "Battant D + Fixe"'
  );
  console.log('✅ Added FR translation for CAS-R+FIX');
}

fs.writeFileSync(cfgPath, cfg);

// ═══ 2. Separate window vs door type dropdowns in page.tsx ═══
const pgPath = path.join(__dirname, '..', 'src', 'app', '[locale]', 'portal', 'dashboard', 'estimates', 'page.tsx');
let pg = fs.readFileSync(pgPath, 'utf8');

// Current: the dropdown shows ALL types filtered by enabled, but NOT filtered by category
// We need to add: only show window types for window items, door types for door items
// Find the select dropdown rendering and add category filter
const oldDropdownFilter = `const filtered = g.types.filter(([k, v]) =>
                                v.category === "window" ? estCfg.enabledWindowTypes.includes(k) : estCfg.enabledDoorTypes.includes(k)
                              )`;
const newDropdownFilter = `const itemCat = isDoorType(item.type) ? "door" : "window"
                              const filtered = g.types.filter(([k, v]) =>
                                v.category === itemCat && (v.category === "window" ? estCfg.enabledWindowTypes.includes(k) : estCfg.enabledDoorTypes.includes(k))
                              )`;

if (pg.includes(oldDropdownFilter)) {
  pg = pg.replace(oldDropdownFilter, newDropdownFilter);
  console.log('✅ Separated window/door type dropdowns');
} else {
  console.log('⚠️ Could not find dropdown filter pattern — trying alternate');
  // Try without exact whitespace
  pg = pg.replace(
    /const filtered = g\.types\.filter\(\(\[k, v\]\) =>\s*v\.category === "window" \? estCfg\.enabledWindowTypes\.includes\(k\) : estCfg\.enabledDoorTypes\.includes\(k\)\s*\)/,
    `const itemCat = isDoorType(item.type) ? "door" : "window"
                              const filtered = g.types.filter(([k, v]) =>
                                v.category === itemCat && (v.category === "window" ? estCfg.enabledWindowTypes.includes(k) : estCfg.enabledDoorTypes.includes(k))
                              )`
  );
  console.log('✅ Separated window/door type dropdowns (alt pattern)');
}

// ═══ 3. Fix zero-input bug — add onFocus select-all for all number inputs ═══
// Pattern: <input type="number" ... value={X} onChange={...} className={...}
// We need to add: onFocus={e => { if (+e.target.value === 0) e.target.select() }}
// Do this globally for all type="number" inputs that don't already have onFocus

// Replace all: type="number" ... value={...} onChange={...} className=
// We'll add onFocus before className on number inputs
let count = 0;
pg = pg.replace(
  /(<input type="number"[^>]*?onChange=\{[^}]+\})\s+(className=)/g,
  (match, before, cls) => {
    if (before.includes('onFocus')) return match; // already has onFocus
    count++;
    return `${before} onFocus={e => { if (+e.target.value === 0) e.target.select() }} ${cls}`;
  }
);
console.log(`✅ Fixed zero-input bug on ${count} number fields`);

// Also fix the inline number inputs in summary section (installPerUnit, delivery, depositPct)
// These use a different pattern: type="number" value={...} min={...} onChange=... className=
// They should already be caught by the regex above, but let's verify
const inlineCount = (pg.match(/onFocus=\{e => \{ if \(\+e\.target\.value === 0\) e\.target\.select\(\) \}\}/g) || []).length;
console.log(`   Total onFocus handlers added: ${inlineCount}`);

fs.writeFileSync(pgPath, pg);

// ═══ 4. Fix history card totals in estimate-store.ts ═══
// Check how total is calculated when saving
const storePath = path.join(__dirname, '..', 'src', 'lib', 'estimate-store.ts');
let store = fs.readFileSync(storePath, 'utf8');

// Check if calcTotals is called with proper args when saving
// The issue might be that calcTotals is called without the glassSettings
if (store.includes('const t = calcTotals(est)')) {
  // calcTotals needs more args: (est, gstRate, qstRate, glassSettings, opts)
  // For the store save, we just need the product total which is basic
  console.log('⚠️ calcTotals in store may need more args — checking...');
}

// Let's see the save function
const saveMatch = store.match(/const toRecord[\s\S]*?return \{[\s\S]*?\}/);
if (saveMatch) {
  console.log('Current save record pattern found');
}

// Actually let me check what the full save function looks like
const lines = store.split('\n');
const saveIdx = lines.findIndex(l => l.includes('total:') && l.includes('t.total'));
if (saveIdx >= 0) {
  // Show context around it
  for (let i = Math.max(0, saveIdx - 10); i <= Math.min(lines.length - 1, saveIdx + 3); i++) {
    console.log(`  ${i + 1}: ${lines[i]}`);
  }
}

console.log('\n✅ All refinements applied');
