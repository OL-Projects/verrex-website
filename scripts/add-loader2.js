const fs = require('fs');
const p = 'src/app/[locale]/portal/dashboard/estimates/page.tsx';
let f = fs.readFileSync(p, 'utf8');
f = f.replace('Globe } from "lucide-react"', 'Globe, Loader2 } from "lucide-react"');
fs.writeFileSync(p, f);
console.log('Loader2 added to lucide-react import');
