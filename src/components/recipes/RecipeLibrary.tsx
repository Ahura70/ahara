import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store';
import { Plus, Search, X } from 'lucide-react';
import { Recipe } from '../../types';
import { EmptyState } from '../common/EmptyState';

interface RecipeLibraryProps {
  onSelectRecipe?: (recipe: Recipe) => void;
  onCreateNew?: () => void;
}

export function RecipeLibrary({ onSelectRecipe, onCreateNew }: RecipeLibraryProps) {
  const { recipeLibrary = [] } = useAppStore() as any;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    (recipeLibrary || []).forEach((recipe: Recipe) => {
      (recipe.tags || []).forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [recipeLibrary]);

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    return (recipeLibrary || []).filter((recipe: Recipe) => {
      const matchesSearch =
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (recipe.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !selectedTag || (recipe.tags || []).includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [recipeLibrary, searchQuery, selectedTag]);

  if (!recipeLibrary || recipeLibrary.length === 0) {
    return (
      <div className="pb-20">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-8">
          <h1 className="text-3xl font-bold">Recipe Library</h1>
        </div>

        <div className="px-6 pt-6">
          <EmptyState
            title="No recipes yet"
            description="Create a recipe or save one from AI-generated matches"
            icon="📖"
          />

          {onCreateNew && (
            <button
              onClick={onCreateNew}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 mt-6"
            >
              <Plus size={20} />
              Create Recipe
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-8">
        <h1 className="text-3xl font-bold mb-4">Recipe Library</h1>

        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-white/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-white text-orange-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 pt-6">
        {filteredRecipes.length === 0 ? (
          <EmptyState
            title="No recipes found"
            description="Try adjusting your search or filters"
            icon="🔍"
          />
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecipes.map((recipe: Recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => onSelectRecipe?.(recipe)}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  {recipe.imageUrl && (
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.name}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{recipe.name}</h3>
                    {recipe.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {recipe.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>⏱️ {recipe.cookTime || '?'} min</span>
                      <span>🔥 {recipe.calories || '?'} cal</span>
                    </div>
                    {recipe.tags && recipe.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {recipe.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="w-full mt-8 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Create Recipe
          </button>
        )}
      </div>
    </div>
  );
}
