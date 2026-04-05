#!/bin/bash

echo "🎬 Caught in 4K - Installation Script"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

node -e "const [major] = process.versions.node.split('.').map(Number); process.exit(major >= 20 ? 0 : 1)"
if [ $? -ne 0 ]; then
    echo "❌ Node.js 20 is required for this repo."
    exit 1
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ npm install failed. Fix the error above and run this script again."
    exit 1
fi

echo ""
echo "✅ Setup Complete!"
echo ""
echo "🚀 To start:"
echo ""
echo "Terminal 1 (React App):"
echo "  npm start"
echo ""
echo "Optional Gemini fallback:"
echo "  1. Add GEMINI_API_KEY to .env"
echo "  2. Run node api-proxy.js in a second terminal"
echo "  3. Set REACT_APP_CANON_PROXY_URL before restarting npm start"
echo ""
echo "Then open: https://localhost:8080/"
echo ""
