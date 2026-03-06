const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'src', 'app', '[locale]', 'page.tsx');
let c = fs.readFileSync(filePath, 'utf8');

// 1. Quantity / Units label
c = c.replace(
  `<label className="text-xs font-medium text-white/70 mb-1 block">Quantity / Units</label>`,
  `<label className="text-xs font-medium text-white/70 mb-1 block">{t('quantityLabel')}</label>`
);

// 2. Quantity placeholder
c = c.replace(
  `placeholder="e.g. 10"`,
  `placeholder={t('quantityPlaceholder')}`
);

// 3. Sending...
c = c.replace(
  `{qqSending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>`,
  `{qqSending ? <><Loader2 className="h-4 w-4 animate-spin" /> {t('sending')}</>`
);

// 4. Why Choose heading
c = c.replace(
  `Why Choose <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent">VEREX</span>?`,
  `{t('whyChooseTitle')} <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent">{t('whyChooseBrand')}</span>?`
);

// 5. Why Choose description paragraph
c = c.replace(
  `We are your strategic partner for fenestration projects of any scale — combining manufacturer-direct pricing, certified installation, and comprehensive project management to deliver results.`,
  `{t('whyChooseDesc')}`
);

// 6. Why Choose cards — replace hardcoded titles/descs with t() calls
c = c.replace(
  `{ icon: Shield, title: "Fully Licensed & Bonded", desc: "Complete liability coverage, WSIB compliant, and licensed professionals on every project." },`,
  `{ icon: Shield, title: t('whyLicensed'), desc: t('whyLicensedDesc') },`
);
c = c.replace(
  `{ icon: BadgeCheck, title: "Code Compliant", desc: "All products meet or exceed the National Building Code of Canada, CSA A440, and NAFS standards." },`,
  `{ icon: BadgeCheck, title: t('whyCode'), desc: t('whyCodeDesc') },`
);
c = c.replace(
  `{ icon: Truck, title: "On-Time, On-Budget", desc: "98% on-time completion rate with transparent project management and milestone tracking." },`,
  `{ icon: Truck, title: t('whyOnTime'), desc: t('whyOnTimeDesc') },`
);
c = c.replace(
  `{ icon: FileText, title: "Premium Quality, Price-Match Guarantee", desc: "Uncompromising quality backed by our price-match guarantee. Get the best products at the most competitive prices — guaranteed." },`,
  `{ icon: FileText, title: t('whyPriceMatch'), desc: t('whyPriceMatchDesc') },`
);

// 7. Industry Certified badge
c = c.replace(
  `<span className="text-sm font-semibold text-blue-700 dark:text-blue-300 tracking-wide uppercase">Industry Certified</span>`,
  `<span className="text-sm font-semibold text-blue-700 dark:text-blue-300 tracking-wide uppercase">{t('industryCertified')}</span>`
);

// 8. Verified badge
c = c.replace(
  `<span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Verified</span>`,
  `<span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{t('verified')}</span>`
);

// 9. "View Details" text in product cards
c = c.replace(
  `View Details <ArrowRight className="h-3 w-3" />`,
  `{t('viewDetails')} <ArrowRight className="h-3 w-3" />`
);

fs.writeFileSync(filePath, c);
console.log('✅ Homepage i18n hardcoded strings replaced');
