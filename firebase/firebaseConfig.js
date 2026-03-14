/**
 * Firebase Configuration - DISABLED
 * 
 * The active app uses MongoDB backend API for authentication.
 * Firebase SDK is not loaded to avoid initialization errors in Expo.
 * 
 * These exports are provided for backward compatibility only.
 */

// Null values - Firebase is not initialized
const app = null;
const auth = null;

// Firebase credentials stored for reference/future use
const firebaseConfig = {
    apiKey: "AIzaSyA0Xm7TZPtARRY4C0DspVbrbVsNG-LwxjI",
    authDomain: "healthpass-eb8ad.firebaseapp.com",
    projectId: "healthpass-eb8ad",
    storageBucket: "healthpass-eb8ad.firebasestorage.app",
    messagingSenderId: "591399391486",
    appId: "1:591399391486:web:5d762c8869cf73ca9255af",
    measurementId: "G-Q4W462SPL7"
};

export { app, auth, firebaseConfig };