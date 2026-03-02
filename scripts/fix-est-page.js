const fs = require('fs')
const path = 'src/app/[locale]/portal/dashboard/estimates/page.tsx'
let c = fs.readFileSync(path, 'utf8')

// 1. Remove Globe from lucide import
c = c.replace(/, Globe,/g, ',')

// 2. Remove Globe button from sticky bar (3 lines)
const globeBtnStart = c.indexOf('i18nRouter.replace(i18nPathname')
if (globeBtnStart > 0) {
  // Find the <button that contains this
  let btnStart = c.lastIndexOf('<button', globeBtnStart)
  // Find the closing </button> after the Globe
  let btnEnd = c.indexOf('</button>', globeBtnStart)
  if (btnStart > 0 && btnEnd > 0) {
    btnEnd += '</button>'.length
    // Also remove trailing whitespace/newline
    while (c[btnEnd] === '\n' || c[btnEnd] === '\r' || c[btnEnd] === ' ') btnEnd++
    c = c.substring(0, btnStart) + c.substring(btnEnd)
    console.log('OK - Globe button removed from sticky bar')
  }
}

// 3. Remove i18nRouter and i18nPathname declarations
c = c.replace(/\s*const i18nRouter = useRouter\(\)\n/, '\n')
c = c.replace(/\s*const i18nPathname = usePathname\(\)\n/, '\n')

// 4. Remove useRouter/usePathname import if no longer used
if (!c.includes('useRouter(') && !c.includes('usePathname(')) {
  c = c.replace(/import \{ useRouter, usePathname \} from "@\/i18n\/navigation"\n/, '')
}

// 5. Fix glass spec labels: replace hardcoded English with T.est.* keys
const glassLabelMap = {
  '["thermal", "Thermal"': '["thermal", T.est.thermal',
  '["lowE", "Low E"': '["lowE", T.est.lowELabel',
  '["glassThickness", "Glass Thickness"': '["glassThickness", T.est.glassLabel',
  '["argonGas", "Argon Gas"': '["argonGas", T.est.argonLabel',
  '["glassType", "Glass Type"': '["glassType", T.est.typeLabel',
  '["glassFinish", "Glass Finish"': '["glassFinish", T.est.finishLabel',
  '["screen", "Screen"': '["screen", T.est.screenLabel',
}
for (const [from, to] of Object.entries(glassLabelMap)) {
  c = c.replace(from, to)
}

// 6. Fix the bottom strip "Customize" and "Reset" hardcoded text
c = c.replace(/<Pencil className="w-3 h-3" \/> Customize/g, '<Pencil className="w-3 h-3" /> {T.est.customizeLayout}')
c = c.replace(/<RotateCcw className="w-3 h-3" \/> Reset/g, '<RotateCcw className="w-3 h-3" /> {T.reset}')

fs.writeFileSync(path, c)
console.log('OK - All estimates page fixes applied')
