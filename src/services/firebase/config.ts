import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Validate required environment variables
const requiredEnvVars = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,

};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.warn('Missing Firebase environment variables:', missingVars);
}

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'NOT SET',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 20)}...` : 'NOT SET'
});

// Initialize Firebase - check if app already exists to prevent duplicate initialization
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  console.error('This error often occurs when:');
  console.error('1. The API key is invalid or doesn\'t match the project');
  console.error('2. The project ID is incorrect');
  console.error('3. The Firebase project doesn\'t exist or is misconfigured');
  console.error('Please check your Firebase project settings and update the .env file');
  throw error;
}


// Initialize Firebase services
export const auth = (() => {
  // First, check if Auth is already initialized to avoid the "already-initialized" error
  try {
    const existingAuth = getAuth(app);
    if (existingAuth) {
      console.log('Firebase Auth: Using existing instance');
      return existingAuth;
    }
  } catch (error) {
    // Auth not yet initialized, proceed to initializeAuth
  }

  try {
    const persistenceFn = getReactNativePersistence;
    console.log('Firebase Auth: Persistence fn type:', typeof persistenceFn);

    // @ts-ignore - getReactNativePersistence can be a false-positive TS error in Firebase v10+
    const persistence = typeof persistenceFn === 'function' && AsyncStorage
      ? persistenceFn(AsyncStorage)
      : undefined;

    const initializedAuth = initializeAuth(app, {
      persistence: persistence
    });
    console.log('Firebase Auth initialized with persistence:', !!persistence);
    return initializedAuth;
  } catch (error: any) {
    // Final fallback: if initialization still fails with "already-initialized", just get the existing instance
    if (error && (error.code === 'auth/already-initialized' || error.message?.includes('already-initialized'))) {
      return getAuth(app);
    }
    // Log other initialization errors but try to return a default auth instance to prevent app crash
    console.error('Firebase Auth initialization error:', error);
    return getAuth(app);
  }
})();
export const firestore = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export const storage = getStorage(app);

export default app;