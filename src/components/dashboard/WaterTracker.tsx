import React from 'react';
import { WaterGlassTracker } from '../common/WaterGlassTracker';

interface WaterTrackerProps {
  current: number;
  goal: number;
  onChange: (index: number) => void;
}

export function WaterTracker({ current, goal, onChange }: WaterTrackerProps) {
  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Water Intake</h2>
      <WaterGlassTracker filled={current} goal={goal} onToggle={onChange} />
    </div>
  );
}
