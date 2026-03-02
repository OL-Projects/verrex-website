const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'src', 'components', 'portal');

['estimate-customize-panel.tsx', 'estimate-left-sidebar.tsx', 'estimate-preview-panel.tsx'].forEach(file => {
  let f = fs.readFileSync(path.join(dir, file), 'utf8');
  
  // Fix: Inside JS objects/arrays, {T.est.x} should be T.est.x
  // Pattern: property: {T.est.xxx} → property: T.est.xxx  (in arrays/objects)
  // This happens when label is in an object like { label: {T.est.x}, ... }
  f = f.replace(/:\s*\{(T\.\w+(?:\.\w+)*)\}/g, ': $1');
  
  // Fix: Inside arrays like [{T.est.x}, ...] → [T.est.x, ...]
  f = f.replace(/\[\{(T\.\w+(?:\.\w+)*)\}/g, '[$1');
  
  // Fix: placeholder={"{T.est.x}"} → placeholder={T.est.x}
  // Already handled by script, but just in case
  f = f.replace(/=\{"\{(T\.\w+(?:\.\w+)*)\}"\}/g, '={$1}');
  
  // Fix: In template literals `${"{T.est.x}"}` shouldn't happen but check
  // Fix: Inside confirm() or other function calls: ({T.est.x}) → (T.est.x)
  f = f.replace(/\(\{(T\.\w+(?:\.\w+)*)\}\)/g, '($1)');
  
  // Fix: === {T.est.x} → === T.est.x  (in comparisons)
  f = f.replace(/===\s*\{(T\.\w+(?:\.\w+)*)\}/g, '=== $1');
  f = f.replace(/!==\s*\{(T\.\w+(?:\.\w+)*)\}/g, '!== $1');
  
  // Fix: placeholder="{T.est.x}" → placeholder={T.est.x}
  f = f.replace(/placeholder="\{(T\.\w+(?:\.\w+)*)\}"/g, 'placeholder={$1}');
  
  // Fix: value="{T.est.x}" → value={T.est.x}
  f = f.replace(/value="\{(T\.\w+(?:\.\w+)*)\}"/g, 'value={$1}');
  
  // Fix: || "{T.est.x}" → || T.est.x
  f = f.replace(/\|\|\s*"\{(T\.\w+(?:\.\w+)*)\}"/g, '|| $1');
  
  // Fix: , {T.est.x}, inside arrays → , T.est.x, 
  f = f.replace(/,\s*\{(T\.\w+(?:\.\w+)*)\}\s*,/g, ', $1,');
  f = f.replace(/,\s*\{(T\.\w+(?:\.\w+)*)\}\s*\]/g, ', $1]');
  
  fs.writeFileSync(path.join(dir, file), f);
  console.log('Fixed: ' + file);
});
