/**
 * Main Store Provider
 *
 * Wires all state slices into a unified AppContext.
 * This file maintains backward compatibility — the public API is identical to the old monolithic store.tsx
 * Internally, state is organized into logical slices (auth, navigation, recipes, planner, nutrition, grocery, mealprep, ui).
 *
 * Any code importing from store.tsx will continue to work without changes.
 */

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import type { Screen, UserPreferences, Recipe, DailyMenu, ShoppingListItem, MealType } from '../types';
import { AuthUser, getCurrentUser } from '../lib/auth';
import {
  loadPreferences,
  savePreferences,
  loadWeeklyPlan,
  saveWeeklyPlan,
  listenToPreferences,
  listenToWeeklyPlan,
} from '../lib/persistence';

// Import all slices
import { useAuthState, type AuthState } from './slices/auth';
import { useNavigationState, type NavigationState } from './slices/navigation';
import { useRecipesState, type RecipesState } from './slices/recipes';
import { usePlannerState, type PlannerState } from './slices/planner';
import { useNutritionState, type NutritionState } from './slices/nutrition';
import { useGroceryState, type GroceryState } from './slices/grocery';
import { useMealPrepState, type MealPrepState } from './slices/mealprep';
import { useUIState, type UIState } from './slices/ui';

/**
 * Unified AppState interface — same as before
 * Combines all slices into one context for backward compatibility
 */
interface AppState
  extends AuthState,
    NavigationState,
    RecipesState,
    PlannerState,
    NutritionState,
    GroceryState,
    MealPrepState,
    UIState {
  // Preferences (saved in Firebase + localStorage)
  preferences: UserPreferences;
  setPreferences: (prefs: UserPreferences) => void;

  // Gallery images
  savedImages: string[];
  saveImage: (image: string) => void;
}

const defaultPreferences: UserPreferences = {
  cuisines: ['Italian', 'Japanese'],
  maxPrepTime: 30,
  macros: {
    protein: 30,
    carbs: 40,
    fats: 15,
  },
  dietaryRestrictions: [],
};

const AppContext = createContext<AppState | undefined>(undefined);

/**
 * AppProvider: Composes all state slices
 */
export function AppProvider({ children }: { children: ReactNode }) {
  // Pull all slices
  const authState = useAuthState();
  const navigationState = useNavigationState();
  const recipesState = useRecipesState();
  const plannerState = usePlannerState();
  const nutritionState = useNutritionState();
  const groceryState = useGroceryState();
  const mealPrepState = useMealPrepState();
  const uiState = useUIState();

  // Preferences (not in slices — managed here for Firebase sync)
  const [preferences, setPreferencesState] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('userPreferences');
      return saved ? JSON.parse(saved) : defaultPreferences;
    } catch {
      return defaultPreferences;
    }
  });

  // Gallery images
  const [savedImages, setSavedImages] = useState<string[]>([]);

  const setPreferences = (prefs: UserPreferences) => {
    setPreferencesState(prefs);
  };

  const saveImage = (image: string) => {
    setSavedImages((prev) => [image, ...prev]);
  };

  // Firebase persistence: load and sync user data on auth change
  useEffect(() => {
    const unsubscriber = authState.initializeAuthListener(async (user) => {
      if (user && !user.isAnonymous) {
        // Load data from Firebase
        try {
          const savedPrefs = await loadPreferences(user.uid);
          if (savedPrefs) {
            setPreferencesState(savedPrefs);
          }

          const savedPlan = await loadWeeklyPlan(user.uid);
          if (savedPlan) {
            plannerState.setWeeklyPlan(savedPlan);
          }

          // TODO Phase 2+: Add listeners for nutrition, grocery, prep sessions
          // const unsubNutrition = listenToNutritionLogs(user.uid, ...);
          // const unsubGrocery = listenToGroceryLists(user.uid, ...);
        } catch (error) {
          console.error('Error loading user data from Firebase:', error);
        }

        // Navigate to camera if setup complete
        if (navigationState.hasCompletedSetup) {
          navigationState.setCurrentScreen('camera');
        }
      } else if (!user) {
        // User logged out
        navigationState.setCurrentScreen('login');
      }
    });

    return () => {
      unsubscriber();
    };
  }, []);

  // Save preferences to Firebase when they change
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));

    if (authState.authUser && !authState.authUser.isAnonymous) {
      savePreferences(authState.authUser.uid, preferences).catch((error) => {
        console.error('Error saving preferences to Firebase:', error);
      });
    }
  }, [preferences, authState.authUser]);

  // Save weekly plan to Firebase when it changes
  useEffect(() => {
    if (authState.authUser && !authState.authUser.isAnonymous) {
      saveWeeklyPlan(authState.authUser.uid, plannerState.weeklyPlan).catch((error) => {
        console.error('Error saving weekly plan to Firebase:', error);
      });
    }
  }, [plannerState.weeklyPlan, authState.authUser]);

  // Compose all slices into unified AppState
  const appState: AppState = {
    // Auth
    ...authState,

    // Navigation
    ...navigationState,

    // Recipes
    ...recipesState,

    // Planner
    ...plannerState,

    // Nutrition
    ...nutritionState,

    // Grocery
    ...groceryState,

    // Meal Prep
    ...mealPrepState,

    // UI
    ...uiState,

    // Preferences
    preferences,
    setPreferences,

    // Gallery
    savedImages,
    saveImage,
  };

  return <AppContext.Provider value={appState}>{children}</AppContext.Provider>;
}

/**
 * Hook to use the app store
 * Same API as before — all downstream code continues to work
 */
export function useAppStore(): AppState {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within AppProvider');
  }
  return context;
}
