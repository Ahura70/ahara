/**
 * Grocery shopping domain types — shopping lists, items, categories
 */

import { GroceryCategory } from './recipe';

/**
 * A single grocery item
 * EXTENDED: richer item with source tracking and stable IDs
 */
export interface GroceryItem {
  id: string;  // NEW: stable ID for reorder/edit operations
  name: string;
  amount: number;
  unit: string;  // 'grams', 'ml', 'cups', 'pieces', etc.
  category: GroceryCategory;
  checked: boolean;  // marked as purchased?
  recipeIds?: string[];  // NEW: which recipes need this ingredient
  isManual?: boolean;  // NEW: user-added vs auto-generated from plan
}

/**
 * A saved grocery list with metadata
 * Allows users to save and reuse lists, track multiple lists
 */
export interface GroceryList {
  id: string;
  name: string;  // "Week of Mar 28", custom name, etc.
  items: GroceryItem[];
  createdAt: string;  // ISO date
  updatedAt?: string;  // ISO date
  dateRange?: {
    start: string;  // 'YYYY-MM-DD'
    end: string;    // 'YYYY-MM-DD'
  };  // NEW: plan dates this list covers
}
