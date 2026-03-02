const fs = require('fs');
const path = require('path');

// ═══ 1. Fix page.tsx — all stored-data labels ═══
const pgPath = path.join(__dirname, '..', 'src', 'app', '[locale]', 'portal', 'dashboard', 'estimates', 'page.tsx');
let pg = fs.readFileSync(pgPath, 'utf8');

// A) Sold To label input — wrap with tl()
pg = pg.replace(
  '<input value={est.soldToLabel} onChange={e => set("soldToLabel", e.target.value)} className="text-[10px]',
  '<input value={tl(est.soldToLabel, locale)} onChange={e => set("soldToLabel", e.target.value)} className="text-[10px]'
);

// B) Ship To label input — wrap with tl()
pg = pg.replace(
  '<input value={est.shipToLabel} onChange={e => set("shipToLabel", e.target.value)} className="text-[10px]',
  '<input value={tl(est.shipToLabel, locale)} onChange={e => set("shipToLabel", e.target.value)} className="text-[10px]'
);

// C) Client field placeholders — replace raw f.replace("client","") with translated map
pg = pg.replace(
  `placeholder={f.replace("client", "")} value={est[f]}`,
  `placeholder={({clientName:T.est.name_,clientAddress:T.est.address_,clientCity:T.est.city_,clientPhone:T.est.phone_,clientEmail:T.est.email_} as Record<string,string>)[f]||f} value={est[f]}`
);

// D) Summary title — translate "Items" and "Units"
pg = pg.replace(
  `{estCfg.summaryTitle} — {t.items} Items ({t.totalUnits} Units)`,
  `{estCfg.summaryTitle} — {t.items} {T.est.items} ({t.totalUnits} {T.est.units})`
);

// E) Terms title — translate fallback
pg = pg.replace(
  `{estCfg.termsTitle ?? "Terms & Conditions"}`,
  `{estCfg.termsTitle ?? T.est.termsTitle}`
);

// F) Payment stage labels — wrap with tl()
pg = pg.replace(
  `{s.label}{isDeposit`,
  `{tl(s.label, locale)}{isDeposit`
);

// G) Signature labels — translate
pg = pg.replace(
  `{who === "client" ? "Client" : "Representative"} Signature & Date`,
  `{who === "client" ? T.est.clientSig : T.est.repSig}`
);

fs.writeFileSync(pgPath, pg);
console.log('✅ page.tsx — stored labels fixed');

// ═══ 2. Add missing translation keys to portal-i18n.ts ═══
const i18nPath = path.join(__dirname, '..', 'src', 'lib', 'portal-i18n.ts');
let i18n = fs.readFileSync(i18nPath, 'utf8');

// Check if we need to add the field placeholder keys
if (!i18n.includes('name_:')) {
  // Add to English est section
  i18n = i18n.replace(
    /termsTitle:\s*"Terms & Conditions"/,
    `termsTitle: "Terms & Conditions",
    name_: "Name", address_: "Address", city_: "City", phone_: "Phone", email_: "Email",
    items: "Items", units: "Units",
    clientSig: "Client Signature & Date", repSig: "Representative Signature & Date"`
  );
  // Add to French est section
  i18n = i18n.replace(
    /termsTitle:\s*"Termes et conditions"/,
    `termsTitle: "Termes et conditions",
    name_: "Nom", address_: "Adresse", city_: "Ville", phone_: "Téléphone", email_: "Courriel",
    items: "Articles", units: "Unités",
    clientSig: "Signature du client et date", repSig: "Signature du représentant et date"`
  );
}

fs.writeFileSync(i18nPath, i18n);
console.log('✅ portal-i18n.ts — missing keys added');
