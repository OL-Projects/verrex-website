const fs = require('fs');
const path = require('path');

const pgPath = path.join(__dirname, '..', 'src', 'app', '[locale]', 'portal', 'dashboard', 'estimates', 'page.tsx');
let pg = fs.readFileSync(pgPath, 'utf8');

// Strategy: find every <input type="number" ...> that does NOT have onFocus
// and add onFocus={e => { if (+e.target.value === 0) e.target.select() }} right after type="number"
const handler = ' onFocus={e => { if (+e.target.value === 0) e.target.select() }}';
let count = 0;

// Match <input type="number" and if the tag doesn't already have onFocus, insert it
pg = pg.replace(/<input type="number"([\s\S]*?)\/>/g, (match, rest) => {
  if (rest.includes('onFocus')) return match; // already has it
  count++;
  return `<input type="number"${handler}${rest}/>`;
});

console.log(`✅ Added onFocus to ${count} number inputs (total now: ${(pg.match(/onFocus/g) || []).length})`);
fs.writeFileSync(pgPath, pg);
