const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'src', 'components', 'portal');

// ═══ 1. ESTIMATE CUSTOMIZE PANEL ═══
let cp = fs.readFileSync(path.join(dir, 'estimate-customize-panel.tsx'), 'utf8');

// Add import
cp = cp.replace(
  'import { useState } from "react"',
  'import { useState } from "react"\nimport { usePortalT } from "@/lib/portal-i18n"'
);

// Add hook - find the component function and add T
cp = cp.replace(
  /export function EstimateCustomizePanel\(([^)]+)\)\s*\{/,
  'export function EstimateCustomizePanel($1) {\n  const T = usePortalT()'
);

// Section headers
const cpMap = {
  '"Estimate Header"': 'T.est.headerSection',
  '"Estimate Settings"': 'T.est.settingsTitle',
  '"Window Card"': 'T.est.windowCardSection',
  '"Door Card"': 'T.est.doorCardSection',
  '"Pricing Summary"': 'T.est.pricingSection',
  '"Measurements & Trim"': 'T.est.measureSection',
  '"Payment Stages"': 'T.est.paymentSection',
  '"Terms & Conditions"': 'T.est.termsSection',
  // Labels
  '"Window Types"': 'T.est.windowTypes',
  '"Door Types"': 'T.est.doorTypes',
  '"Products"': 'T.est.products',
  '"Custom Window Types"': 'T.est.customWindowTypes',
  '"Custom Door Types"': 'T.est.customDoorTypes',
  '"Custom Products"': 'T.est.customProducts',
  '"Exterior Colors"': 'T.est.exteriorColors',
  '"Interior Colors"': 'T.est.interiorColors',
  '"Module Labels"': 'T.est.moduleLabels',
  '"Egress Badge"': 'T.est.egressBadge',
  '"Dimensions"': 'T.est.dimensions',
  '"Exterior Label"': 'T.est.exteriorLabel',
  '"Name"': 'T.est.name_',
  '"Address"': 'T.est.address_',
  '"City"': 'T.est.city_',
  '"Phone"': 'T.est.phone_',
  '"Email"': 'T.est.email_',
  '"Signatures"': 'T.est.signatures',
  // Settings
  '"Reset All"': 'T.est.resetAllSettings',
  '"New Payment Stage"': 'T.est.newPaymentStage',
  '"Dimension Unit"': 'T.est.dimUnit',
  '"Trim Pricing"': 'T.est.trimPricing',
  '"Calculated Price"': 'T.est.calculatedPriceLabel',
  '"Double Tempered Glass Rate"': 'T.est.doubleTemperedRate',
  '"Triple Tempered Glass Rate"': 'T.est.tripleTemperedRate',
  '"Flat Trim Rate"': 'T.est.flatTrimRate',
  '"Colonial Trim Rate"': 'T.est.colonialTrimRate',
  '"Trim Rate Unit"': 'T.est.trimRateUnit',
};

for (const [from, to] of Object.entries(cpMap)) {
  // Replace in JSX contexts (>{from}<) and in prop contexts (label={from})
  const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  cp = cp.replace(regex, `{${to}}`);
}

// Fix double-braces in JSX: >{...}< is fine, but label={{T.est.x}} needs to be label={T.est.x}
// When used as prop value like label={"{T.est.x}"} → label={T.est.x}
cp = cp.replace(/=\{"\{([^}]+)\}"\}/g, '={$1}');
// When it's a child >{T.est.x}< that's fine already
// But when inside template literal or prop: title={"{T.est.x}"} → title={T.est.x}  
cp = cp.replace(/"\{(T\.\w+(?:\.\w+)*)\}"/g, '{$1}');

fs.writeFileSync(path.join(dir, 'estimate-customize-panel.tsx'), cp);
console.log('✅ estimate-customize-panel.tsx updated');

// ═══ 2. ESTIMATE LEFT SIDEBAR ═══
let sb = fs.readFileSync(path.join(dir, 'estimate-left-sidebar.tsx'), 'utf8');

// Add import
sb = sb.replace(
  'import { useState } from "react"',
  'import { useState } from "react"\nimport { usePortalT } from "@/lib/portal-i18n"'
);

// Add hook
sb = sb.replace(
  /export function EstimateLeftSidebar\(([^)]+)\)\s*\{/,
  'export function EstimateLeftSidebar($1) {\n  const T = usePortalT()'
);

// Replace hardcoded strings
const sbMap = {
  '"History"': '{T.est.history}',
  '"Templates"': '{T.est.templates}',
  '"Saving…"': '{T.est.saving}',
  '"Saved"': '{T.est.saved}',
  '"New"': '{T.est.new_}',
  '"Search estimates…"': '{T.est.searchEstimates}',
  '"Search templates…"': '{T.est.searchTemplates}',
  '"No estimates yet"': '{T.est.noEstimatesYet}',
  '"No templates saved yet"': '{T.est.noTemplatesYet}',
  '"No matches"': '{T.est.noMatches}',
  '"Template name…"': '{T.est.templateName}',
  '"Untitled"': '{T.est.untitled}',
  '"No client"': '{T.est.noClient}',
  '"Just now"': 'T.est.justNow',
  '"Yesterday"': 'T.est.yesterday',
  '"Delete this estimate?"': 'T.est.deleteEstimateConfirm',
  '"Delete this template?"': 'T.est.deleteTemplateConfirm',
};

for (const [from, to] of Object.entries(sbMap)) {
  sb = sb.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
}

// Fix "Apply this template?" confirm
sb = sb.replace(
  /confirm\("Apply this template\?[^"]*"\)/,
  'confirm(T.est.applyTemplateConfirm)'
);

// Fix "Save your estimate settings..." description
sb = sb.replace(
  '"Save your estimate settings as a reusable template"',
  '{T.est.noTemplatesDesc}'
);

// estimate(s) saved
sb = sb.replace('"estimate(s) saved"', '{T.est.estimatesSaved}');
sb = sb.replace('"template(s) saved"', '{T.est.templatesSaved}');

fs.writeFileSync(path.join(dir, 'estimate-left-sidebar.tsx'), sb);
console.log('✅ estimate-left-sidebar.tsx updated');

// ═══ 3. ESTIMATE PREVIEW PANEL ═══
let pp = fs.readFileSync(path.join(dir, 'estimate-preview-panel.tsx'), 'utf8');

// Add import
pp = pp.replace(
  'import { useState, useMemo } from "react"',
  'import { useState, useMemo } from "react"\nimport { usePortalT } from "@/lib/portal-i18n"'
);

// Add hook
pp = pp.replace(
  /export function EstimatePreviewPanel\(([^)]+)\)\s*\{/,
  'export function EstimatePreviewPanel($1) {\n  const T = usePortalT()'
);

// Replace
pp = pp.replace('"Estimate PDF Preview"', '{T.est.pdfPreview}');
pp = pp.replace('"Refresh Preview"', '{T.est.refreshPreview || "Refresh"}');

fs.writeFileSync(path.join(dir, 'estimate-preview-panel.tsx'), pp);
console.log('✅ estimate-preview-panel.tsx updated');

console.log('\n✅ All 3 sub-components updated with usePortalT()');
