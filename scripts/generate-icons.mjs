/**
 * Run once after installing deps to generate PNG icons for PWA:
 *   node scripts/generate-icons.mjs
 *
 * Requires: npm install --save-dev sharp
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = join(__dirname, '../public/icons/icon.svg');
const svgBuffer = readFileSync(svgPath);

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('Run: npm install --save-dev sharp');
  process.exit(1);
}

const sizes = [192, 512];
for (const size of sizes) {
  const outPath = join(__dirname, `../public/icons/icon-${size}.png`);
  await sharp(svgBuffer).resize(size, size).png().toFile(outPath);
  console.log(`✓ Generated icon-${size}.png`);
}

console.log('\nDone! PWA icons ready.');
