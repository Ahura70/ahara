/**
 * Central type exports — re-exports from domain modules for backward compatibility
 * This allows existing imports like "import { Recipe } from './types'" to keep working
 */

// Navigation
export type Screen =
  | 'login'
  | 'preferences'
  | 'camera'
  | 'matches'
  | 'planner'
  | 'gallery'
  // NEW screens (to be added as components are built)
  | 'dashboard'  // Today tab — nutrition dashboard
  | 'grocery'  // Grocery tab — shopping lists
  | 'recipe-library'  // Profile subsection — saved recipes
  | 'recipe-detail'  // Full recipe view
  | 'create-recipe'  // Manual recipe entry
  | 'meal-prep'  // Meal prep planning
  | 'prep-session';  // Active prep execution

// Recipe domain
export type { Macros, Ingredient, NormalizedIngredient, Recipe } from './recipe';
export type { GroceryCategory } from './recipe';

// Planner domain
export type { MealType, MealEntry, QuickAdd, DailyMenu, DailyNutritionLog } from './planner';

// Grocery domain
export type { GroceryItem, GroceryList } from './grocery';

// User domain
export type { AuthUser, NutritionGoals, UserPreferences } from './user';

// Meal prep domain
export type { PrepBatch, PrepStep, PrepTimeline, PrepSession } from './mealprep';
