/**
 * Firebase Connection Test Utility
 * Use this to diagnose Firebase connectivity issues
 * 
 * Log this to console in any screen to test Firebase connection
 */

import { getAuth, signInAnonymously } from 'firebase/auth';
import { auth, firebaseConfig } from '../firebase/firebaseConfig';

export const testFirebaseConnection = async () => {
  console.log('\n🧪 === FIREBASE DIAGNOSTIC TEST === 🧪\n');

  try {
    // Test 1: Check config
    console.log('📋 Firebase Config:');
    console.log('  Project ID:', firebaseConfig.projectId);
    console.log('  API Key:', firebaseConfig.apiKey?.substring(0, 20) + '...');
    console.log('  Auth Domain:', firebaseConfig.authDomain);

    // Test 2: Check auth instance
    console.log('\n🔐 Auth Instance:');
    console.log('  Auth object exists:', !!auth);
    console.log('  Auth app:', auth.app?.name || 'unknown');

    // Test 3: Try anonymous sign-in (tests network connectivity)
    console.log('\n📡 Testing Network Connectivity (Anonymous Login)...');
    try {
      const result = await signInAnonymously(auth);
      console.log('✅ Firebase Network: OK');
      console.log('  User ID:', result.user.uid?.substring(0, 10) + '...');
      return true;
    } catch (networkError) {
      console.error('❌ Firebase Network: FAILED');
      console.error('  Error:', networkError.message);
      console.error('  Code:', networkError.code);
      
      // Detailed error diagnosis
      if (networkError.message?.includes('Network')) {
        console.error('  → Device has no internet OR Firebase servers unreachable');
      } else if (networkError.message?.includes('API')) {
        console.error('  → Invalid API key in firebaseConfig.js');
      } else if (networkError.message?.includes('auth')) {
        console.error('  → Firebase project not properly configured');
      }
      return false;
    }
  } catch (error) {
    console.error('❌ Unexpected error during diagnostic:', error);
    return false;
  }
};

/**
 * Test reCAPTCHA Verifier
 * 
 * Usage:
 * const verifier = useRef(null);
 * <FirebaseRecaptchaVerifierModal ref={verifier} firebaseConfig={firebaseConfig} />
 * 
 * Then call:
 * testRecaptchaVerifier(verifier)
 */
export const testRecaptchaVerifier = (verifierRef) => {
  console.log('\n🤖 === reCAPTCHA VERIFIER TEST === 🤖\n');

  if (!verifierRef?.current) {
    console.error('❌ reCAPTCHA Verifier: NOT INITIALIZED');
    console.error('  → FirebaseRecaptchaVerifierModal might not be rendering');
    console.error('  → Check that it\'s mounted BEFORE calling this test');
    return false;
  }

  console.log('✅ reCAPTCHA Verifier: INITIALIZED');
  console.log('  Type:', typeof verifierRef.current);
  console.log('  Methods available:', Object.keys(verifierRef.current).slice(0, 5));

  return true;
};

/**
 * Full Phone Auth Test
 * 
 * This simulates the phone auth flow without actually sending SMS
 */
export const testPhoneAuthFlow = (phoneNumber) => {
  console.log('\n📱 === PHONE AUTH FLOW TEST === 📱\n');

  // Validate phone format
  const cleanPhone = phoneNumber.replace(/[\D]/g, '');
  if (cleanPhone.length !== 10) {
    console.error('❌ Invalid phone number format');
    console.error('  Expected: 10 digits (e.g., 9705149936)');
    console.error('  Received:', phoneNumber);
    return false;
  }

  const fullPhone = `+91${cleanPhone}`;
  console.log('✅ Phone number format valid:', fullPhone);

  // Check if it's a test number
  if (cleanPhone === '9705149936') {
    console.log('✅ Test phone number detected');
    console.log('  → Should use OTP: 123456');
    console.log('  → Test numbers only work in development');
  }

  return true;
};

// Export a combined test
export const runFullDiagnostics = async (verifierRef, testPhoneNumber) => {
  console.log('\n\n🚀 === FULL FIREBASE DIAGNOSTICS === 🚀\n');
  console.log('Running all tests...\n');

  let allPassed = true;

  // Test 1: Firebase Connection
  const connectionOk = await testFirebaseConnection();
  allPassed = allPassed && connectionOk;

  // Test 2: reCAPTCHA
  const recaptchaOk = testRecaptchaVerifier(verifierRef);
  allPassed = allPassed && recaptchaOk;

  // Test 3: Phone Format
  if (testPhoneNumber) {
    const phoneOk = testPhoneAuthFlow(testPhoneNumber);
    allPassed = allPassed && phoneOk;
  }

  // Summary
  console.log('\n\n📊 === DIAGNOSTIC SUMMARY === 📊\n');
  if (allPassed) {
    console.log('✅ All checks passed! You should be able to send OTP.');
  } else {
    console.log('❌ Some checks failed. See errors above for details.');
  }

  return allPassed;
};

/**
 * How to use:
 * 
 * In any screen, add this to a useEffect or button handler:
 * 
 * import { testFirebaseConnection, runFullDiagnostics } from '../utils/firebaseTest';
 * 
 * // Test connection
 * useEffect(() => {
 *   testFirebaseConnection();
 * }, []);
 * 
 * // Test everything (add a Debug button)
 * const handleDebug = () => {
 *   runFullDiagnostics(recaptchaVerifier, mobileNumber);
 * };
 */
