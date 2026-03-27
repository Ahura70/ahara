import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// TODO: Replace these with your actual Firebase project credentials
// Get these from Firebase Console: https://console.firebase.google.com
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAGbbpNiEfkK6kWowU4or7DzRis8u1m47Y",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ahara-ai.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://ahara-ai-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ahara-ai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ahara-ai.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abc123",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firebase Realtime Database
export const database = getDatabase(app);

export default app;
