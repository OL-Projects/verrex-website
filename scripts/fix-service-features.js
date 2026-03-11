const fs = require('fs');
const path = require('path');

['en', 'fr'].forEach(lang => {
  const fp = path.join(__dirname, '..', 'messages', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
  
  if (data.ServiceData) {
    // Convert features arrays to indexed objects for next-intl
    for (const id of ['1','2','3','4','5','6']) {
      if (data.ServiceData[id] && Array.isArray(data.ServiceData[id].features)) {
        const arr = data.ServiceData[id].features;
        const obj = {};
        arr.forEach((v, i) => { obj[String(i)] = v; });
        data.ServiceData[id].features = obj;
      }
    }
  }
  
  fs.writeFileSync(fp, JSON.stringify(data, null, 2) + '\n', 'utf8');
});

console.log('✅ ServiceData features converted from arrays to indexed objects');
