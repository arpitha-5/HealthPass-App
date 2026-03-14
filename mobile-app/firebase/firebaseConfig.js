import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey:            'AIzaSyA0Xm7TZPtARRY4C0DspVbrbVsNG-LwxjI',
  authDomain:        'healthpass-eb8ad.firebaseapp.com',
  projectId:         'healthpass-eb8ad',
  storageBucket:     'healthpass-eb8ad.firebasestorage.app',
  messagingSenderId: '591399391486',
  appId:             '1:591399391486:web:5d762c8869cf73ca9255af',
  measurementId:     'G-Q4W462SPL7',
};

// Guard against re-initialization on hot-reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth — use AsyncStorage persistence; fall back to getAuth() if already initialized
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (_) {
  // initializeAuth throws if already called — get the existing instance
  auth = getAuth(app);
}

// Firestore
const db = getFirestore(app);

export { app, auth, db, firebaseConfig };
