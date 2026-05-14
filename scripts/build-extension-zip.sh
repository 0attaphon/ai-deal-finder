#!/usr/bin/env bash
# Build and zip the Chrome extension for Web Store submission
set -e

echo "Building extension..."
cd "$(dirname "$0")/../extension"

# Require VITE_SITE_URL to be set
if [ -z "$VITE_SITE_URL" ] && [ ! -f .env.local ]; then
  echo "Error: VITE_SITE_URL not set. Create extension/.env.local with VITE_SITE_URL=https://your-domain.vercel.app"
  exit 1
fi

npm run build

echo "Creating zip..."
cd dist
ZIP_NAME="ai-deal-finder-$(date +%Y%m%d).zip"
zip -r "../../store-assets/$ZIP_NAME" . -x "*.map"

echo "Done! Upload store-assets/$ZIP_NAME to Chrome Web Store."
echo "https://chrome.google.com/webstore/devconsole"
