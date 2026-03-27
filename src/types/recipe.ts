/**
 * Recipe domain types — ingredient, macro, recipe definitions
 */

export interface Macros {
  protein: number;  // grams
  carbs: number;    // grams
  fats: number;     // grams
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;  // 'grams', 'ml', 'cups', 'tbsp', 'pieces', etc.
}

/**
 * Normalized ingredient for grocery merging — tracks which recipes need it
 */
export interface NormalizedIngredient extends Ingredient {
  category: GroceryCategory;
  recipeIds: string[];  // which recipes need this ingredient
}

export type GroceryCategory =
  | 'produce'
  | 'dairy'
  | 'meat'
  | 'seafood'
  | 'pantry'
  | 'frozen'
  | 'bakery'
  | 'beverages'
  | 'other';

export interface Recipe {
  id: string;
  title: string;
  prepTime: number;  // minutes
  cookTime?: number;  // minutes
  servings: number;
  calories: number;
  macros: Macros;
  matchPercentage: number;  // 0-100 (for AI-generated recipes)
  imageUrl: string;
  ingredients: Ingredient[];
  instructions: string[];
  notes?: string;
  dietaryRestrictions?: string[];
  cuisineType?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  sourceUrl?: string;  // optional external link
  isFavorite?: boolean;
  // NEW: recipe metadata
  source?: 'generated' | 'manual' | 'imported' | 'barcode';
  createdAt?: string;  // ISO date
  tags?: string[];  // user-defined tags
}
