/**
 * User domain types — preferences, auth, nutrition goals
 */

import { Macros } from './recipe';

export interface AuthUser {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  isAnonymous: boolean;
}

/**
 * NEW: Daily nutrition targets
 */
export interface NutritionGoals {
  dailyCalories: number;  // e.g., 2000
  macroTargets: Macros;  // grams — target protein/carbs/fats
  waterGoal: number;  // glasses per day
}

/**
 * User preferences
 * EXTENDED: includes nutrition goals
 */
export interface UserPreferences {
  cuisines: string[];
  maxPrepTime: number;  // minutes
  macros: Macros;  // legacy field — kept for backward compatibility
  dietaryRestrictions: string[];
  nutritionGoals?: NutritionGoals;  // NEW: daily targets
}
