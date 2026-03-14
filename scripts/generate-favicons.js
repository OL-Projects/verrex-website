const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const LOGO = path.join(__dirname, '..', 'public', 'images', 'vx-logo.svg');
const PUBLIC = path.join(__dirname, '..', 'public');
const APP = path.join(__dirname, '..', 'src', 'app');

async function main() {
  console.log('🎨 Generating VEREX favicons from logo...\n');

  // Read the SVG and render at high res first
  const svgBuf = fs.readFileSync(LOGO);

  // Generate a high-res PNG from the SVG (512x512 base)
  const base512 = await sharp(svgBuf, { density: 300 })
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  console.log('✅ Base 512x512 PNG generated');

  // 1. icon-512.png (PWA)
  fs.writeFileSync(path.join(PUBLIC, 'icon-512.png'), base512);
  console.log('✅ icon-512.png');

  // 2. icon-192.png (PWA)
  const icon192 = await sharp(base512).resize(192, 192).png().toBuffer();
  fs.writeFileSync(path.join(PUBLIC, 'icon-192.png'), icon192);
  console.log('✅ icon-192.png');

  // 3. apple-touch-icon.png (180x180)
  const apple180 = await sharp(base512).resize(180, 180).png().toBuffer();
  fs.writeFileSync(path.join(PUBLIC, 'apple-touch-icon.png'), apple180);
  console.log('✅ apple-touch-icon.png');

  // 4. favicon-32x32.png
  const fav32 = await sharp(base512).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(PUBLIC, 'favicon-32x32.png'), fav32);
  console.log('✅ favicon-32x32.png');

  // 5. favicon-16x16.png
  const fav16 = await sharp(base512).resize(16, 16).png().toBuffer();
  fs.writeFileSync(path.join(PUBLIC, 'favicon-16x16.png'), fav16);
  console.log('✅ favicon-16x16.png');

  // 6. favicon.ico (32x32 PNG renamed — modern browsers accept PNG as ICO)
  // Also copy to src/app/favicon.ico for Next.js App Router convention
  fs.writeFileSync(path.join(PUBLIC, 'favicon.ico'), fav32);
  fs.writeFileSync(path.join(APP, 'favicon.ico'), fav32);
  console.log('✅ favicon.ico (public + src/app)');

  // 7. icon.svg — copy the original SVG as scalable favicon
  fs.copyFileSync(LOGO, path.join(PUBLIC, 'icon.svg'));
  console.log('✅ icon.svg (scalable)');

  // 8. Also generate icon.png at src/app level (Next.js metadata convention)
  const icon48 = await sharp(base512).resize(48, 48).png().toBuffer();
  fs.writeFileSync(path.join(APP, 'icon.png'), icon48);
  console.log('✅ src/app/icon.png (48x48)');

  // 9. apple-icon.png at src/app level (Next.js metadata convention)
  fs.writeFileSync(path.join(APP, 'apple-icon.png'), apple180);
  console.log('✅ src/app/apple-icon.png (180x180)');

  console.log('\n🎉 All favicons generated! VEREX branding applied everywhere.');
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
