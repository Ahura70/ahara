/**
 * Grocery State Slice
 * EXTENDED: Shopping lists with auto-generation from meal plan, ingredient dedup
 */

import { useState, useCallback } from 'react';
import type { GroceryItem, GroceryList } from '../../types';

export interface GroceryState {
  // Multiple grocery lists (user can save and reuse)
  groceryLists: GroceryList[];
  activeGroceryListId: string | null;

  // Actions
  createGroceryList: (name: string, items?: GroceryItem[]) => string;  // returns list ID
  deleteGroceryList: (listId: string) => void;
  addItemToList: (listId: string, item: GroceryItem) => void;
  removeItemFromList: (listId: string, itemId: string) => void;
  toggleItemChecked: (listId: string, itemId: string) => void;
  clearCheckedItems: (listId: string) => void;
  setActiveList: (listId: string | null) => void;

  // NEW: auto-generate list from meal plan
  generateGroceryFromPlan: (
    startDate: string,
    endDate: string,
    planMeals: any[]
  ) => GroceryList;

  // NEW: consolidate/merge duplicate ingredients
  mergeIngredients: (items: GroceryItem[]) => GroceryItem[];

  // Backward compat: flat shopping list (for now, backed by groceryLists[0])
  getShoppingList: () => GroceryItem[];
  setShoppingList: (items: GroceryItem[]) => void;
  addShoppingListItem: (item: GroceryItem) => void;
  toggleShoppingListItem: (itemId: string) => void;
}

export function useGroceryState(): GroceryState {
  const [groceryLists, setGroceryListsState] = useState<GroceryList[]>([]);
  const [activeGroceryListId, setActiveGroceryListIdState] = useState<string | null>(null);

  const createGroceryList = useCallback(
    (name: string, items: GroceryItem[] = []): string => {
      const listId = `list-${Date.now()}`;
      const newList: GroceryList = {
        id: listId,
        name,
        items,
        createdAt: new Date().toISOString(),
      };
      setGroceryListsState((prev) => [...prev, newList]);
      setActiveGroceryListIdState(listId);
      return listId;
    },
    []
  );

  const deleteGroceryList = useCallback((listId: string) => {
    setGroceryListsState((prev) => prev.filter((l) => l.id !== listId));
    if (activeGroceryListId === listId) {
      setActiveGroceryListIdState(null);
    }
  }, [activeGroceryListId]);

  const addItemToList = useCallback((listId: string, item: GroceryItem) => {
    setGroceryListsState((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              items: [...l.items, { ...item, id: item.id || `item-${Date.now()}` }],
              updatedAt: new Date().toISOString(),
            }
          : l
      )
    );
  }, []);

  const removeItemFromList = useCallback((listId: string, itemId: string) => {
    setGroceryListsState((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              items: l.items.filter((i) => i.id !== itemId),
              updatedAt: new Date().toISOString(),
            }
          : l
      )
    );
  }, []);

  const toggleItemChecked = useCallback((listId: string, itemId: string) => {
    setGroceryListsState((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              items: l.items.map((i) =>
                i.id === itemId ? { ...i, checked: !i.checked } : i
              ),
              updatedAt: new Date().toISOString(),
            }
          : l
      )
    );
  }, []);

  const clearCheckedItems = useCallback((listId: string) => {
    setGroceryListsState((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              items: l.items.filter((i) => !i.checked),
              updatedAt: new Date().toISOString(),
            }
          : l
      )
    );
  }, []);

  const setActiveList = useCallback((listId: string | null) => {
    setActiveGroceryListIdState(listId);
  }, []);

  const generateGroceryFromPlan = useCallback(
    (startDate: string, endDate: string, planMeals: any[]): GroceryList => {
      // TODO: Call Gemini to consolidate ingredients from planMeals
      // For now, create an empty list — Phase 3 will wire this up
      const listId = `plan-${startDate}-${endDate}`;
      const newList: GroceryList = {
        id: listId,
        name: `Shopping List: ${startDate} to ${endDate}`,
        items: [],
        createdAt: new Date().toISOString(),
        dateRange: { start: startDate, end: endDate },
      };
      setGroceryListsState((prev) => [...prev, newList]);
      return newList;
    },
    []
  );

  const mergeIngredients = useCallback((items: GroceryItem[]): GroceryItem[] => {
    // TODO: Smart merging with unit conversion (e.g., 2 cups + 1 cup = 3 cups)
    // For now, just return unique by name
    const seen = new Map<string, GroceryItem>();
    items.forEach((item) => {
      const key = `${item.name}-${item.unit}`;
      if (seen.has(key)) {
        const existing = seen.get(key)!;
        existing.amount += item.amount;
        if (item.recipeIds) {
          existing.recipeIds = [...new Set([...(existing.recipeIds || []), ...item.recipeIds])];
        }
      } else {
        seen.set(key, { ...item });
      }
    });
    return Array.from(seen.values());
  }, []);

  // Backward compat: treat first list as "the" shopping list
  const getShoppingList = useCallback((): GroceryItem[] => {
    const activeList = activeGroceryListId
      ? groceryLists.find((l) => l.id === activeGroceryListId)
      : groceryLists[0];
    return activeList?.items || [];
  }, [groceryLists, activeGroceryListId]);

  const setShoppingList = useCallback((items: GroceryItem[]) => {
    const listId = activeGroceryListId || groceryLists[0]?.id;
    if (listId) {
      setGroceryListsState((prev) =>
        prev.map((l) =>
          l.id === listId ? { ...l, items, updatedAt: new Date().toISOString() } : l
        )
      );
    }
  }, [activeGroceryListId, groceryLists]);

  const addShoppingListItem = useCallback(
    (item: GroceryItem) => {
      const listId = activeGroceryListId || groceryLists[0]?.id;
      if (listId) {
        addItemToList(listId, item);
      } else {
        // Create first list
        const newListId = createGroceryList('Shopping List', [item]);
        setActiveGroceryListIdState(newListId);
      }
    },
    [activeGroceryListId, groceryLists, addItemToList, createGroceryList]
  );

  const toggleShoppingListItem = useCallback(
    (itemId: string) => {
      const listId = activeGroceryListId || groceryLists[0]?.id;
      if (listId) {
        toggleItemChecked(listId, itemId);
      }
    },
    [activeGroceryListId, groceryLists, toggleItemChecked]
  );

  return {
    groceryLists,
    activeGroceryListId,
    createGroceryList,
    deleteGroceryList,
    addItemToList,
    removeItemFromList,
    toggleItemChecked,
    clearCheckedItems,
    setActiveList,
    generateGroceryFromPlan,
    mergeIngredients,
    getShoppingList,
    setShoppingList,
    addShoppingListItem,
    toggleShoppingListItem,
  };
}
