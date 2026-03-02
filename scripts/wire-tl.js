const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'src');

// ═══════════════════════════════════════════════
// 1. ESTIMATES PAGE.TSX — wire tl() into all data-driven labels
// ═══════════════════════════════════════════════
const pagePath = path.join(dir, 'app', '[locale]', 'portal', 'dashboard', 'estimates', 'page.tsx');
let pg = fs.readFileSync(pagePath, 'utf8');

// Add tl to imports from estimate-config (if not already there)
if (!pg.includes('tl,') && !pg.includes('tl }') && !pg.includes(', tl')) {
  pg = pg.replace(
    /from\s+["']@\/lib\/estimate-config["']/,
    (m) => {
      // Insert tl into the import
      return m; // We'll handle the import differently
    }
  );
  // Find the import line and add tl
  pg = pg.replace(
    /(import\s*\{[^}]*)(}\s*from\s*["']@\/lib\/estimate-config["'])/,
    '$1, tl $2'
  );
}

// ── Window Type <select> options: v.label → tl(v.label, locale)
// Pattern: {v.label} inside option elements for window types
pg = pg.replace(
  /getTypeGroups\(\)\.map\(g\s*=>/g,
  'getTypeGroups().map(g =>'
);

// Wrap window type option labels: >{ ... v.label ...} → tl(v.label, locale)
// These appear as: <option ...>{v.label}</option>
// or: {v.label} inside map over type entries
// Let's do a targeted replacement for the type select
pg = pg.replace(/\{v\.label\}/g, '{tl(v.label, locale)}');
pg = pg.replace(/"v\.label"/g, '{tl(v.label, locale)}');

// Wrap type group labels: g.group → tl(g.group, locale)
pg = pg.replace(/label=\{g\.group\}/g, 'label={tl(g.group, locale)}');

// Wrap product labels: p.label → tl(p.label, locale)
pg = pg.replace(/\{p\.label\}/g, '{tl(p.label, locale)}');

// Wrap color display: show the translated color name
// Pattern: {it.extColor} → {tl(it.extColor, locale)} (but only in visible UI, not in data)
// This is tricky — we only want to translate display labels, not data values
// So we target specific patterns: color name display in badges/spans
pg = pg.replace(/>\{it\.extColor\}</g, '>{tl(it.extColor, locale)}<');
pg = pg.replace(/>\{it\.intColor\}</g, '>{tl(it.intColor, locale)}<');

// Color preset labels in selects: c.name or the color string
// Pattern: <option value={c}>{c}</option> for color selects
// These typically use the color array values directly
pg = pg.replace(/>\{c\}<\/option>/g, '>{tl(c, locale)}</option>');

// Product tag display: find PRODUCTS.find(...)?.label
pg = pg.replace(
  /PRODUCTS\.find\(p\s*=>\s*p\.id\s*===\s*it\.product\)\?\.label/g,
  'tl(PRODUCTS.find(p => p.id === it.product)?.label || "", locale)'
);

// Window type label display: WINDOW_TYPES[it.type]?.label
pg = pg.replace(
  /WINDOW_TYPES\[it\.type\]\?\.label/g,
  'tl(WINDOW_TYPES[it.type]?.label || "", locale)'
);
pg = pg.replace(
  /WINDOW_TYPES\[item\.type\]\?\.label/g,
  'tl(WINDOW_TYPES[item.type]?.label || "", locale)'
);

// Payment stage labels: stage.label → tl(stage.label, locale)
pg = pg.replace(/\{stage\.label\}/g, '{tl(stage.label, locale)}');
pg = pg.replace(/>\{s\.label\}</g, '>{tl(s.label, locale)}<');

// "Sold To" / "Ship To" / "PICKUP" / "DELIVERY" labels
// These are from est.soldToLabel, est.shipToLabel, est.shipMethod
// Display only: wrap in tl()
pg = pg.replace(/>\{est\.soldToLabel\}</g, '>{tl(est.soldToLabel, locale)}<');
pg = pg.replace(/>\{est\.shipToLabel\}</g, '>{tl(est.shipToLabel, locale)}<');
pg = pg.replace(/>\{est\.shipMethod\}</g, '>{tl(est.shipMethod, locale)}<');

// Trim style display
pg = pg.replace(/"Flat"/g, (m, offset) => {
  // Only replace in visible UI context, not in data comparisons
  const before = pg.substring(Math.max(0, offset - 20), offset);
  if (before.includes('===') || before.includes('!==') || before.includes('trimStyle')) return m;
  return '{tl("Flat", locale)}';
});
pg = pg.replace(/"Colonial"/g, (m, offset) => {
  const before = pg.substring(Math.max(0, offset - 20), offset);
  if (before.includes('===') || before.includes('!==') || before.includes('trimStyle')) return m;
  return '{tl("Colonial", locale)}';
});

fs.writeFileSync(pagePath, pg);
console.log('✅ page.tsx — tl() wired');

// ═══════════════════════════════════════════════
// 2. ESTIMATE CUSTOMIZE PANEL — wire tl() into settings dropdowns
// ═══════════════════════════════════════════════
const cpPath = path.join(dir, 'components', 'portal', 'estimate-customize-panel.tsx');
let cp = fs.readFileSync(cpPath, 'utf8');

// Add tl to import (already imports from estimate-config)
if (!cp.includes(', tl') && !cp.includes('tl,')) {
  cp = cp.replace(
    /(import\s*\{[^}]*)(}\s*from\s*["']@\/lib\/estimate-config["'])/,
    '$1, tl $2'
  );
}

// Add locale hook
if (!cp.includes('useLocale')) {
  cp = cp.replace(
    'import { useState } from "react"',
    'import { useState } from "react"\nimport { useLocale } from "next-intl"'
  );
}
// Add locale inside component
if (!cp.includes('const locale = useLocale()')) {
  cp = cp.replace(
    'const T = usePortalT()',
    'const T = usePortalT()\n  const locale = useLocale()'
  );
}

// Wrap WINDOW_TYPES labels
cp = cp.replace(/\{v\.label\}/g, '{tl(v.label, locale)}');
cp = cp.replace(/\{p\.label\}/g, '{tl(p.label, locale)}');

// Wrap group labels  
cp = cp.replace(/label=\{g\.group\}/g, 'label={tl(g.group, locale)}');

// Trim units and glass rate units
cp = cp.replace(/\{u\.label\}/g, '{tl(u.label, locale)}');

// Payment stage labels
cp = cp.replace(/\{s\.label\}/g, '{tl(s.label, locale)}');

fs.writeFileSync(cpPath, cp);
console.log('✅ estimate-customize-panel.tsx — tl() wired');

// ═══════════════════════════════════════════════
// 3. ESTIMATE LEFT SIDEBAR — add locale for timeAgo
// ═══════════════════════════════════════════════
const sbPath = path.join(dir, 'components', 'portal', 'estimate-left-sidebar.tsx');
let sb = fs.readFileSync(sbPath, 'utf8');

// Add locale hook if not present
if (!sb.includes('useLocale')) {
  sb = sb.replace(
    'import { useState } from "react"',
    'import { useState } from "react"\nimport { useLocale } from "next-intl"'
  );
}
if (!sb.includes('const locale = useLocale()') && sb.includes('const T = usePortalT()')) {
  sb = sb.replace(
    'const T = usePortalT()',
    'const T = usePortalT()\n  const locale = useLocale()'
  );
}

// Fix the timeAgo function — make it accept a locale parameter
sb = sb.replace(
  'function timeAgo(iso: string): string {',
  'function timeAgo(iso: string, loc = "en"): string {'
);
sb = sb.replace(
  /if \(diff < 60000\) return "Just now"/,
  'if (diff < 60000) return loc === "fr" ? "À l\'instant" : "Just now"'
);
sb = sb.replace(
  /if \(diff < 172800000\) return "Yesterday"/,
  'if (diff < 172800000) return loc === "fr" ? "Hier" : "Yesterday"'
);
// Pass locale to timeAgo calls
sb = sb.replace(/timeAgo\(r\./g, 'timeAgo(r.');
// Actually need to find the timeAgo call and add locale
sb = sb.replace(/timeAgo\(r\.updatedAt\)/g, 'timeAgo(r.updatedAt, locale)');
sb = sb.replace(/timeAgo\(t\.updatedAt\)/g, 'timeAgo(t.updatedAt, locale)');

fs.writeFileSync(sbPath, sb);
console.log('✅ estimate-left-sidebar.tsx — locale wired');

// ═══════════════════════════════════════════════
// 4. ESTIMATE PDF DOC — wire tl() for product/type/color names
// ═══════════════════════════════════════════════
const pdfPath = path.join(dir, 'components', 'portal', 'estimate-pdf-doc.tsx');
let pdf = fs.readFileSync(pdfPath, 'utf8');

// Add tl to import if needed
if (!pdf.includes(', tl') && !pdf.includes('tl,')) {
  pdf = pdf.replace(
    /(import\s*\{[^}]*)(}\s*from\s*["']@\/lib\/estimate-config["'])/,
    '$1, tl $2'
  );
}

// In the PDF doc, locale is already available via the locale prop
// Wrap WINDOW_TYPES[...].label with tl(...)
pdf = pdf.replace(
  /WINDOW_TYPES\[it\.type\]\?\.label/g,
  'tl(WINDOW_TYPES[it.type]?.label || "", locale)'
);
pdf = pdf.replace(
  /WINDOW_TYPES\[item\.type\]\?\.label/g,
  'tl(WINDOW_TYPES[item.type]?.label || "", locale)'
);

// Product label
pdf = pdf.replace(
  /PRODUCTS\.find\(p\s*=>\s*p\.id\s*===\s*it\.product\)\?\.label/g,
  'tl(PRODUCTS.find(p => p.id === it.product)?.label || "", locale)'
);

// Color names in PDF
pdf = pdf.replace(/\{it\.extColor\}/g, '{tl(it.extColor, locale)}');
pdf = pdf.replace(/\{it\.intColor\}/g, '{tl(it.intColor, locale)}');

// Payment stage labels in PDF
pdf = pdf.replace(/\{stage\.label\}/g, '{tl(stage.label, locale)}');
pdf = pdf.replace(/\{s\.label\}/g, '{tl(s.label, locale)}');

fs.writeFileSync(pdfPath, pdf);
console.log('✅ estimate-pdf-doc.tsx — tl() wired');

console.log('\n✅ ALL COMPONENTS WIRED with tl() translator engine');
