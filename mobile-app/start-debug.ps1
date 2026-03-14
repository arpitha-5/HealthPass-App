#!/usr/bin/env powershell
# HealthPass App - Quick Debug Script
# Simple version to avoid PowerShell color issues

Write-Host ""
Write-Host "===================================================="
Write-Host "  HealthPass App - Screen Import Debugging"
Write-Host "  React Native + Expo SDK 54"
Write-Host "===================================================="
Write-Host ""

Write-Host "[*] Checking prerequisites..." -ForegroundColor Cyan

if (Test-Path "node_modules") {
    Write-Host "[OK] node_modules found" -ForegroundColor Green
} else {
    Write-Host "[!] node_modules not found - installing..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "[*] Choose an option:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Start Expo with fresh cache (RECOMMENDED)"
Write-Host "  2. Start Expo normally"
Write-Host "  3. Install dependencies only"
Write-Host "  4. Clear cache and reinstall"
Write-Host "  5. Exit"
Write-Host ""

$choice = Read-Host "Enter choice (1-5)"

Write-Host ""

switch ($choice) {
    "1" {
        Write-Host "[*] Starting Expo with fresh cache..." -ForegroundColor Cyan
        Write-Host "[!] Watch console for: SCREEN IMPORTS DEBUG" -ForegroundColor Yellow
        Write-Host "[!] Any undefined screen is the problem" -ForegroundColor Yellow
        Write-Host ""
        npx expo start -c
    }
    
    "2" {
        Write-Host "[*] Starting Expo normally..." -ForegroundColor Cyan
        Write-Host ""
        npx expo start
    }
    
    "3" {
        Write-Host "[*] Installing dependencies..." -ForegroundColor Cyan
        npm install
        Write-Host ""
        Write-Host "[*] Installing Expo packages..." -ForegroundColor Cyan
        npx expo install react-native-screens react-native-safe-area-context
        Write-Host ""
        Write-Host "[OK] Dependencies installed" -ForegroundColor Green
    }
    
    "4" {
        Write-Host "[!] WARNING: This will delete node_modules, .expo, and package-lock.json" -ForegroundColor Yellow
        $confirm = Read-Host "Continue? (yes/no)"
        
        if ($confirm -eq "yes") {
            Write-Host "[*] Removing node_modules..." -ForegroundColor Cyan
            Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
            
            Write-Host "[*] Removing .expo cache..." -ForegroundColor Cyan
            Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
            
            Write-Host "[*] Removing package-lock.json..." -ForegroundColor Cyan
            Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
            
            Write-Host "[*] Reinstalling everything..." -ForegroundColor Cyan
            npm install
            
            Write-Host ""
            Write-Host "[OK] Cache cleared and reinstalled" -ForegroundColor Green
        } else {
            Write-Host "[*] Cancelled" -ForegroundColor Cyan
        }
    }
    
    "5" {
        Write-Host "[*] Goodbye!" -ForegroundColor Cyan
        exit
    }
    
    default {
        Write-Host "[ERROR] Invalid choice" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "===================================================="
Write-Host "[*] IF YOU SEE ERRORS:" -ForegroundColor Cyan
Write-Host "===================================================="
Write-Host ""
Write-Host "  ERROR: Cannot read property of undefined"
Write-Host "    -> Check console for SCREEN IMPORTS DEBUG"
Write-Host "    -> Look for undefined screen"
Write-Host ""
Write-Host "  ERROR: No default export"
Write-Host "    -> Screen file needs: export default ScreenName;"
Write-Host ""
Write-Host "  ERROR: Module not found"
Write-Host "    -> Check file name is correct (case-sensitive!)"
Write-Host ""
Write-Host "  Blank screen with no error"
Write-Host "    -> Check SafeAreaView wraps content"
Write-Host "    -> Verify component returns JSX"
Write-Host ""
Write-Host "===================================================="
