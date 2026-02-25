const fs = require('fs');
['src/app/[locale]/products/windows/page.tsx', 'src/app/[locale]/products/doors/page.tsx'].forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  // Add import
  c = c.replace(
    'import { Button } from "@/components/ui/button"',
    'import { Button } from "@/components/ui/button"\nimport { CertificationsBar } from "@/components/ui/CertificationsBar"'
  );
  // Add cert strip before 3D Configurator CTA
  c = c.replace(
    '      {/* 3D Configurator CTA */}',
    '      {/* Certifications Strip */}\n      <section className="py-6 bg-white dark:bg-[#0a0f1a] border-y border-slate-200 dark:border-slate-800">\n        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">\n          <CertificationsBar variant="compact" />\n        </div>\n      </section>\n\n      {/* 3D Configurator CTA */}'
  );
  fs.writeFileSync(f, c);
  console.log('Updated:', f);
});
