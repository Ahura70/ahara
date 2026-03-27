import React from 'react';
import { Recipe, Ingredient } from '../../types';

interface BatchScalerProps {
  recipe: Recipe;
  scaledServings: number;
  onServingsChange: (servings: number) => void;
  onRemove?: () => void;
}

export function BatchScaler({ recipe, scaledServings, onServingsChange, onRemove }: BatchScalerProps) {
  const scaleFactor = recipe.servings > 0 ? scaledServings / recipe.servings : 1;

  // Scale ingredients
  const scaledIngredients = (recipe.ingredients || []).map((ing) => ({
    ...ing,
    amount: ing.amount * scaleFactor,
  }));

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{recipe.name}</h3>
        {onRemove && (
          <button
            onClick={onRemove}
            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      {/* Servings adjuster */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Servings: {scaledServings}
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => onServingsChange(Math.max(1, scaledServings - 1))}
            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            −
          </button>
          <input
            type="number"
            value={scaledServings}
            onChange={(e) => onServingsChange(parseInt(e.target.value) || 1)}
            min="1"
            className="flex-1 px-3 py-2 border border-blue-300 rounded text-center"
          />
          <button
            onClick={() => onServingsChange(scaledServings + 1)}
            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Scaled ingredients */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Ingredients</h4>
        <ul className="space-y-1 text-sm">
          {scaledIngredients.map((ing, idx) => (
            <li key={idx} className="text-gray-700">
              <span className="font-medium">{ing.amount.toFixed(2)}</span> {ing.unit} {ing.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Scaled nutrition */}
      {recipe.macros && (
        <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-3 gap-2 text-xs">
          <div>
            <p className="text-gray-600">Protein</p>
            <p className="font-semibold text-blue-600">{(recipe.macros.protein * scaleFactor).toFixed(0)}g</p>
          </div>
          <div>
            <p className="text-gray-600">Carbs</p>
            <p className="font-semibold text-orange-600">{(recipe.macros.carbs * scaleFactor).toFixed(0)}g</p>
          </div>
          <div>
            <p className="text-gray-600">Fats</p>
            <p className="font-semibold text-red-600">{(recipe.macros.fats * scaleFactor).toFixed(0)}g</p>
          </div>
        </div>
      )}
    </div>
  );
}
