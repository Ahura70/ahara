import React from 'react';
import { Recipe } from '../../types';
import { ArrowLeft, Clock, Flame, Users } from 'lucide-react';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onAddToMeal?: (recipe: Recipe) => void;
  onCookMode?: (recipe: Recipe) => void;
}

export function RecipeDetail({ recipe, onBack, onAddToMeal, onCookMode }: RecipeDetailProps) {
  return (
    <div className="pb-20">
      {/* Header with back button */}
      <div className="relative h-64 bg-gradient-to-br from-gray-300 to-gray-400">
        {recipe.imageUrl && (
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
        )}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 bg-white/90 hover:bg-white text-gray-900 p-2 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="px-6 pt-6">
        {/* Title & Meta */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.name}</h1>
        {recipe.description && (
          <p className="text-gray-600 mb-4">{recipe.description}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6 bg-gray-50 rounded-lg p-4">
          <div className="text-center">
            <Clock size={20} className="mx-auto text-blue-500 mb-1" />
            <p className="text-xs text-gray-600">Prep Time</p>
            <p className="font-semibold text-gray-900">{recipe.prepTime || '-'} min</p>
          </div>
          <div className="text-center">
            <Flame size={20} className="mx-auto text-orange-500 mb-1" />
            <p className="text-xs text-gray-600">Calories</p>
            <p className="font-semibold text-gray-900">{recipe.calories || '-'}</p>
          </div>
          <div className="text-center">
            <Users size={20} className="mx-auto text-green-500 mb-1" />
            <p className="text-xs text-gray-600">Servings</p>
            <p className="font-semibold text-gray-900">{recipe.servings || 1}</p>
          </div>
        </div>

        {/* Macros */}
        {recipe.macros && (
          <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-3">Macros (per serving)</h2>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-gray-600">Protein</p>
                <p className="font-semibold text-blue-600">{recipe.macros.protein}g</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Carbs</p>
                <p className="font-semibold text-orange-600">{recipe.macros.carbs}g</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Fats</p>
                <p className="font-semibold text-red-600">{recipe.macros.fats}g</p>
              </div>
            </div>
          </div>
        )}

        {/* Ingredients */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Ingredients</h2>
          <ul className="space-y-2">
            {(recipe.ingredients || []).map((ing, idx) => (
              <li key={idx} className="flex items-center gap-2 text-gray-700">
                <span className="text-blue-500">•</span>
                <span>{ing.amount} {ing.unit} {ing.name}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        {recipe.instructions && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Instructions</h2>
            <ol className="space-y-3">
              {recipe.instructions.split('\n').filter(Boolean).map((instruction, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-semibold">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700 pt-0.5">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-gray-900 mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {onAddToMeal && (
            <button
              onClick={() => onAddToMeal(recipe)}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Add to Meal Plan
            </button>
          )}
          {onCookMode && (
            <button
              onClick={() => onCookMode(recipe)}
              className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              Cook Mode
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
