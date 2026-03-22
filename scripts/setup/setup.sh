#!/bin/bash

echo "🎬 Caught in 4K - Installation Script"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install express cors dotenv

echo ""
echo "✅ Setup Complete!"
echo ""
echo "🚀 To start:"
echo ""
echo "Terminal 1 (Backend Proxy):"
echo "  node api-proxy.js"
echo ""
echo "Terminal 2 (React App):"
echo "  npm start"
echo ""
echo "Then open: http://localhost:3000"
echo ""
