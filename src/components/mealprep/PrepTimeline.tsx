import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

interface PrepStep {
  batchId: string;
  recipeName: string;
  instruction: string;
  durationMinutes: number;
  isPassive: boolean;
  isCompleted?: boolean;
}

interface PrepTimelineProps {
  steps: PrepStep[];
  totalDuration: number;
  onStepComplete?: (stepIndex: number) => void;
}

export function PrepTimeline({ steps, totalDuration, onStepComplete }: PrepTimelineProps) {
  // Group steps by time
  const groupedSteps = steps.reduce(
    (acc, step, idx) => {
      const groupKey = step.isPassive ? 'passive' : 'active';
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push({ ...step, index: idx });
      return acc;
    },
    {} as Record<string, (PrepStep & { index: number })[]>
  );

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Prep Timeline</h2>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock size={18} />
          <span>Total: {totalDuration} minutes</span>
        </div>
      </div>

      {/* Active steps (sequential) */}
      {groupedSteps.active && groupedSteps.active.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Active Prep</h3>
          <div className="space-y-2">
            {groupedSteps.active.map((step) => (
              <div
                key={step.index}
                onClick={() => onStepComplete?.(step.index)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  step.isCompleted
                    ? 'bg-green-50 border-green-500'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {step.isCompleted ? (
                      <CheckCircle2 size={20} className="text-green-600" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{step.recipeName}</p>
                    <p className="text-sm text-gray-600">{step.instruction}</p>
                    <p className="text-xs text-gray-500 mt-1">⏱️ {step.durationMinutes} min</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Passive steps (can overlap) */}
      {groupedSteps.passive && groupedSteps.passive.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            ⏰ Can Do in Parallel
          </h3>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <p className="text-sm text-yellow-800 mb-2">
              These steps can happen at the same time:
            </p>
            <div className="space-y-2">
              {groupedSteps.passive.map((step) => (
                <div
                  key={step.index}
                  onClick={() => onStepComplete?.(step.index)}
                  className={`p-2 rounded text-sm cursor-pointer transition-all ${
                    step.isCompleted
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-900 hover:bg-yellow-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {step.isCompleted ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-yellow-600" />
                    )}
                    <span className="font-medium">{step.recipeName}</span>
                  </div>
                  <p className="text-xs mt-1">{step.instruction} ({step.durationMinutes}m)</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-600">
            {steps.filter((s) => s.isCompleted).length} / {steps.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{
              width: `${(steps.filter((s) => s.isCompleted).length / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
