const fs = require('fs');
const files = ['estimate-customize-panel.tsx','estimate-left-sidebar.tsx','estimate-preview-panel.tsx','estimate-pdf-doc.tsx'];
files.forEach(f => {
  const content = fs.readFileSync('src/components/portal/' + f, 'utf8');
  const hasT = content.includes('usePortalT') || content.includes('getPortalT');
  console.log(`\n=== ${f} (${content.split('\n').length} lines) hasPortalT: ${hasT} ===`);
  // Find quoted strings that look like visible UI labels
  const re = /["']([A-Z][a-zA-Z\s&/()#:+\-]{3,50})["']/g;
  const found = new Set();
  let m;
  while ((m = re.exec(content)) !== null) {
    const s = m[1].trim();
    if (!s.match(/^[A-Z_]+$/) && !s.includes('className') && s.length > 3) found.add(s);
  }
  [...found].sort().forEach(s => console.log('  ' + s));
});
