/**
 * Favicon Generator Script for Viventiva
 *
 * This script converts the SVG favicon to PNG formats using sharp.
 *
 * Usage:
 *   npm install --save-dev sharp
 *   node scripts/generate-favicons.js
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');
const svgPath = path.join(publicDir, 'favicon.svg');

const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
];

async function generateFavicons() {
  try {
    console.log('🎨 Starting favicon generation...\n');

    // Check if SVG exists
    if (!fs.existsSync(svgPath)) {
      console.error('❌ favicon.svg not found at:', svgPath);
      process.exit(1);
    }

    // Read SVG file
    const svgBuffer = fs.readFileSync(svgPath);

    // Generate each size
    for (const { size, name } of sizes) {
      const outputPath = path.join(publicDir, name);

      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({
          quality: 100,
          compressionLevel: 9,
        })
        .toFile(outputPath);

      console.log(`✅ Generated ${name} (${size}x${size})`);
    }

    console.log('\n🎉 All favicons generated successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Generate favicon.ico from favicon-32x32.png:');
    console.log('   Visit: https://www.favicon-generator.org/');
    console.log('   Upload: public/favicon-32x32.png');
    console.log('   Download and save to: public/favicon.ico');
    console.log('\n2. Test the favicons:');
    console.log('   npm run dev');
    console.log('   Open browser and check the tab icon');

  } catch (error) {
    console.error('❌ Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();
