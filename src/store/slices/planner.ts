/**
 * Planner State Slice
 * Weekly meal plan state and actions
 */

import { useState, useCallback } from 'react';
import type { Recipe, DailyMenu, MealType } from '../../types';

export interface PlannerState {
  weeklyPlan: DailyMenu[];
  setWeeklyPlan: (plan: DailyMenu[]) => void;
  addToWeeklyPlan: (
    recipe: Recipe,
    dayIndex: number,
    mealType: MealType
  ) => void;
  removeFromWeeklyPlan: (dayIndex: number, mealIndex: number) => void;
  updateRecipeNotes: (dayIndex: number, mealIndex: number, notes: string) => void;
  rateRecipe: (dayIndex: number, mealIndex: number, rating: number) => void;
  moveRecipe: (
    sourceDayIndex: number,
    sourceMealIndex: number,
    destDayIndex: number,
    destMealIndex: number
  ) => void;
}

/**
 * Generate current week's date range (Mon-Sun from today)
 */
function getCurrentWeekDates(): DailyMenu[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7)); // Shift to Monday

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return dayNames.map((name, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return { date: `${yyyy}-${mm}-${dd}`, dayName: name, recipes: [] };
  });
}

export function usePlannerState(): PlannerState {
  const [weeklyPlan, setWeeklyPlan] = useState<DailyMenu[]>(getCurrentWeekDates());

  const addToWeeklyPlan = useCallback(
    (recipe: Recipe, dayIndex: number, mealType: MealType) => {
      setWeeklyPlan((prev) => {
        const updated = [...prev];
        if (dayIndex < 0 || dayIndex >= updated.length) return prev;

        const mealEntry = {
          id: `${recipe.id}-${Date.now()}`,
          mealType,
          recipe,
        };

        updated[dayIndex] = {
          ...updated[dayIndex],
          recipes: [...updated[dayIndex].recipes, mealEntry],
        };

        return updated;
      });
    },
    []
  );

  const removeFromWeeklyPlan = useCallback(
    (dayIndex: number, mealIndex: number) => {
      setWeeklyPlan((prev) => {
        const updated = [...prev];
        if (dayIndex < 0 || dayIndex >= updated.length) return prev;

        updated[dayIndex] = {
          ...updated[dayIndex],
          recipes: updated[dayIndex].recipes.filter((_, i) => i !== mealIndex),
        };

        return updated;
      });
    },
    []
  );

  const updateRecipeNotes = useCallback(
    (dayIndex: number, mealIndex: number, notes: string) => {
      setWeeklyPlan((prev) => {
        const updated = [...prev];
        if (dayIndex < 0 || dayIndex >= updated.length) return prev;

        const dayRecipes = [...updated[dayIndex].recipes];
        if (mealIndex < 0 || mealIndex >= dayRecipes.length) return prev;

        dayRecipes[mealIndex] = {
          ...dayRecipes[mealIndex],
          recipe: {
            ...dayRecipes[mealIndex].recipe,
            notes,
          },
        };

        updated[dayIndex] = {
          ...updated[dayIndex],
          recipes: dayRecipes,
        };

        return updated;
      });
    },
    []
  );

  const rateRecipe = useCallback(
    (dayIndex: number, mealIndex: number, rating: number) => {
      setWeeklyPlan((prev) => {
        const updated = [...prev];
        if (dayIndex < 0 || dayIndex >= updated.length) return prev;

        const dayRecipes = [...updated[dayIndex].recipes];
        if (mealIndex < 0 || mealIndex >= dayRecipes.length) return prev;

        dayRecipes[mealIndex] = {
          ...dayRecipes[mealIndex],
          rating: Math.max(1, Math.min(5, rating)),
        };

        updated[dayIndex] = {
          ...updated[dayIndex],
          recipes: dayRecipes,
        };

        return updated;
      });
    },
    []
  );

  const moveRecipe = useCallback(
    (
      sourceDayIndex: number,
      sourceMealIndex: number,
      destDayIndex: number,
      destMealIndex: number
    ) => {
      setWeeklyPlan((prev) => {
        const updated = [...prev];

        // Validate indices
        if (
          sourceDayIndex < 0 ||
          sourceDayIndex >= updated.length ||
          destDayIndex < 0 ||
          destDayIndex >= updated.length
        ) {
          return prev;
        }

        const sourceRecipes = [...updated[sourceDayIndex].recipes];
        const destRecipes = [...updated[destDayIndex].recipes];

        if (sourceMealIndex < 0 || sourceMealIndex >= sourceRecipes.length) {
          return prev;
        }

        // Extract the meal being moved
        const [movedMeal] = sourceRecipes.splice(sourceMealIndex, 1);

        // Insert at destination
        const insertIndex = Math.min(destMealIndex, destRecipes.length);
        destRecipes.splice(insertIndex, 0, movedMeal);

        // Update both days
        updated[sourceDayIndex] = {
          ...updated[sourceDayIndex],
          recipes: sourceRecipes,
        };

        updated[destDayIndex] = {
          ...updated[destDayIndex],
          recipes: destRecipes,
        };

        return updated;
      });
    },
    []
  );

  return {
    weeklyPlan,
    setWeeklyPlan,
    addToWeeklyPlan,
    removeFromWeeklyPlan,
    updateRecipeNotes,
    rateRecipe,
    moveRecipe,
  };
}
