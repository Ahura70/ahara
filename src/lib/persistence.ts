import { ref, set, get, onValue, remove } from 'firebase/database';
import { database } from '../config/firebase';
import { UserPreferences, Recipe, WeeklyPlan } from '../types';

export interface UserData {
  preferences?: UserPreferences;
  weeklyPlan?: WeeklyPlan[];
  generatedRecipes?: Recipe[];
  savedImage?: string;
  lastUpdated?: number;
}

/**
 * Save user data to Firebase Realtime Database
 */
export async function saveUserData(userId: string, data: Partial<UserData>): Promise<void> {
  try {
    const userRef = ref(database, `users/${userId}`);
    const timestamp = new Date().getTime();

    const dataToSave = {
      ...data,
      lastUpdated: timestamp,
    };

    await set(userRef, dataToSave);
    console.log('User data saved successfully');
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
}

/**
 * Load user data from Firebase
 */
export async function loadUserData(userId: string): Promise<UserData | null> {
  try {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error loading user data:', error);
    throw error;
  }
}

/**
 * Save preferences to Firebase
 */
export async function savePreferences(userId: string, preferences: UserPreferences): Promise<void> {
  try {
    const prefsRef = ref(database, `users/${userId}/preferences`);
    await set(prefsRef, preferences);
  } catch (error) {
    console.error('Error saving preferences:', error);
    throw error;
  }
}

/**
 * Load preferences from Firebase
 */
export async function loadPreferences(userId: string): Promise<UserPreferences | null> {
  try {
    const prefsRef = ref(database, `users/${userId}/preferences`);
    const snapshot = await get(prefsRef);

    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error loading preferences:', error);
    return null;
  }
}

/**
 * Save weekly plan to Firebase
 */
export async function saveWeeklyPlan(userId: string, plan: WeeklyPlan[]): Promise<void> {
  try {
    const planRef = ref(database, `users/${userId}/weeklyPlan`);
    await set(planRef, plan);
  } catch (error) {
    console.error('Error saving weekly plan:', error);
    throw error;
  }
}

/**
 * Load weekly plan from Firebase
 */
export async function loadWeeklyPlan(userId: string): Promise<WeeklyPlan[] | null> {
  try {
    const planRef = ref(database, `users/${userId}/weeklyPlan`);
    const snapshot = await get(planRef);

    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error loading weekly plan:', error);
    return null;
  }
}

/**
 * Listen to real-time updates for user preferences
 * Useful for syncing across tabs/devices
 */
export function listenToPreferences(
  userId: string,
  callback: (preferences: UserPreferences | null) => void
): () => void {
  const prefsRef = ref(database, `users/${userId}/preferences`);

  const unsubscribe = onValue(prefsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  });

  return unsubscribe;
}

/**
 * Listen to real-time updates for weekly plan
 */
export function listenToWeeklyPlan(
  userId: string,
  callback: (plan: WeeklyPlan[] | null) => void
): () => void {
  const planRef = ref(database, `users/${userId}/weeklyPlan`);

  const unsubscribe = onValue(planRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  });

  return unsubscribe;
}

/**
 * Delete user data (for account deletion)
 */
export async function deleteUserData(userId: string): Promise<void> {
  try {
    const userRef = ref(database, `users/${userId}`);
    await remove(userRef);
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
}
