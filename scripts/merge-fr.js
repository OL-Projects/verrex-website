const fs = require('fs');
const path = require('path');

// Run part scripts first
require('./gen-fr-part1.js');
require('./gen-fr-part2.js');
require('./gen-fr-part3.js');

// Load parts
const part1 = JSON.parse(fs.readFileSync(path.join(__dirname, 'fr-part1.json'), 'utf8'));
const part2 = JSON.parse(fs.readFileSync(path.join(__dirname, 'fr-part2.json'), 'utf8'));
const part3 = JSON.parse(fs.readFileSync(path.join(__dirname, 'fr-part3.json'), 'utf8'));

// Merge all parts
const fr = { ...part1, ...part2, ...part3 };

// Write merged fr.json
const outDir = path.join(__dirname, '..', 'messages');
fs.writeFileSync(path.join(outDir, 'fr.json'), JSON.stringify(fr, null, 2));

// Cleanup temp files
fs.unlinkSync(path.join(__dirname, 'fr-part1.json'));
fs.unlinkSync(path.join(__dirname, 'fr-part2.json'));
fs.unlinkSync(path.join(__dirname, 'fr-part3.json'));

console.log('fr.json created and merged successfully!');
