const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'src', 'components', 'portal');

['estimate-customize-panel.tsx', 'estimate-left-sidebar.tsx'].forEach(file => {
  let f = fs.readFileSync(path.join(dir, file), 'utf8');
  
  // Fix: ?? {T.est.x} → ?? T.est.x  (inside JSX expressions)
  f = f.replace(/\?\?\s*\{(T\.\w+(?:\.\w+)*)\}/g, '?? $1');
  
  // Fix: || {T.est.x} → || T.est.x
  f = f.replace(/\|\|\s*\{(T\.\w+(?:\.\w+)*)\}/g, '|| $1');
  
  // Fix: ? {T.est.x} : → ? T.est.x :  (ternary)
  f = f.replace(/\?\s*\{(T\.\w+(?:\.\w+)*)\}\s*:/g, '? $1 :');
  
  // Fix: === 0 ? {T.est.x} → === 0 ? T.est.x
  f = f.replace(/\?\s*\{(T\.\w+(?:\.\w+)*)\}/g, '? $1');
  
  fs.writeFileSync(path.join(dir, file), f);
  console.log('Fixed: ' + file);
});
