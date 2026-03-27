import React from 'react';
import { Droplets } from 'lucide-react';

interface WaterGlassTrackerProps {
  filled: number;
  goal: number;
  onToggle: (index: number) => void;
}

export function WaterGlassTracker({ filled, goal, onToggle }: WaterGlassTrackerProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Droplets size={18} className="text-cyan-500" />
        <span className="text-sm font-medium text-gray-700">
          {filled} / {goal} glasses
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: goal }).map((_, index) => (
          <button
            key={index}
            onClick={() => onToggle(index)}
            className={`aspect-square rounded-lg transition-all duration-200 flex items-center justify-center text-xl ${
              index < filled
                ? 'bg-cyan-500 text-white scale-100'
                : 'bg-gray-200 text-gray-400 scale-95 hover:scale-100'
            }`}
            title={`Glass ${index + 1}`}
          >
            🥤
          </button>
        ))}
      </div>
    </div>
  );
}
