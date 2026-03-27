/**
 * Backward compatibility re-exports from domain modules
 * This file is deprecated — new code should import from src/types/index or specific domain modules
 */

export type {
  Screen,
  Macros,
  Ingredient,
  NormalizedIngredient,
  Recipe,
  GroceryCategory,
  MealType,
  MealEntry,
  QuickAdd,
  DailyMenu,
  DailyNutritionLog,
  GroceryItem,
  GroceryList,
  AuthUser,
  NutritionGoals,
  UserPreferences,
  PrepBatch,
  PrepStep,
  PrepTimeline,
  PrepSession,
} from './types/index';

import type { GroceryItem } from './types/index';

/**
 * Deprecated: ShoppingListItem
 * Use GroceryItem instead (richer type with IDs and source tracking)
 */
export type ShoppingListItem = GroceryItem;
