/**
 * Recipes State Slice
 * Generated recipes (transient), favorites, and recipe library (saved)
 */

import { useState, useCallback } from 'react';
import type { Recipe } from '../../types';

export interface RecipesState {
  // Transient: AI-generated recipes from latest image scan
  generatedRecipes: Recipe[];
  setGeneratedRecipes: (recipes: Recipe[]) => void;
  updateGeneratedRecipeImage: (id: string, imageUrl: string) => void;

  // Favorites: User's favorite recipes
  favorites: Recipe[];
  toggleFavorite: (recipe: Recipe) => void;

  // NEW: Recipe library — saved recipes for reuse
  recipeLibrary: Recipe[];
  saveToLibrary: (recipe: Recipe) => void;
  removeFromLibrary: (recipeId: string) => void;
  searchLibrary: (query: string) => Recipe[];
}

export function useRecipesState(): RecipesState {
  const [generatedRecipes, setGeneratedRecipesState] = useState<Recipe[]>([]);
  const [favorites, setFavoritesState] = useState<Recipe[]>([]);
  const [recipeLibrary, setRecipeLibraryState] = useState<Recipe[]>([]);

  const setGeneratedRecipes = useCallback((recipes: Recipe[]) => {
    setGeneratedRecipesState(recipes);
  }, []);

  const updateGeneratedRecipeImage = useCallback((id: string, imageUrl: string) => {
    setGeneratedRecipesState((prev) =>
      prev.map((r) => (r.id === id ? { ...r, imageUrl } : r))
    );
  }, []);

  const toggleFavorite = useCallback((recipe: Recipe) => {
    setFavoritesState((prev) => {
      const exists = prev.some((r) => r.id === recipe.id);
      return exists ? prev.filter((r) => r.id !== recipe.id) : [...prev, recipe];
    });
  }, []);

  const saveToLibrary = useCallback((recipe: Recipe) => {
    setRecipeLibraryState((prev) => {
      const exists = prev.some((r) => r.id === recipe.id);
      if (exists) return prev;
      return [...prev, { ...recipe, createdAt: new Date().toISOString() }];
    });
  }, []);

  const removeFromLibrary = useCallback((recipeId: string) => {
    setRecipeLibraryState((prev) => prev.filter((r) => r.id !== recipeId));
  }, []);

  const searchLibrary = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase();
      return recipeLibrary.filter(
        (r) =>
          r.title.toLowerCase().includes(lowerQuery) ||
          r.cuisineType?.toLowerCase().includes(lowerQuery) ||
          r.tags?.some((t) => t.toLowerCase().includes(lowerQuery))
      );
    },
    [recipeLibrary]
  );

  return {
    generatedRecipes,
    setGeneratedRecipes,
    updateGeneratedRecipeImage,
    favorites,
    toggleFavorite,
    recipeLibrary,
    saveToLibrary,
    removeFromLibrary,
    searchLibrary,
  };
}
