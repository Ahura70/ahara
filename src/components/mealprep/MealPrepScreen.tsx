import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { Plus, Play } from 'lucide-react';
import { BatchScaler } from './BatchScaler';
import { PrepTimeline } from './PrepTimeline';
import { PrepChecklist } from './PrepChecklist';
import { EmptyState } from '../common/EmptyState';
import { Recipe, PrepSession } from '../../types';

type Screen = 'select' | 'scale' | 'timeline' | 'checklist';

interface SelectedRecipe {
  recipe: Recipe;
  scaledServings: number;
}

export function MealPrepScreen() {
  const { weeklyPlan, generatedRecipes, favorites, createPrepSession } = useAppStore() as any;
  const [screen, setScreen] = useState<Screen>('select');
  const [selectedRecipes, setSelectedRecipes] = useState<SelectedRecipe[]>([]);
  const [sessionName, setSessionName] = useState('');
  const [currentSession, setCurrentSession] = useState<PrepSession | null>(null);

  // Get all available recipes
  const allRecipes = [
    ...(generatedRecipes || []),
    ...(favorites || []),
    ...(weeklyPlan?.flatMap((d: any) => d.recipes?.map((r: any) => r.recipe) || []) || []),
  ];

  const handleAddRecipe = (recipe: Recipe) => {
    if (!selectedRecipes.find((r) => r.recipe.id === recipe.id)) {
      setSelectedRecipes([
        ...selectedRecipes,
        { recipe, scaledServings: recipe.servings || 1 },
      ]);
    }
  };

  const handleUpdateServings = (recipeId: string, servings: number) => {
    setSelectedRecipes(
      selectedRecipes.map((r) =>
        r.recipe.id === recipeId ? { ...r, scaledServings: servings } : r
      )
    );
  };

  const handleRemoveRecipe = (recipeId: string) => {
    setSelectedRecipes(selectedRecipes.filter((r) => r.recipe.id !== recipeId));
  };

  const handleGenerateTimeline = () => {
    if (!sessionName || selectedRecipes.length === 0) return;

    // Create mock timeline steps
    const steps = selectedRecipes.flatMap((sr, batchIdx) => {
      const instructions = (sr.recipe.instructions || '').split('\n').filter(Boolean);
      return instructions.slice(0, 2).map((instr, idx) => ({
        batchId: sr.recipe.id,
        recipeName: sr.recipe.name,
        instruction: instr.substring(0, 50),
        durationMinutes: Math.max(5, Math.floor((sr.recipe.cookTime || 30) / 2)),
        isPassive: idx > 0,
        isCompleted: false,
      }));
    });

    const totalDuration = Math.max(...steps.map((s) => s.durationMinutes));

    setCurrentSession({
      id: Date.now().toString(),
      name: sessionName,
      batches: selectedRecipes.map((sr) => ({
        id: sr.recipe.id,
        recipe: sr.recipe,
        scaledServings: sr.scaledServings,
        originalServings: sr.recipe.servings || 1,
        scaledIngredients: (sr.recipe.ingredients || []).map((ing) => ({
          ...ing,
          amount: ing.amount * (sr.scaledServings / (sr.recipe.servings || 1)),
        })),
      })),
      timeline: { totalDuration, steps: steps as any },
      createdAt: new Date().toISOString(),
      status: 'planning',
    });

    setScreen('timeline');
  };

  const handleCompleteSession = () => {
    if (currentSession && createPrepSession) {
      createPrepSession(currentSession);
      // Reset
      setSelectedRecipes([]);
      setSessionName('');
      setCurrentSession(null);
      setScreen('select');
    }
  };

  // Screen: Select recipes
  if (screen === 'select') {
    return (
      <div className="pb-20">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-8">
          <h1 className="text-3xl font-bold mb-2">Meal Prep</h1>
          <p className="text-purple-100">Select recipes and generate a prep timeline</p>
        </div>

        <div className="px-6 pt-6 space-y-6">
          {/* Session name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Name
            </label>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g., Sunday Prep"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Selected recipes */}
          {selectedRecipes.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Selected Recipes ({selectedRecipes.length})
              </h2>
              <div className="space-y-3 mb-6">
                {selectedRecipes.map((sr) => (
                  <BatchScaler
                    key={sr.recipe.id}
                    recipe={sr.recipe}
                    scaledServings={sr.scaledServings}
                    onServingsChange={(servings) => handleUpdateServings(sr.recipe.id, servings)}
                    onRemove={() => handleRemoveRecipe(sr.recipe.id)}
                  />
                ))}
              </div>
              <button
                onClick={handleGenerateTimeline}
                disabled={!sessionName || selectedRecipes.length === 0}
                className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Play size={20} />
                Generate Timeline
              </button>
            </div>
          )}

          {/* Available recipes */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Available Recipes</h2>
            {allRecipes.length === 0 ? (
              <EmptyState
                title="No recipes available"
                description="Add some recipes to your favorites or meal plan first"
                icon="🔍"
              />
            ) : (
              <div className="space-y-2">
                {allRecipes.map((recipe: Recipe) => (
                  <button
                    key={recipe.id}
                    onClick={() => handleAddRecipe(recipe)}
                    disabled={selectedRecipes.some((r) => r.recipe.id === recipe.id)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      selectedRecipes.some((r) => r.recipe.id === recipe.id)
                        ? 'bg-purple-50 border-purple-500 opacity-50'
                        : 'bg-white border-gray-200 hover:border-purple-500'
                    } disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{recipe.name}</h3>
                        <p className="text-xs text-gray-600">
                          {recipe.cookTime} min • {recipe.calories || '?'} cal
                        </p>
                      </div>
                      {!selectedRecipes.some((r) => r.recipe.id === recipe.id) && (
                        <Plus size={20} className="text-gray-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Screen: Timeline
  if (screen === 'timeline' && currentSession) {
    return (
      <div className="pb-20">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-8">
          <h1 className="text-3xl font-bold">{currentSession.name}</h1>
        </div>

        <div className="px-6 pt-6 space-y-6">
          <PrepTimeline
            steps={currentSession.timeline.steps}
            totalDuration={currentSession.timeline.totalDuration}
          />

          <div className="flex gap-3">
            <button
              onClick={() => setScreen('select')}
              className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setScreen('checklist')}
              className="flex-1 bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
            >
              <Play size={20} />
              Start Cooking
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Screen: Checklist
  if (screen === 'checklist' && currentSession) {
    const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

    return (
      <PrepChecklist
        sessionName={currentSession.name}
        steps={currentSession.timeline.steps.map((s) => ({
          id: `${s.batchId}-${s.instruction}`,
          ...s,
          isCompleted: completedSteps.has(`${s.batchId}-${s.instruction}`),
        }))}
        onStepToggle={(stepId) => {
          const newSet = new Set(completedSteps);
          if (newSet.has(stepId)) {
            newSet.delete(stepId);
          } else {
            newSet.add(stepId);
          }
          setCompletedSteps(newSet);
        }}
        onBack={() => setScreen('timeline')}
        onComplete={handleCompleteSession}
      />
    );
  }

  return null;
}
