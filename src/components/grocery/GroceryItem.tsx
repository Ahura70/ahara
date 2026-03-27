import React, { useState } from 'react';
import { GroceryItem as GroceryItemType } from '../../types';
import { Trash2, Edit2, Check } from 'lucide-react';

interface GroceryItemProps {
  item: GroceryItemType;
  onToggle: () => void;
  onDelete: () => void;
  onEdit?: (item: GroceryItemType) => void;
}

export function GroceryItem({ item, onToggle, onDelete, onEdit }: GroceryItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAmount, setEditedAmount] = useState(item.amount.toString());
  const [editedUnit, setEditedUnit] = useState(item.unit);

  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit({
        ...item,
        amount: parseFloat(editedAmount) || item.amount,
        unit: editedUnit || item.unit,
      });
    }
    setIsEditing(false);
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
      item.checked ? 'bg-green-50' : 'bg-white hover:bg-gray-50'
    } border border-gray-200`}>
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={onToggle}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            item.checked
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 hover:border-green-500'
          }`}
        >
          {item.checked && <Check size={14} className="text-white" />}
        </button>
        <div className="flex-1">
          <h4 className={`font-medium transition-colors ${item.checked ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
            {item.name}
          </h4>
          <p className="text-xs text-gray-600 capitalize">{item.category}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              step="0.5"
              value={editedAmount}
              onChange={(e) => setEditedAmount(e.target.value)}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
            />
            <input
              type="text"
              value={editedUnit}
              onChange={(e) => setEditedUnit(e.target.value)}
              className="w-12 px-2 py-1 text-sm border border-gray-300 rounded"
              maxLength="10"
            />
            <button
              onClick={handleSaveEdit}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
            >
              <Check size={16} />
            </button>
          </div>
        ) : (
          <>
            <span className="text-sm text-gray-700 whitespace-nowrap">
              {item.amount} {item.unit}
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              <Edit2 size={16} />
            </button>
          </>
        )}
        <button
          onClick={onDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
