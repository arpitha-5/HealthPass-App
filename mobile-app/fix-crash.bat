@echo off
REM Comprehensive Expo Go Crash Fix Script for Windows
REM This script performs all necessary cleanup and fixes

echo.
echo =========================================
echo EXPO GO CRASH TROUBLESHOOTING & FIX
echo =========================================
echo.

REM Step 1: Clear npm cache
echo 📦 Step 1: Clearing npm cache...
call npm cache clean --force
echo ✅ npm cache cleared
echo.

REM Step 2: Remove node_modules
echo 🗑️  Step 2: Removing node_modules...
if exist "node_modules" (
    rmdir /s /q "node_modules"
    echo ✅ node_modules removed
) else (
    echo ⏭️  node_modules not found
)
echo.

REM Step 3: Remove package-lock.json
echo 🔗 Step 3: Removing package-lock.json...
if exist "package-lock.json" (
    del "package-lock.json"
    echo ✅ package-lock.json removed
) else (
    echo ⏭️  package-lock.json not found
)
echo.

REM Step 4: Clear temp folders
echo 🧹 Step 4: Clearing temporary cache folders...
if exist ".expo" (
    rmdir /s /q ".expo"
    echo ✅ .expo folder cleared
)
echo.

REM Step 5: Reinstall dependencies
echo 📥 Step 5: Reinstalling dependencies...
call npm install
echo ✅ Dependencies installed
echo.

REM Step 6: Show next steps
echo =========================================
echo ✨ Fix Complete!
echo =========================================
echo.
echo To test the app:
echo 1. Run: npx expo start -c
echo 2. Scan the QR code with Expo Go app
echo 3. Check the terminal for error messages
echo 4. Look for ❌ or "ERROR" in the logs
echo.
echo Troubleshooting Tips:
echo - If still crashing, check terminal for specific error messages
echo - Make sure Android device has 100+ MB free space
echo - Restart your Android device
echo - Update Expo Go from Google Play Store
echo.
pause
