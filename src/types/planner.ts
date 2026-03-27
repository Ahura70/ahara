/**
 * Meal planning domain types — daily menus, meal entries, nutrition logs
 */

import { Recipe, Macros } from './recipe';

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

/**
 * A single meal entry in the daily plan
 * EXTENDED: now tracks logging state (was it actually eaten?)
 */
export interface MealEntry {
  id: string;
  mealType: MealType;
  recipe: Recipe;
  rating?: number;  // 1-5 star rating
  logged?: boolean;  // NEW: was this actually eaten?
  loggedAt?: string;  // NEW: when confirmed (ISO date)
  servingsConsumed?: number;  // NEW: might eat 0.5 or 2 servings
}

/**
 * Raw calorie/macro entry without a recipe
 * Allows logging "protein shake" or "snack bar" with raw nutrition
 */
export interface QuickAdd {
  id: string;
  label: string;  // "Protein shake", "Snack bar"
  calories: number;
  macros: Partial<Macros>;  // user might only know protein
  mealType: MealType;
  loggedAt: string;  // ISO date
}

/**
 * A single day's meal plan
 * EXTENDED: includes water intake and quick-adds
 */
export interface DailyMenu {
  date: string;  // 'YYYY-MM-DD'
  dayName: string;  // 'Monday', etc.
  recipes: MealEntry[];
  waterGlasses?: number;  // NEW: glasses of water consumed
  quickAdds?: QuickAdd[];  // NEW: raw calorie entries
}

/**
 * A day's logged nutrition totals (derived from meals + quick-adds)
 */
export interface DailyNutritionLog {
  date: string;
  meals: MealEntry[];  // planned/planned meals that were logged
  quickAdds: QuickAdd[];  // raw entries
  waterGlasses: number;
  totals: {
    calories: number;
    macros: Macros;
  };
}
