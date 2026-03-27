export type Screen = 'login' | 'preferences' | 'camera' | 'matches' | 'planner' | 'gallery';

export interface Macros {
  protein: number;
  carbs: number;
  fats: number;
}

export interface UserPreferences {
  cuisines: string[];
  maxPrepTime: number;
  macros: Macros;
  dietaryRestrictions: string[];
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

export interface Recipe {
  id: string;
  title: string;
  prepTime: number;
  servings: number;
  calories: number;
  macros: Macros;
  matchPercentage: number;
  imageUrl: string;
  ingredients: Ingredient[];
  instructions: string[];
  notes?: string;
  dietaryRestrictions?: string[];
  cuisineType?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  cookTime?: number; // in minutes
  isFavorite?: boolean;
}

export interface ShoppingListItem {
  name: string;
  amount: number;
  unit: string;
  category: 'produce' | 'dairy' | 'meat' | 'pantry' | 'frozen' | 'other';
  checked: boolean;
}

export interface DailyMenu {
  date: string;
  dayName: string;
  recipes: {
    id: string;
    mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
    recipe: Recipe;
    rating?: number;
  }[];
}
