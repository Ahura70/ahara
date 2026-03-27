import React from 'react';
import { MacroRing } from '../common/MacroRing';
import { Macros } from '../../types';

interface MacroSummaryProps {
  current: Macros;
  target: Macros;
}

export function MacroSummary({ current, target }: MacroSummaryProps) {
  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Macronutrients</h2>
      <div className="flex justify-around items-start gap-4">
        <MacroRing
          label="Protein"
          current={current.protein}
          target={target.protein}
          color="#3B82F6"
        />
        <MacroRing
          label="Carbs"
          current={current.carbs}
          target={target.carbs}
          color="#F97316"
        />
        <MacroRing
          label="Fats"
          current={current.fats}
          target={target.fats}
          color="#EF4444"
        />
      </div>
    </div>
  );
}
