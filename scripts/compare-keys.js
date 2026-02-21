const en = require('../messages/en.json');
const fr = require('../messages/fr.json');

const allSections = new Set([...Object.keys(en), ...Object.keys(fr)]);

console.log('=== EN sections:', Object.keys(en).join(', '));
console.log('=== FR sections:', Object.keys(fr).join(', '));
console.log('');

for (const s of allSections) {
  const ek = en[s] ? Object.keys(en[s]) : [];
  const fk = fr[s] ? Object.keys(fr[s]) : [];
  const missingInFr = ek.filter(k => !fk.includes(k));
  const missingInEn = fk.filter(k => !ek.includes(k));
  
  console.log(`--- ${s}: EN has ${ek.length} keys, FR has ${fk.length} keys`);
  if (!en[s]) console.log('  *** MISSING ENTIRE SECTION in en.json');
  if (!fr[s]) console.log('  *** MISSING ENTIRE SECTION in fr.json');
  if (missingInFr.length) console.log('  Missing in FR:', missingInFr.join(', '));
  if (missingInEn.length) console.log('  Extra in FR:', missingInEn.join(', '));
}
