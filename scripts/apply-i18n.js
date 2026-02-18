const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const appDir = path.join(srcDir, 'app', '[locale]');
const layoutDir = path.join(srcDir, 'components', 'layout');

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    console.log(`  SKIP (not found): ${filePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [search, replace] of replacements) {
    if (content.includes(search)) {
      content = content.replace(search, replace);
    } else {
      console.log(`  WARN: Could not find "${search.substring(0, 50)}..." in ${path.basename(filePath)}`);
    }
  }
  fs.writeFileSync(filePath, content);
  console.log(`  OK: ${path.relative(path.join(__dirname, '..'), filePath)}`);
}

function replaceAllInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [search, replace] of replacements) {
    content = content.split(search).join(replace);
  }
  fs.writeFileSync(filePath, content);
}

// ===== HEADER =====
console.log('\n--- Header ---');
replaceInFile(path.join(layoutDir, 'header.tsx'), [
  ['import Link from "next/link"', 
   'import { useTranslations } from \'next-intl\'\nimport { Link as IntlLink } from \'@/i18n/navigation\'\nimport { LanguageSwitcher } from \'./language-switcher\''],
  ['import { useRouter } from "next/navigation"',
   'import { useRouter } from \'@/i18n/navigation\''],
]);
// Add useTranslations hook after router
let headerContent = fs.readFileSync(path.join(layoutDir, 'header.tsx'), 'utf8');
if (!headerContent.includes('useTranslations(')) {
  headerContent = headerContent.replace(
    'const router = useRouter()',
    'const router = useRouter()\n  const t = useTranslations(\'Navigation\')'
  );
}
// Replace Link with IntlLink
headerContent = headerContent.split('<Link ').join('<IntlLink ');
headerContent = headerContent.split('</Link>').join('</IntlLink>');
// Add LanguageSwitcher next to ThemeToggle
if (!headerContent.includes('<LanguageSwitcher')) {
  headerContent = headerContent.replace('<ThemeToggle />', '<LanguageSwitcher />\n              <ThemeToggle />');
}
fs.writeFileSync(path.join(layoutDir, 'header.tsx'), headerContent);
console.log('  OK: header.tsx (full update)');

// ===== FOOTER =====
console.log('\n--- Footer ---');
let footerContent = fs.readFileSync(path.join(layoutDir, 'footer.tsx'), 'utf8');
// Add "use client" if not present
if (!footerContent.startsWith('"use client"')) {
  footerContent = '"use client"\n\n' + footerContent;
}
footerContent = footerContent.replace(
  'import Link from "next/link"',
  'import { useTranslations } from \'next-intl\'\nimport { Link as IntlLink } from \'@/i18n/navigation\''
);
// Add useTranslations inside Footer function
footerContent = footerContent.replace(
  'export function Footer() {',
  'export function Footer() {\n  const t = useTranslations(\'Footer\')'
);
footerContent = footerContent.split('<Link ').join('<IntlLink ');
footerContent = footerContent.split('</Link>').join('</IntlLink>');
fs.writeFileSync(path.join(layoutDir, 'footer.tsx'), footerContent);
console.log('  OK: footer.tsx');

// ===== PAGE FILES =====
const pageConfigs = [
  { file: 'page.tsx', namespace: 'HomePage', funcName: 'HomePage' },
  { file: 'about/page.tsx', namespace: 'AboutPage', funcName: 'AboutPage' },
  { file: 'catalog/page.tsx', namespace: 'CatalogPage', funcName: 'CatalogPage' },
  { file: 'contact/page.tsx', namespace: 'ContactPage', funcName: 'ContactPage' },
  { file: 'search/page.tsx', namespace: 'SearchPage', funcName: 'SearchPage' },
  { file: 'products/page.tsx', namespace: 'ProductsPage', funcName: 'ProductsPage' },
  { file: 'products/[id]/page.tsx', namespace: 'ProductDetail', funcName: 'ProductDetailPage' },
  { file: 'products/window-types/page.tsx', namespace: 'WindowTypes', funcName: 'WindowTypesPage' },
  { file: 'projects/page.tsx', namespace: 'ProjectsPage', funcName: 'ProjectsPage' },
  { file: 'quote/page.tsx', namespace: 'QuotePage', funcName: 'QuotePage' },
  { file: 'services/page.tsx', namespace: 'ServicesPage', funcName: 'ServicesPage' },
  { file: 'appointments/page.tsx', namespace: 'AppointmentsPage', funcName: 'AppointmentsPage' },
];

console.log('\n--- Pages ---');
for (const config of pageConfigs) {
  const filePath = path.join(appDir, config.file);
  if (!fs.existsSync(filePath)) {
    console.log(`  SKIP: ${config.file}`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace Link import with i18n imports
  if (content.includes('import Link from "next/link"')) {
    content = content.replace(
      'import Link from "next/link"',
      'import { useTranslations } from \'next-intl\'\nimport { Link as IntlLink } from \'@/i18n/navigation\''
    );
  } else {
    // No Link import - just add i18n imports after the last import
    const lastImportIdx = content.lastIndexOf('import ');
    const lineEnd = content.indexOf('\n', lastImportIdx);
    content = content.slice(0, lineEnd + 1) + 
      'import { useTranslations } from \'next-intl\'\nimport { Link as IntlLink } from \'@/i18n/navigation\'\n' + 
      content.slice(lineEnd + 1);
  }
  
  // Add useTranslations hook - find the function and add after it
  // Look for patterns like: export default function XxxPage() {
  const funcPattern = /export default (async )?function \w+\([^)]*\)\s*\{/;
  const funcMatch = content.match(funcPattern);
  if (funcMatch) {
    const insertPos = content.indexOf(funcMatch[0]) + funcMatch[0].length;
    if (!content.slice(insertPos, insertPos + 200).includes('useTranslations(')) {
      content = content.slice(0, insertPos) + 
        `\n  const t = useTranslations('${config.namespace}')` + 
        content.slice(insertPos);
    }
  }
  
  // Replace Link with IntlLink
  content = content.split('<Link ').join('<IntlLink ');
  content = content.split('<Link\n').join('<IntlLink\n');
  content = content.split('</Link>').join('</IntlLink>');
  
  fs.writeFileSync(filePath, content);
  console.log(`  OK: ${config.file}`);
}

console.log('\nAll i18n changes applied!');
