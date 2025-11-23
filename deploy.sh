#!/bin/bash

# Netlify Deployment Script
# Run this script to deploy Viventiva to Netlify

echo "🚀 Starting Netlify deployment..."

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
netlify deploy --prod --dir=dist

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set environment variables in Netlify Dashboard:"
echo "   - VITE_SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY"
echo "2. Update OAuth redirect URIs in Supabase"
echo "3. Trigger a new deploy after setting env variables"

