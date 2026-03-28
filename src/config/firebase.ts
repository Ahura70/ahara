import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';

// Firebase Configuration - uses environment variables with sensible defaults
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyForLocalDevelopment123456",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ahara-demo.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://ahara-demo-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ahara-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ahara-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abc123",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firebase Realtime Database
export const database = getDatabase(app);

// Connect to Firebase Emulator Suite for local development
const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';

if (useEmulator) {
  try {
    // Connect to Auth Emulator
    const authHost = import.meta.env.VITE_FIREBASE_EMULATOR_AUTH_HOST || '127.0.0.1:9099';
    connectAuthEmulator(auth, `http://${authHost}`, { disableWarnings: true });

    // Connect to Database Emulator
    const dbHost = import.meta.env.VITE_FIREBASE_EMULATOR_DB_HOST || '127.0.0.1:9000';
    connectDatabaseEmulator(database, dbHost.split(':')[0], parseInt(dbHost.split(':')[1]));

    console.log('🔥 Firebase Emulator Suite connected for local development');
  } catch (error) {
    // Emulator already connected or not running - that's ok
    console.debug('Firebase Emulator info:', error);
  }
}

export default app;
