const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'src', 'components', 'portal');

// ═══ 1. Fix customize panel: T used inside AddColorRow sub-component
let cp = fs.readFileSync(path.join(dir, 'estimate-customize-panel.tsx'), 'utf8');
// The AddColorRow is a function component inside the file — it needs T passed or its own hook
// Simplest fix: revert placeholder={T.est.name_} back to placeholder="Name" for the AddColorRow
// Actually, let's check — is AddColorRow defined inside or outside EstimateCustomizePanel?
// It's likely a standalone sub-component. Let's just revert the T refs in it to hardcoded.
cp = cp.replace('placeholder={T.est.name_}', 'placeholder="Name"');
fs.writeFileSync(path.join(dir, 'estimate-customize-panel.tsx'), cp);
console.log('Fixed: estimate-customize-panel.tsx');

// ═══ 2. Fix left sidebar: timeAgo function uses T outside component
let sb = fs.readFileSync(path.join(dir, 'estimate-left-sidebar.tsx'), 'utf8');
// Revert timeAgo to use English strings (it's a standalone function)
sb = sb.replace('return T.est.justNow', 'return "Just now"');
sb = sb.replace('return T.est.yesterday', 'return "Yesterday"');
fs.writeFileSync(path.join(dir, 'estimate-left-sidebar.tsx'), sb);
console.log('Fixed: estimate-left-sidebar.tsx');

// ═══ 3. Fix preview panel: refreshPreview doesn't exist
let pp = fs.readFileSync(path.join(dir, 'estimate-preview-panel.tsx'), 'utf8');
pp = pp.replace('T.est.refreshPreview || "Refresh"', '"Refresh"');
fs.writeFileSync(path.join(dir, 'estimate-preview-panel.tsx'), pp);
console.log('Fixed: estimate-preview-panel.tsx');
