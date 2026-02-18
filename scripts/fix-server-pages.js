const fs = require('fs');
const files = [
  'src/app/[locale]/about/page.tsx',
  'src/app/[locale]/services/page.tsx'
];
for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace("import { useTranslations } from 'next-intl'", "import { getTranslations } from 'next-intl/server'");
  c = c.replace(/const t = useTranslations\(([^)]+)\)/, 'const t = await getTranslations($1)');
  c = c.replace('export default function', 'export default async function');
  fs.writeFileSync(f, c);
  console.log('Fixed: ' + f);
}
