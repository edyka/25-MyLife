# Open Graph Image Guide for Viventiva

## What is an OG Image?

An Open Graph (OG) image is the preview image that appears when your website is shared on social media platforms like Facebook, Twitter, LinkedIn, and messaging apps like WhatsApp, Slack, etc.

## Required Specifications

- **Dimensions**: 1200px × 630px (required by index.html)
- **Format**: PNG or JPG (PNG recommended for better quality)
- **File Size**: Under 1MB (ideally under 500KB)
- **Aspect Ratio**: 1.91:1

## Design Recommendations for Viventiva

Your OG image should:

1. **Feature the life weeks grid**: Show a compelling visualization of the life grid
2. **Include branding**: Add "Viventiva" text/logo
3. **Show value prop**: Include a tagline like "Visualize Your Life in Weeks"
4. **Use app colors**: Maintain brand consistency with the app's color scheme
5. **Be readable**: Text should be large and clear (min 60px font size)
6. **Safe zones**: Keep important content 40px away from edges

## Creating Your OG Image

### Option 1: Use Figma/Canva (Recommended)

1. **Figma**:
   - Create a 1200×630px frame
   - Design your image with the life grid visualization
   - Export as PNG at 2x resolution
   - Optimize with TinyPNG or similar tool

2. **Canva**:
   - Use "Facebook Post" template (1200×630px)
   - Upload your brand colors and assets
   - Design and export as PNG

### Option 2: Take a Screenshot

1. Open Viventiva in a browser
2. Use browser DevTools to set viewport to 1200×630px
3. Take a high-quality screenshot of the life grid
4. Add text overlay in an image editor:
   - "Viventiva"
   - "Visualize Your Life in Weeks"

### Option 3: Generate Programmatically

Use tools like:
- Puppeteer (screenshot automation)
- Canvas API (Node.js image generation)
- Cloudinary or similar services

## Example Design Layout

```
┌─────────────────────────────────────────┐
│                                         │ 40px padding
│   VIVENTIVA                            │ Large logo/text
│                                         │
│   [Life Weeks Grid Visualization]     │ Main visual
│   [Colorful 52×90 grid]               │
│                                         │
│   Visualize Your Life in Weeks        │ Tagline
│   Track moments • Set intentions      │ Sub-text
│                                         │
└─────────────────────────────────────────┘
     1200px × 630px
```

## File Placement

Once created, save your OG image as:
```
public/og-image.png
```

This path is already referenced in `index.html`:
```html
<meta property="og:image" content="https://viventiva.com/og-image.png" />
```

## Testing Your OG Image

1. **Facebook Sharing Debugger**:
   https://developers.facebook.com/tools/debug/

2. **Twitter Card Validator**:
   https://cards-dev.twitter.com/validator

3. **LinkedIn Post Inspector**:
   https://www.linkedin.com/post-inspector/

4. **Generic OG Checker**:
   https://www.opengraph.xyz/

## Tips for Best Results

- **High Contrast**: Ensure text is readable against the background
- **Mobile Preview**: Test how it looks on mobile share screens
- **Emoji/Icons**: Consider adding relevant icons (📅, ⏰, 🎯)
- **Brand Colors**: Use your app's color palette consistently
- **Consistency**: Match the visual style of your app
- **Text Hierarchy**: Make the most important text largest
- **Avoid Clutter**: Keep it simple and focused

## Current Status

⏳ **OG image needs to be created**

The `index.html` file references:
- `https://viventiva.com/og-image.png`

**Action Required**: Create and add `og-image.png` to the `public/` folder.

## Alternative: Dynamic OG Images

For more advanced setups, consider generating OG images dynamically:

- **Vercel OG**: https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation
- **Cloudinary**: Dynamic image transformations
- **Custom API**: Generate images on-the-fly based on user data

This would allow personalized OG images for different pages or user profiles.
