import React, { useState } from 'react';
import { GroceryItem as GroceryItemType, GroceryCategory as GroceryCategoryType } from '../../types';
import { GroceryItem } from './GroceryItem';
import { ChevronDown } from 'lucide-react';

interface GroceryCategoryProps {
  category: GroceryCategoryType;
  items: GroceryItemType[];
  onToggleItem: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onEditItem: (item: GroceryItemType) => void;
}

const CATEGORY_LABELS: Record<GroceryCategoryType, string> = {
  produce: '🥕 Produce',
  dairy: '🧈 Dairy',
  meat: '🥩 Meat & Poultry',
  seafood: '🐟 Seafood',
  pantry: '🥫 Pantry',
  frozen: '🧊 Frozen',
  bakery: '🥐 Bakery',
  beverages: '🥤 Beverages',
  other: '📦 Other',
};

export function GroceryCategory({
  category,
  items,
  onToggleItem,
  onDeleteItem,
  onEditItem,
}: GroceryCategoryProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (items.length === 0) return null;

  const checkedCount = items.filter((item) => item.checked).length;

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-3">
          <ChevronDown
            size={20}
            className={`text-gray-600 transition-transform ${isOpen ? '' : '-rotate-90'}`}
          />
          <h3 className="font-semibold text-gray-900">{CATEGORY_LABELS[category]}</h3>
          <span className="text-sm text-gray-600">({checkedCount}/{items.length})</span>
        </div>
      </button>

      {isOpen && (
        <div className="mt-2 space-y-2">
          {items.map((item) => (
            <GroceryItem
              key={item.id}
              item={item}
              onToggle={() => onToggleItem(item.id)}
              onDelete={() => onDeleteItem(item.id)}
              onEdit={onEditItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}
