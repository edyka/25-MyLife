# Favicon Generation Guide for Viventiva

This guide explains how to generate all necessary favicon formats for the Viventiva app.

## Quick Start

### Option 1: Use the Browser-Based Generator (Recommended)

1. Open `generate-favicons.html` in your browser:
   ```bash
   open public/generate-favicons.html
   # or navigate to http://localhost:3000/generate-favicons.html when dev server is running
   ```

2. Click "Download All Icons" button to download all favicon sizes

3. The following files will be downloaded:
   - `favicon-16x16.png`
   - `favicon-32x32.png`
   - `icon-192.png`
   - `icon-512.png`

4. Move the downloaded files to the `public/` folder (replace if they exist)

5. Generate `favicon.ico`:
   - Visit https://www.favicon-generator.org/
   - Upload the `favicon-32x32.png` file
   - Download the generated `favicon.ico`
   - Place it in the `public/` folder

### Option 2: Use Online Tools

If you prefer to use online favicon generators:

1. Use the `public/favicon.svg` file as your source
2. Upload it to one of these services:
   - https://realfavicongenerator.net/ (Comprehensive, highly recommended)
   - https://www.favicon-generator.org/ (Simple and fast)
   - https://favicon.io/ (Modern, supports SVG)

3. Download the generated files and place them in the `public/` folder

### Option 3: Use Node.js Tools

If you want to automate the process, you can use `sharp` or similar tools:

```bash
# Install sharp (image processing library)
npm install --save-dev sharp

# Create a script to generate favicons
node scripts/generate-favicons.js
```

## Required Files

Ensure these files exist in the `public/` folder:

- ✅ `favicon.svg` - Modern browsers (scalable, smallest file size)
- ⏳ `favicon-16x16.png` - Small favicon
- ⏳ `favicon-32x32.png` - Standard favicon
- ⏳ `favicon.ico` - Legacy browser support (IE, old browsers)
- ⏳ `icon-192.png` - PWA manifest, Android
- ⏳ `icon-512.png` - PWA manifest, Android, high-res displays

## Already Configured

The following files have been updated with proper favicon references:

- ✅ `index.html` - Contains all favicon link tags
- ✅ `manifest.webmanifest` - PWA configuration with icon references

## Verification

After generating the favicons, verify they work:

1. Start the dev server: `npm run dev`
2. Open the app in a browser
3. Check the browser tab for the favicon
4. Use browser DevTools > Application > Manifest to verify PWA icons
5. Test on mobile devices (iOS Safari, Chrome Android)

## Design Notes

The Viventiva favicon features:
- A 5x5 grid of colored squares representing life weeks
- Gradient background (dark gray to black)
- Colorful squares in green, blue, purple, yellow, and red
- A highlighted square (with white border) representing the current week
- Unfilled squares (gray, low opacity) representing future weeks

This design is:
- Recognizable at small sizes (16x16, 32x32)
- Brand-consistent with the app's life visualization theme
- Visually distinct from other productivity/lifestyle apps
- Scalable as SVG for modern browsers

## Troubleshooting

**Favicon not showing?**
- Clear browser cache (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Check browser DevTools > Network tab for 404 errors
- Verify file paths are correct (no leading `/public/` in HTML)

**PWA icons not working?**
- Verify icon files exist in `public/` folder
- Check `manifest.webmanifest` is properly linked in `index.html`
- Test PWA manifest in DevTools > Application > Manifest

**Icons look blurry?**
- Ensure PNG files are generated at exact sizes (192x192, 512x512)
- Use high-quality SVG-to-PNG conversion
- Avoid scaling images in CSS/HTML
