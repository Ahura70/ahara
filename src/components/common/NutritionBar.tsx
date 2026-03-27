import React from 'react';

interface NutritionBarProps {
  label: string;
  current: number;
  goal: number;
  remaining: number;
}

export function NutritionBar({ label, current, goal, remaining }: NutritionBarProps) {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const isOver = current > goal;
  const barColor = isOver ? 'bg-red-500' : percentage >= 90 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">
          {Math.round(current)} / {goal}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-gray-600">
          {isOver ? 'Over by' : 'Remaining'}
        </span>
        <span className={`text-xs font-semibold ${isOver ? 'text-red-600' : 'text-green-600'}`}>
          {Math.abs(Math.round(remaining))}
        </span>
      </div>
    </div>
  );
}
