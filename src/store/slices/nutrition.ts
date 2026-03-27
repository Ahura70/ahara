/**
 * Nutrition State Slice
 * NEW: Daily nutrition logs, quick-adds, water tracking, and nutrition goals
 */

import { useState, useCallback } from 'react';
import type { DailyMenu, NutritionGoals, QuickAdd, MealEntry, Macros } from '../../types';

export interface NutritionState {
  // Daily nutrition goals
  nutritionGoals: NutritionGoals;
  setNutritionGoals: (goals: NutritionGoals) => void;

  // Daily logs: { date: DailyMenu with water & quickAdds }
  dailyLogs: Map<string, { water: number; quickAdds: QuickAdd[] }>;

  // Actions
  logMeal: (date: string, entryId: string, servings?: number) => void;
  unlogMeal: (date: string, entryId: string) => void;
  addQuickAdd: (date: string, entry: QuickAdd) => void;
  removeQuickAdd: (date: string, entryId: string) => void;
  setWaterIntake: (date: string, glasses: number) => void;

  // Derived totals
  getDailyTotals: (date: string, dayPlan?: DailyMenu) => {
    calories: number;
    macros: Macros;
    water: number;
  };
  getRemainingCalories: (date: string, dayPlan?: DailyMenu) => number;
}

const defaultNutritionGoals: NutritionGoals = {
  dailyCalories: 2000,
  macroTargets: { protein: 150, carbs: 200, fats: 65 },
  waterGoal: 8,
};

export function useNutritionState(): NutritionState {
  const [nutritionGoals, setNutritionGoalsState] = useState<NutritionGoals>(
    defaultNutritionGoals
  );
  const [dailyLogs, setDailyLogs] = useState<
    Map<string, { water: number; quickAdds: QuickAdd[] }>
  >(new Map());

  const setNutritionGoals = useCallback((goals: NutritionGoals) => {
    setNutritionGoalsState(goals);
  }, []);

  const getOrCreateLog = useCallback(
    (date: string) => {
      let log = dailyLogs.get(date);
      if (!log) {
        log = { water: 0, quickAdds: [] };
        setDailyLogs((prev) => new Map(prev).set(date, log!));
      }
      return log;
    },
    [dailyLogs]
  );

  const addQuickAdd = useCallback(
    (date: string, entry: QuickAdd) => {
      setDailyLogs((prev) => {
        const updated = new Map(prev);
        const log = updated.get(date) || { water: 0, quickAdds: [] };
        log.quickAdds = [...log.quickAdds, entry];
        updated.set(date, log);
        return updated;
      });
    },
    []
  );

  const removeQuickAdd = useCallback((date: string, entryId: string) => {
    setDailyLogs((prev) => {
      const updated = new Map(prev);
      const log = updated.get(date);
      if (log) {
        log.quickAdds = log.quickAdds.filter((q) => q.id !== entryId);
        updated.set(date, log);
      }
      return updated;
    });
  }, []);

  const setWaterIntake = useCallback((date: string, glasses: number) => {
    setDailyLogs((prev) => {
      const updated = new Map(prev);
      const log = updated.get(date) || { water: 0, quickAdds: [] };
      log.water = Math.max(0, glasses);
      updated.set(date, log);
      return updated;
    });
  }, []);

  const logMeal = useCallback(
    (date: string, entryId: string, servings?: number) => {
      // Note: This updates the weeklyPlan via a ref to it passed from parent store
      // For now, this is a placeholder that the AppProvider will wire
      console.log(`Logged meal ${entryId} on ${date} with ${servings} servings`);
    },
    []
  );

  const unlogMeal = useCallback((date: string, entryId: string) => {
    // Placeholder — wired in parent store
    console.log(`Unlogged meal ${entryId} on ${date}`);
  }, []);

  const getDailyTotals = useCallback(
    (date: string, dayPlan?: DailyMenu) => {
      const log = dailyLogs.get(date);
      const quickAddTotals = log?.quickAdds.reduce(
        (acc, qa) => ({
          calories: acc.calories + qa.calories,
          macros: {
            protein: acc.macros.protein + (qa.macros.protein || 0),
            carbs: acc.macros.carbs + (qa.macros.carbs || 0),
            fats: acc.macros.fats + (qa.macros.fats || 0),
          },
        }),
        {
          calories: 0,
          macros: { protein: 0, carbs: 0, fats: 0 },
        }
      ) || { calories: 0, macros: { protein: 0, carbs: 0, fats: 0 } };

      // Add up logged meals from dayPlan
      const mealTotals = dayPlan?.recipes
        .filter((m) => m.logged)
        .reduce(
          (acc, m) => {
            const servings = m.servingsConsumed || 1;
            return {
              calories: acc.calories + m.recipe.calories * servings,
              macros: {
                protein: acc.macros.protein + m.recipe.macros.protein * servings,
                carbs: acc.macros.carbs + m.recipe.macros.carbs * servings,
                fats: acc.macros.fats + m.recipe.macros.fats * servings,
              },
            };
          },
          {
            calories: 0,
            macros: { protein: 0, carbs: 0, fats: 0 },
          }
        ) || { calories: 0, macros: { protein: 0, carbs: 0, fats: 0 } };

      return {
        calories: mealTotals.calories + quickAddTotals.calories,
        macros: {
          protein: mealTotals.macros.protein + quickAddTotals.macros.protein,
          carbs: mealTotals.macros.carbs + quickAddTotals.macros.carbs,
          fats: mealTotals.macros.fats + quickAddTotals.macros.fats,
        },
        water: log?.water || 0,
      };
    },
    [dailyLogs]
  );

  const getRemainingCalories = useCallback(
    (date: string, dayPlan?: DailyMenu) => {
      const totals = getDailyTotals(date, dayPlan);
      return Math.max(0, nutritionGoals.dailyCalories - totals.calories);
    },
    [getDailyTotals, nutritionGoals.dailyCalories]
  );

  return {
    nutritionGoals,
    setNutritionGoals,
    dailyLogs,
    logMeal,
    unlogMeal,
    addQuickAdd,
    removeQuickAdd,
    setWaterIntake,
    getDailyTotals,
    getRemainingCalories,
  };
}
