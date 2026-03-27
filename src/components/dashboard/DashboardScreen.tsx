import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store';
import { Plus, Trash2 } from 'lucide-react';
import { CalorieBudget } from './CalorieBudget';
import { MacroSummary } from './MacroSummary';
import { WaterTracker } from './WaterTracker';
import { MealSlot } from './MealSlot';
import { QuickAddModal } from './QuickAddModal';
import { EmptyState } from '../common/EmptyState';
import { MealType, Macros, QuickAdd } from '../../types';

export function DashboardScreen() {
  const {
    weeklyPlan,
    nutritionGoals,
    dailyLogs,
    addQuickAdd,
    removeQuickAdd,
    setWaterIntake,
    logMeal,
    unlogMeal,
  } = useAppStore() as any;

  const [showQuickAddModal, setShowQuickAddModal] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todayMenu = weeklyPlan?.find((d: any) => d.date === today);
  const todayLog = dailyLogs?.get(today);

  // Calculate totals
  const totals = useMemo(() => {
    let calories = 0;
    let macros: Macros = { protein: 0, carbs: 0, fats: 0 };

    // Add logged meals from planner
    if (todayMenu?.recipes) {
      todayMenu.recipes.forEach((meal: any) => {
        if (meal.logged && meal.recipe) {
          const servingMultiplier = meal.recipe.servings > 0 ? (meal.servingsConsumed || 1) / meal.recipe.servings : 1;
          calories += (meal.recipe.calories || 0) * servingMultiplier;
          if (meal.recipe.macros) {
            macros.protein += meal.recipe.macros.protein * servingMultiplier;
            macros.carbs += meal.recipe.macros.carbs * servingMultiplier;
            macros.fats += meal.recipe.macros.fats * servingMultiplier;
          }
        }
      });
    }

    // Add quick adds
    if (todayLog?.quickAdds) {
      todayLog.quickAdds.forEach((qa: QuickAdd) => {
        calories += qa.calories;
        if (qa.macros) {
          macros.protein += qa.macros.protein || 0;
          macros.carbs += qa.macros.carbs || 0;
          macros.fats += qa.macros.fats || 0;
        }
      });
    }

    return { calories: Math.round(calories), macros };
  }, [todayMenu, todayLog]);

  const remaining = (nutritionGoals?.dailyCalories || 2000) - totals.calories;

  // Group meals by type
  const mealsByType: Record<MealType, any[]> = {
    Breakfast: [],
    Lunch: [],
    Dinner: [],
    Snack: [],
  };

  if (todayMenu?.recipes) {
    todayMenu.recipes.forEach((meal: any) => {
      if (meal.mealType && mealsByType[meal.mealType as MealType]) {
        mealsByType[meal.mealType as MealType].push(meal);
      }
    });
  }

  const handleQuickAdd = (entry: any) => {
    addQuickAdd(today, {
      id: Date.now().toString(),
      ...entry,
      loggedAt: new Date().toISOString(),
    });
  };

  const handleServingsChange = (entryId: string, servings: number) => {
    const meal = todayMenu?.recipes?.find((m: any) => m.id === entryId);
    if (meal) {
      meal.servingsConsumed = servings;
    }
  };

  const handleWaterChange = (index: number) => {
    const current = todayLog?.water || 0;
    const newWater = index === current - 1 ? current - 1 : index + 1;
    setWaterIntake(today, newWater);
  };

  const hasLoggedMeals = todayMenu?.recipes?.some((m: any) => m.logged);
  const hasQuickAdds = (todayLog?.quickAdds || []).length > 0;
  const isEmpty = !hasLoggedMeals && !hasQuickAdds;

  const goals = nutritionGoals || {
    dailyCalories: 2000,
    macroTargets: { protein: 150, carbs: 200, fats: 65 },
    waterGoal: 8,
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-8">
        <div className="text-sm text-blue-100 mb-1">
          {new Date(today).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
        <h1 className="text-3xl font-bold">Today's Nutrition</h1>
      </div>

      <div className="px-6 pt-6 space-y-6">
        {/* Calorie Budget */}
        <CalorieBudget
          consumed={totals.calories}
          goal={goals.dailyCalories}
          remaining={remaining}
        />

        {isEmpty ? (
          <>
            <EmptyState
              title="No meals logged yet"
              description="Start by adding food from your meal plan or logging a quick entry"
              icon="🍽️"
            />
            <button
              onClick={() => setShowQuickAddModal(true)}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Log Food
            </button>
          </>
        ) : (
          <>
            {/* Macro Summary */}
            <MacroSummary current={totals.macros} target={goals.macroTargets} />

            {/* Water Tracker */}
            <WaterTracker
              current={todayLog?.water || 0}
              goal={goals.waterGoal}
              onChange={handleWaterChange}
            />

            {/* Meal Slots */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Meals</h2>
              {(Object.keys(mealsByType) as MealType[]).map((mealType) => (
                <MealSlot
                  key={mealType}
                  mealType={mealType}
                  meals={mealsByType[mealType]}
                  onLogToggle={(entryId, logged) => {
                    if (logged) logMeal(today, entryId);
                    else unlogMeal(today, entryId);
                  }}
                  onDelete={(entryId) => {
                    const meal = todayMenu?.recipes?.find((m: any) => m.id === entryId);
                    if (meal) {
                      todayMenu.recipes = todayMenu.recipes.filter((m: any) => m.id !== entryId);
                    }
                  }}
                  onServingsChange={handleServingsChange}
                />
              ))}
            </div>

            {/* Quick Adds */}
            {hasQuickAdds && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Entries</h3>
                <div className="space-y-2">
                  {todayLog.quickAdds.map((qa: QuickAdd) => (
                    <div key={qa.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{qa.label}</p>
                        <p className="text-sm text-gray-600">{qa.calories} cal</p>
                      </div>
                      <button
                        onClick={() => removeQuickAdd(today, qa.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Food Button */}
            <button
              onClick={() => setShowQuickAddModal(true)}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 sticky bottom-20"
            >
              <Plus size={20} />
              Log Food
            </button>
          </>
        )}
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        onAdd={handleQuickAdd}
      />
    </div>
  );
}
