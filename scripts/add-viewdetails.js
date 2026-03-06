const fs = require('fs');
['en','fr'].forEach(l => {
  const p = 'messages/' + l + '.json';
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (!j.HomePage.viewDetails) {
    j.HomePage.viewDetails = l === 'fr' ? 'Voir les détails' : 'View Details';
    fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
  }
});
console.log('✅ viewDetails key added');
