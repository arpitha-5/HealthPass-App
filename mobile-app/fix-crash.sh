#!/bin/bash
# Comprehensive Expo Go Crash Fix Script
# This script performs all necessary cleanup and fixes

echo "========================================="
echo "EXPO GO CRASH TROUBLESHOOTING & FIX"
echo "========================================="
echo ""

# Step 1: Clear npm cache
echo "📦 Step 1: Clearing npm cache..."
npm cache clean --force
echo "✅ npm cache cleared"
echo ""

# Step 2: Remove node_modules
echo "🗑️  Step 2: Removing node_modules..."
if [ -d "node_modules" ]; then
    rm -rf node_modules
    echo "✅ node_modules removed"
else
    echo "⏭️  node_modules not found"
fi
echo ""

# Step 3: Clear Expo cache
echo "🧹 Step 3: Clearing Expo cache..."
npx expo start --clear
echo "✅ Expo cache cleared"
echo ""

# Step 4: Remove watchman cache (if available)
echo "🔍 Step 4: Checking for watchman..."
if command -v watchman &> /dev/null; then
    echo "Found watchman, clearing watch..."
    watchman watch-del-all
    echo "✅ Watchman cache cleared"
else
    echo "⏭️  Watchman not installed (optional)"
fi
echo ""

# Step 5: Reinstall dependencies
echo "📥 Step 5: Reinstalling dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

echo "========================================="
echo "✨ Fix Complete!"
echo "========================================="
echo ""
echo "To test the app:"
echo "1. npx expo start --clear"
echo "2. Scan QR code with Expo Go app"
echo "3. Check terminal for error messages"
echo ""
