import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  GoogleAuthProvider,
  OAuthProvider,
  User,
  signInAnonymously,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth } from '../config/firebase';

// Initialize providers
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

// Configure Apple provider for web
appleProvider.addScope('email');
appleProvider.addScope('name');

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

/**
 * Sign in with Google (using popup - better for web apps)
 */
export async function signInWithGoogle(): Promise<void> {
  try {
    // Try popup first (works better for web and emulator)
    await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    // If popup blocked, fall back to redirect
    if (error.code === 'auth/popup-blocked') {
      console.warn('Popup blocked, using redirect instead');
      await signInWithRedirect(auth, googleProvider);
    } else {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }
}

/**
 * Sign in with Apple (using popup - better for web apps)
 */
export async function signInWithApple(): Promise<void> {
  try {
    // Try popup first (works better for web and emulator)
    await signInWithPopup(auth, appleProvider);
  } catch (error: any) {
    // If popup blocked, fall back to redirect
    if (error.code === 'auth/popup-blocked') {
      console.warn('Popup blocked, using redirect instead');
      await signInWithRedirect(auth, appleProvider);
    } else {
      console.error('Apple sign-in error:', error);
      throw error;
    }
  }
}

/**
 * Sign in anonymously (guest mode)
 */
export async function signInAsGuest(): Promise<AuthUser> {
  try {
    const result = await signInAnonymously(auth);
    return mapFirebaseUser(result.user);
  } catch (error) {
    console.error('Anonymous sign-in error:', error);
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function logOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
}

/**
 * Get current user
 */
export function getCurrentUser(): AuthUser | null {
  const user = auth.currentUser;
  return user ? mapFirebaseUser(user) : null;
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      callback(mapFirebaseUser(firebaseUser));
    } else {
      callback(null);
    }
  });
}

/**
 * Helper to map Firebase user to our AuthUser interface
 */
function mapFirebaseUser(firebaseUser: User): AuthUser {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    isAnonymous: firebaseUser.isAnonymous,
  };
}

/**
 * Initialize persistence (survives page reloads)
 */
export async function initializeAuthPersistence(): Promise<void> {
  try {
    await setPersistence(auth, browserLocalPersistence);
    // Handle redirect result from OAuth flow
    const result = await getRedirectResult(auth);
    if (result) {
      console.log('User signed in via redirect:', result.user.email);
    }
  } catch (error) {
    console.error('Error setting persistence:', error);
  }
}
