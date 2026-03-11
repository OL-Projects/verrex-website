const fs = require('fs');
const path = require('path');

// Helper to update a file
function updateFile(filePath, changes) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [search, replace] of changes) {
    if (!content.includes(search)) {
      console.log(`⚠️  Pattern not found in ${path.basename(filePath)}: "${search.substring(0, 50)}..."`);
      continue;
    }
    content = content.replace(search, replace);
  }
  fs.writeFileSync(filePath, content);
  console.log(`✅ Updated ${filePath}`);
}

const base = path.join(__dirname, '..', 'src', 'app', '[locale]');

// 1. Products list page (client component)
updateFile(path.join(base, 'products', 'page.tsx'), [
  // Add import
  ['import { products } from "@/lib/data"', 'import { getLocalizedProducts } from "@/lib/data-i18n"'],
  // Add tData and localized products
  ["const t = useTranslations('ProductsPage')", "const t = useTranslations('ProductsPage')\n  const tData = useTranslations('ProductData')\n  const products = getLocalizedProducts(tData)"],
]);

// 2. Product detail page (server component)
updateFile(path.join(base, 'products', '[id]', 'page.tsx'), [
  // Add import
  ['import { products } from "@/lib/data"', 'import { getLocalizedProducts } from "@/lib/data-i18n"'],
  // Add tData after existing getTranslations
  ["const t = await getTranslations('ProductDetail')", "const t = await getTranslations('ProductDetail')\n  const tData = await getTranslations('ProductData')\n  const products = getLocalizedProducts(tData)"],
  // Remove the old products import usage in generateStaticParams - need to re-add raw import
]);

// Fix: generateStaticParams needs raw products (runs at build time, no locale)
const detailPath = path.join(base, 'products', '[id]', 'page.tsx');
let detailContent = fs.readFileSync(detailPath, 'utf8');
// Add raw products import for generateStaticParams
detailContent = detailContent.replace(
  'import { getLocalizedProducts } from "@/lib/data-i18n"',
  'import { products as rawProducts } from "@/lib/data"\nimport { getLocalizedProducts } from "@/lib/data-i18n"'
);
detailContent = detailContent.replace(
  'return products.map((product) => ({ id: product.id }))',
  'return rawProducts.map((product) => ({ id: product.id }))'
);
fs.writeFileSync(detailPath, detailContent);
console.log('✅ Fixed generateStaticParams in product detail page');

// 3. Windows page (client component)
const windowsPath = path.join(base, 'products', 'windows', 'page.tsx');
if (fs.existsSync(windowsPath)) {
  let wContent = fs.readFileSync(windowsPath, 'utf8');
  if (wContent.includes('import { products') && wContent.includes('from "@/lib/data"')) {
    wContent = wContent.replace(/import \{ products(?:.*?)\} from "@\/lib\/data"/, 'import { getLocalizedProducts } from "@/lib/data-i18n"');
    // Add tData
    if (wContent.includes("useTranslations('WindowsPage')")) {
      wContent = wContent.replace(
        "const t = useTranslations('WindowsPage')",
        "const t = useTranslations('WindowsPage')\n  const tData = useTranslations('ProductData')\n  const products = getLocalizedProducts(tData)"
      );
    }
    fs.writeFileSync(windowsPath, wContent);
    console.log('✅ Updated windows page');
  }
}

// 4. Doors page (client component)
const doorsPath = path.join(base, 'products', 'doors', 'page.tsx');
if (fs.existsSync(doorsPath)) {
  let dContent = fs.readFileSync(doorsPath, 'utf8');
  if (dContent.includes('import { products') && dContent.includes('from "@/lib/data"')) {
    dContent = dContent.replace(/import \{ products(?:.*?)\} from "@\/lib\/data"/, 'import { getLocalizedProducts } from "@/lib/data-i18n"');
    if (dContent.includes("useTranslations('DoorsPage')")) {
      dContent = dContent.replace(
        "const t = useTranslations('DoorsPage')",
        "const t = useTranslations('DoorsPage')\n  const tData = useTranslations('ProductData')\n  const products = getLocalizedProducts(tData)"
      );
    }
    fs.writeFileSync(doorsPath, dContent);
    console.log('✅ Updated doors page');
  }
}

// 5. Catalog page (client component)
const catalogPath = path.join(base, 'catalog', 'page.tsx');
if (fs.existsSync(catalogPath)) {
  let cContent = fs.readFileSync(catalogPath, 'utf8');
  if (cContent.includes('import { products') && cContent.includes('from "@/lib/data"')) {
    cContent = cContent.replace(/import \{ products(?:.*?)\} from "@\/lib\/data"/, 'import { getLocalizedProducts } from "@/lib/data-i18n"');
    if (cContent.includes("useTranslations('CatalogPage')")) {
      cContent = cContent.replace(
        "const t = useTranslations('CatalogPage')",
        "const t = useTranslations('CatalogPage')\n  const tData = useTranslations('ProductData')\n  const products = getLocalizedProducts(tData)"
      );
    }
    fs.writeFileSync(catalogPath, cContent);
    console.log('✅ Updated catalog page');
  }
}

// 6. Homepage - check if it imports products
const homePath = path.join(base, 'page.tsx');
if (fs.existsSync(homePath)) {
  let hContent = fs.readFileSync(homePath, 'utf8');
  if (hContent.includes('from "@/lib/data"') && hContent.includes('products')) {
    // Replace products import but keep other imports from data
    hContent = hContent.replace(
      /import \{([^}]*products[^}]*)\} from "@\/lib\/data"/,
      (match, imports) => {
        const otherImports = imports.split(',').map(s => s.trim()).filter(s => s !== 'products' && s !== '');
        const dataImports = otherImports.length > 0 ? `import { ${otherImports.join(', ')} } from "@/lib/data"\n` : '';
        return `${dataImports}import { getLocalizedProducts } from "@/lib/data-i18n"`;
      }
    );
    // For server component (homepage is likely server)
    if (hContent.includes('getTranslations')) {
      // Add tData after existing getTranslations call
      const match = hContent.match(/const \w+ = await getTranslations\(['"][^'"]+['"]\)/);
      if (match) {
        hContent = hContent.replace(
          match[0],
          `${match[0]}\n  const tData = await getTranslations('ProductData')\n  const products = getLocalizedProducts(tData)`
        );
      }
    } else if (hContent.includes('useTranslations')) {
      const match = hContent.match(/const \w+ = useTranslations\(['"][^'"]+['"]\)/);
      if (match) {
        hContent = hContent.replace(
          match[0],
          `${match[0]}\n  const tData = useTranslations('ProductData')\n  const products = getLocalizedProducts(tData)`
        );
      }
    }
    fs.writeFileSync(homePath, hContent);
    console.log('✅ Updated homepage');
  }
}

console.log('\n🎉 All pages updated to use localized product data!');
