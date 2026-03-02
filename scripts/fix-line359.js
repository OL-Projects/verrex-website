const fs = require('fs')
let c = fs.readFileSync('src/lib/estimate-config.ts', 'utf8')

// Fix line 359 — incomplete ternary for casement combo with flanking vents
c = c.replace(
  /if \(casL > 0 && casR > 0 && fix > 0\) return fr \? `Battant combo avec \$\{fix\} fixe\$\{fix > 1 \? "s" : ""\} \(\$\{n\} panneaux\) — ventilations latérales, \$\{swing\}`/,
  'if (casL > 0 && casR > 0 && fix > 0) return fr ? `Battant combo avec ${fix} fixe${fix > 1 ? "s" : ""} (${n} panneaux) — ventilations latérales, ${swing}` : `Casement combo with ${fix} fixed ${fix === 1 ? "panel" : "panels"} (${n} panel) — flanking vents, ${swing}`'
)

// Fix line 360 — French casement (both L and R, no fixed)
// This was already replaced earlier in the script but check if the second occurrence survived
c = c.replace(
  '    if (casL > 0 && casR > 0) return `${n}-panel French casement — ${swing}`',
  '    if (casL > 0 && casR > 0) return fr ? `Battant français ${n} panneaux — ${swing}` : `${n}-panel French casement — ${swing}`'
)

// Fix line 361 — Casement + fixed combo (single side)
c = c.replace(
  '    return `Casement + fixed combo (${n} panel) — hinge ${side}, ${swing}`',
  '    return fr ? `Battant + fixe combo (${n} panneaux) — charnière ${side}, ${swing}` : `Casement + fixed combo (${n} panel) — hinge ${side}, ${swing}`'
)

fs.writeFileSync('src/lib/estimate-config.ts', c)
console.log('OK - Lines 359-361 fixed')
