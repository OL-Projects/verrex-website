const fs = require('fs')
let c = fs.readFileSync('src/components/portal/window-configurator.tsx', 'utf8')

// Add useLocale import
if (!c.includes('useLocale')) {
  c = c.replace(
    'import { usePortalT } from "@/lib/portal-i18n"',
    'import { useLocale } from "next-intl"\nimport { usePortalT } from "@/lib/portal-i18n"'
  )
}

// Add locale variable in the component body
if (!c.includes('const locale = useLocale()')) {
  c = c.replace(
    'export function WindowConfigurator({ item, onSave, onClear, editTrigger, onSwingChange }: Props) {',
    'export function WindowConfigurator({ item, onSave, onClear, editTrigger, onSwingChange }: Props) {\n  const locale = useLocale()'
  )
}

fs.writeFileSync('src/components/portal/window-configurator.tsx', c)
console.log('OK - useLocale added to window-configurator.tsx')
