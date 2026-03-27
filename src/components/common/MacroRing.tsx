import React from 'react';

interface MacroRingProps {
  label: string;
  current: number;
  target: number;
  color: string;
}

export function MacroRing({ label, current, target, color }: MacroRingProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle cx="60" cy="60" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-xl font-bold text-gray-900">{Math.round(percentage)}%</div>
          <div className="text-xs text-gray-600">{Math.round(current)}g / {target}g</div>
        </div>
      </div>
      <div className="text-sm font-medium text-gray-700">{label}</div>
    </div>
  );
}
