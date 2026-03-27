import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store';
import { Plus, Trash2, Download } from 'lucide-react';
import { GroceryCategory } from './GroceryCategory';
import { GenerateListModal } from './GenerateListModal';
import { EmptyState } from '../common/EmptyState';
import { GroceryItem as GroceryItemType, GroceryCategory as GroceryCategoryType } from '../../types';

export function GroceryScreen() {
  const {
    groceryLists,
    activeGroceryListId,
    createGroceryList,
    weeklyPlan,
  } = useAppStore() as any;

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [editingListId, setEditingListId] = useState<string | null>(null);

  const activeList = groceryLists?.find((l: any) => l.id === activeGroceryListId);

  // Group items by category
  const itemsByCategory = useMemo(() => {
    const grouped: Record<GroceryCategoryType, GroceryItemType[]> = {
      produce: [],
      dairy: [],
      meat: [],
      seafood: [],
      pantry: [],
      frozen: [],
      bakery: [],
      beverages: [],
      other: [],
    };

    activeList?.items?.forEach((item: GroceryItemType) => {
      if (grouped[item.category]) {
        grouped[item.category].push(item);
      }
    });

    return grouped;
  }, [activeList]);

  const handleGenerateList = (startDate: string, endDate: string, listName: string) => {
    // Get all recipes in date range
    const recipesInRange = weeklyPlan
      ?.filter((d: any) => d.date >= startDate && d.date <= endDate)
      .flatMap((d: any) => d.recipes || []) || [];

    // Collect all ingredients
    const allIngredients: GroceryItemType[] = [];
    const seenIngredients = new Set<string>();

    recipesInRange.forEach((meal: any) => {
      meal.recipe?.ingredients?.forEach((ing: any) => {
        const key = `${ing.name.toLowerCase()}-${ing.unit}`;
        if (!seenIngredients.has(key)) {
          allIngredients.push({
            id: Math.random().toString(36).substring(7),
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            category: ing.category || 'other',
            checked: false,
            recipeIds: [meal.recipe.id],
            isManual: false,
          });
          seenIngredients.add(key);
        }
      });
    });

    createGroceryList(listName, allIngredients, { start: startDate, end: endDate });
    setShowGenerateModal(false);
  };

  if (!activeList) {
    return (
      <div className="pb-20">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-8">
          <h1 className="text-3xl font-bold">Shopping List</h1>
        </div>

        <div className="px-6 pt-6">
          <EmptyState
            title="No shopping list yet"
            description="Generate a list from your meal plan or create one manually"
            icon="🛒"
          />

          <button
            onClick={() => setShowGenerateModal(true)}
            className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 mt-6"
          >
            <Download size={20} />
            Generate from Plan
          </button>
        </div>

        <GenerateListModal
          isOpen={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
          onGenerate={handleGenerateList}
          weeklyPlan={weeklyPlan}
        />
      </div>
    );
  }

  const handleToggleItem = (itemId: string) => {
    const item = activeList.items.find((i: any) => i.id === itemId);
    if (item) {
      item.checked = !item.checked;
    }
  };

  const handleDeleteItem = (itemId: string) => {
    activeList.items = activeList.items.filter((i: any) => i.id !== itemId);
  };

  const handleEditItem = (updatedItem: GroceryItemType) => {
    const index = activeList.items.findIndex((i: any) => i.id === updatedItem.id);
    if (index !== -1) {
      activeList.items[index] = updatedItem;
    }
  };

  const checkedCount = activeList.items.filter((i: any) => i.checked).length;
  const totalCount = activeList.items.length;

  const categories: GroceryCategoryType[] = [
    'produce', 'dairy', 'meat', 'seafood', 'pantry', 'frozen', 'bakery', 'beverages', 'other'
  ];

  return (
    <div className="pb-20">
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-8">
        <h1 className="text-3xl font-bold mb-2">{activeList.name}</h1>
        <p className="text-green-100">
          {checkedCount} / {totalCount} items
        </p>
      </div>

      <div className="px-6 pt-6 space-y-4">
        {/* Progress bar */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${(checkedCount / totalCount) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2 text-center">
            {Math.round((checkedCount / totalCount) * 100)}% complete
          </p>
        </div>

        {/* Categories */}
        {categories.map((category) => (
          <GroceryCategory
            key={category}
            category={category}
            items={itemsByCategory[category]}
            onToggleItem={handleToggleItem}
            onDeleteItem={handleDeleteItem}
            onEditItem={handleEditItem}
          />
        ))}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Download size={20} />
            Update List
          </button>
          <button
            onClick={() => {
              activeList.items = activeList.items.filter((i: any) => !i.checked);
            }}
            className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 size={20} />
            Clear Checked
          </button>
        </div>
      </div>

      <GenerateListModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onGenerate={handleGenerateList}
        weeklyPlan={weeklyPlan}
      />
    </div>
  );
}
