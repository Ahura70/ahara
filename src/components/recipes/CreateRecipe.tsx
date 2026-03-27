import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Recipe, Ingredient } from '../../types';

interface CreateRecipeProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (recipe: Omit<Recipe, 'id'>) => void;
}

export function CreateRecipe({ isOpen, onClose, onCreate }: CreateRecipeProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState(1);
  const [prepTime, setPrepTime] = useState(15);
  const [cookTime, setCookTime] = useState(30);
  const [calories, setCalories] = useState(300);
  const [protein, setProtein] = useState(20);
  const [carbs, setCarbs] = useState(30);
  const [fats, setFats] = useState(10);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', amount: 1, unit: 'cup' },
  ]);
  const [instructions, setInstructions] = useState('');
  const [tags, setTags] = useState('');

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: 1, unit: 'cup' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: any) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || ingredients.some((i) => !i.name)) return;

    onCreate({
      name,
      description,
      servings,
      prepTime,
      cookTime,
      calories,
      macros: { protein, carbs, fats },
      ingredients: ingredients.filter((i) => i.name),
      instructions,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      source: 'manual',
      createdAt: new Date().toISOString(),
    });

    // Reset
    setName('');
    setDescription('');
    setServings(1);
    setPrepTime(15);
    setCookTime(30);
    setCalories(300);
    setProtein(20);
    setCarbs(30);
    setFats(10);
    setIngredients([{ name: '', amount: 1, unit: 'cup' }]);
    setInstructions('');
    setTags('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="bg-white w-full rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Create Recipe</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipe Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Grilled Chicken"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Cooking Times */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Servings
              </label>
              <input
                type="number"
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prep (min)
              </label>
              <input
                type="number"
                value={prepTime}
                onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cook (min)
              </label>
              <input
                type="number"
                value={cookTime}
                onChange={(e) => setCookTime(parseInt(e.target.value) || 0)}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Nutrition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calories (per serving)
            </label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(parseInt(e.target.value) || 0)}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Protein (g)
              </label>
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(parseInt(e.target.value) || 0)}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carbs (g)
              </label>
              <input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(parseInt(e.target.value) || 0)}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fats (g)
              </label>
              <input
                type="number"
                value={fats}
                onChange={(e) => setFats(parseInt(e.target.value) || 0)}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Ingredients *
              </label>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
              >
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="space-y-2">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                    placeholder="Ingredient name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    required
                  />
                  <input
                    type="number"
                    step="0.5"
                    value={ing.amount}
                    onChange={(e) => handleIngredientChange(idx, 'amount', parseFloat(e.target.value))}
                    placeholder="1"
                    className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={ing.unit}
                    onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                    placeholder="cup"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(idx)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Step-by-step instructions (one per line)"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Separate tags with commas: healthy, quick, vegan"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Create Recipe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
