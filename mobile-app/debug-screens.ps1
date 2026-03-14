#!/usr/bin/env powershell
# HealthPass App - Screen Import Debugging Script
# This script helps identify broken screen imports quickly

function Write-ColorOutput($message, $color = 'White') {
    # Map color names to valid PowerShell colors
    $colorMap = @{
        'Success' = 'Green'
        'Error'   = 'Red'
        'Info'    = 'Cyan'
        'Warning' = 'Yellow'
        'White'   = 'White'
    }
    
    $actualColor = if ($colorMap.ContainsKey($color)) { $colorMap[$color] } else { 'White' }
    Write-Host $message -ForegroundColor $actualColor
}

Write-ColorOutput @"

====================================================================
  HealthPass App - Screen Import Debugging
  React Native + Expo SDK 54 + React Navigation v5+
====================================================================
"@ -Color 'Cyan'

Write-ColorOutput "[*] Prerequisites Check:" -Color 'Info'
Write-ColorOutput "================================" -Color 'Info'

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-ColorOutput "[OK] node_modules found" -Color 'Success'
} else {
    Write-ColorOutput "[ERROR] node_modules not found - Installing dependencies..." -Color 'Error'
    npm install
}

# Check if .expo folder exists
if (Test-Path ".expo") {
    Write-ColorOutput "[OK] .expo cache found" -Color 'Success'
} else {
    Write-ColorOutput "[WARN] .expo cache not found (this is normal)" -Color 'Warning'
}

Write-ColorOutput "`n[*] Ready to Start Debugging" -Color 'Success'
Write-ColorOutput "================================" -Color 'Info'

Write-ColorOutput @"

Choose an option:

1. Start Expo with fresh cache (RECOMMENDED FOR DEBUGGING)
2. Start Expo normally
3. Install dependencies only
4. Clear all cache and reinstall
5. Check screen validity
6. Exit

Note: Option 1 is best for debugging 'Cannot read property of undefined' errors.
"@ -Color 'White'

$choice = Read-Host "Enter choice (1-6)"

switch ($choice) {
    "1" {
        Write-ColorOutput "`n[*] Starting Expo with fresh cache (-c flag)..." -Color 'Info'
        Write-ColorOutput "[!] Watch console output for SCREEN IMPORTS DEBUG section" -Color 'Warning'
        Write-ColorOutput "[!] Any screen showing 'undefined' is the broken one!" -Color 'Warning'
        Write-ColorOutput "================================`n" -Color 'Info'
        
        npx expo start -c
    }
    
    "2" {
        Write-ColorOutput "`n[*] Starting Expo normally..." -Color 'Info'
        npx expo start
    }
    
    "3" {
        Write-ColorOutput "`n[*] Installing dependencies..." -Color 'Info'
        npm install
        
        Write-ColorOutput "`n[*] Installing Expo-specific packages..." -Color 'Info'
        npx expo install react-native-screens react-native-safe-area-context
        
        Write-ColorOutput "`n[OK] Dependencies installed successfully" -Color 'Success'
    }
    
    "4" {
        Write-ColorOutput "`n[!] WARNING: This will delete all node_modules and cache!" -Color 'Warning'
        $confirm = Read-Host "Continue? (yes/no)"
        
        if ($confirm -eq "yes") {
            Write-ColorOutput "`n[*] Removing node_modules..." -Color 'Info'
            Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
            
            Write-ColorOutput "[*] Removing .expo cache..." -Color 'Info'
            Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
            
            Write-ColorOutput "[*] Removing package-lock.json..." -Color 'Info'
            Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
            
            Write-ColorOutput "`n[*] Reinstalling dependencies..." -Color 'Info'
            npm install
            
            Write-ColorOutput "`n[OK] Cache cleared and dependencies reinstalled" -Color 'Success'
        } else {
            Write-ColorOutput "`n[->] Cancelled" -Color 'Info'
        }
    }
    
    "5" {
        Write-ColorOutput "`n[*] Screen Validity Check:" -Color 'Info'
        Write-ColorOutput "================================" -Color 'Info'
        Write-ColorOutput @"

This feature requires Node.js compatibility mode.
For now, use console logs in AppNavigator.js to check:

Screens to verify:
  * WelcomeScreen
  * LoginScreen
  * SignupScreen
  * OtpScreen
  * AccountSetupScreen
  * ReferralLocationScreen
  * FamilySetupScreen
  * InsuranceLinkingScreen
  * PlansScreen
  * PlanComparisonScreen
  * PlanSelectionScreen
  * BillingCycleScreen
  * CheckoutScreen
  * PaymentSuccessScreen
  * DashboardScreen
  * ProfileScreen

Run: npx expo start -c
Then check console for 'SCREEN IMPORTS DEBUG' output.
"@ -Color 'White'
    }
    
    "6" {
        Write-ColorOutput "`n[*] Goodbye!" -Color 'Cyan'
        exit
    }
    
    default {
        Write-ColorOutput "`n[ERROR] Invalid choice" -Color 'Error'
    }
}

Write-ColorOutput @"

===================================================================

[ERROR SOLUTIONS]:

If you see console errors:

[ERROR] 'Cannot read property of undefined':
  -> One screen import is failing
  -> Check AppNavigator.js console logs
  -> Look for 'undefined' in SCREEN IMPORTS DEBUG

[ERROR] 'No default export':
  -> Screen file exists but doesn't export correctly
  -> Every screen needs: export default ScreenName;

[ERROR] 'Module not found':
  -> Screen file doesn't exist or path is wrong
  -> Check file names match imports exactly (case-sensitive!)

[ERROR] Blank screen / no error:
  -> Navigation working but showing empty screen
  -> Check SafeAreaView wraps entire screen content
  -> Verify component returns JSX

===================================================================
"@ -Color 'Cyan'

