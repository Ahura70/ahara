import React, { useState } from 'react';
import { MealEntry, MealType } from '../../types';
import { ChevronDown, Trash2, Check } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';

interface MealSlotProps {
  mealType: MealType;
  meals: MealEntry[];
  onLogToggle: (entryId: string, logged: boolean) => void;
  onDelete: (entryId: string) => void;
  onServingsChange: (entryId: string, servings: number) => void;
}

export function MealSlot({ mealType, meals, onLogToggle, onDelete, onServingsChange }: MealSlotProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (meals.length === 0) {
    return null;
  }

  const totalCalories = meals.reduce(
    (sum, meal) => sum + (meal.recipe.servings > 0 ? (meal.recipe.calories / meal.recipe.servings) * (meal.servingsConsumed || 1) : 0),
    0
  );

  const totalMacros = meals.reduce(
    (acc, meal) => {
      const servingMultiplier = meal.recipe.servings > 0 ? (meal.servingsConsumed || 1) / meal.recipe.servings : 1;
      return {
        protein: acc.protein + (meal.recipe.macros?.protein || 0) * servingMultiplier,
        carbs: acc.carbs + (meal.recipe.macros?.carbs || 0) * servingMultiplier,
        fats: acc.fats + (meal.recipe.macros?.fats || 0) * servingMultiplier,
      };
    },
    { protein: 0, carbs: 0, fats: 0 }
  );

  return (
    <div className="bg-white rounded-lg mb-4 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1">
          <ChevronDown size={20} className={`text-gray-600 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{mealType}</h3>
            <p className="text-sm text-gray-600">{Math.round(totalCalories)} cal • P: {Math.round(totalMacros.protein)}g</p>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-gray-200 divide-y divide-gray-200">
          {meals.map((meal) => {
            const servingMultiplier = meal.recipe.servings > 0 ? (meal.servingsConsumed || 1) / meal.recipe.servings : 1;
            const calories = meal.recipe.servings > 0 ? (meal.recipe.calories / meal.recipe.servings) * (meal.servingsConsumed || 1) : 0;
            const macros = {
              protein: (meal.recipe.macros?.protein || 0) * servingMultiplier,
              carbs: (meal.recipe.macros?.carbs || 0) * servingMultiplier,
              fats: (meal.recipe.macros?.fats || 0) * servingMultiplier,
            };

            return (
              <div key={meal.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{meal.recipe.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{Math.round(calories)} cal</span>
                      <span className="text-xs text-gray-500">•</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={meal.servingsConsumed || 1}
                        onChange={(e) => onServingsChange(meal.id, parseFloat(e.target.value) || 1)}
                        className="w-12 px-1 py-0.5 text-xs border border-gray-300 rounded"
                        title="Servings"
                      />
                      <span className="text-xs text-gray-500">servings</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      P: {Math.round(macros.protein)}g • C: {Math.round(macros.carbs)}g • F: {Math.round(macros.fats)}g
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onLogToggle(meal.id, !meal.logged)}
                      className={`p-2 rounded transition-colors ${
                        meal.logged ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      title={meal.logged ? 'Mark as not eaten' : 'Mark as eaten'}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(meal.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
