import React from 'react';
import { NutritionBar } from '../common/NutritionBar';
import { Flame } from 'lucide-react';

interface CalorieBudgetProps {
  consumed: number;
  goal: number;
  remaining: number;
}

export function CalorieBudget({ consumed, goal, remaining }: CalorieBudgetProps) {
  const isOver = remaining < 0;
  const percentage = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Flame size={20} className="text-orange-500" />
        <h2 className="text-lg font-semibold text-gray-900">Today's Budget</h2>
      </div>

      {/* Large calorie display */}
      <div className="mb-6">
        <div className="text-5xl font-bold text-gray-900 mb-1">
          {Math.round(consumed)} <span className="text-2xl text-gray-600">/ {goal}</span>
        </div>
        <div className={`text-lg font-semibold ${isOver ? 'text-red-600' : 'text-green-600'}`}>
          {isOver ? 'Over by' : 'Remaining'}: {Math.abs(Math.round(remaining))} cal
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isOver ? 'bg-red-500' : percentage >= 90 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="mt-3 text-xs text-gray-600 text-center">
        {Math.round(percentage)}% of daily goal
      </div>
    </div>
  );
}
