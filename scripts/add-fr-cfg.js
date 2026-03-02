const fs = require('fs')
let c = fs.readFileSync('src/lib/portal-i18n.ts', 'utf8')
const marker = 'inLabel: "INT", outLabel: "EXT",'
const idx = c.lastIndexOf(marker)
if (idx > 0) {
  const insert = marker + '\n    // \u2500\u2500 Configurator \u2500\u2500\n    customLayout: "Configuration personnalis\u00e9e", addPanel: "+ Panneau", removePanel: "Retirer le panneau",\n    customizeLayout: "Personnaliser", panelCount: "panneau", panelsCount: "panneaux",'
  c = c.substring(0, idx) + insert + c.substring(idx + marker.length)
  fs.writeFileSync('src/lib/portal-i18n.ts', c)
  console.log('OK - FR configurator keys added')
} else {
  console.log('NOT FOUND')
}
