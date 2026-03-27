import React from 'react';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

interface PrepStep {
  id: string;
  recipeName: string;
  instruction: string;
  durationMinutes: number;
  isPassive: boolean;
  isCompleted: boolean;
}

interface PrepChecklistProps {
  sessionName: string;
  steps: PrepStep[];
  onStepToggle: (stepId: string) => void;
  onBack: () => void;
  onComplete?: () => void;
}

export function PrepChecklist({
  sessionName,
  steps,
  onStepToggle,
  onBack,
  onComplete,
}: PrepChecklistProps) {
  const completedCount = steps.filter((s) => s.isCompleted).length;
  const isAllComplete = completedCount === steps.length;

  // Separate active and passive steps
  const activeSteps = steps.filter((s) => !s.isPassive);
  const passiveSteps = steps.filter((s) => s.isPassive);

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-8">
        <button onClick={onBack} className="mb-4 hover:opacity-80 transition-opacity">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold mb-2">{sessionName}</h1>
        <p className="text-purple-100">
          {completedCount} / {steps.length} steps complete
        </p>
      </div>

      <div className="px-6 pt-6 space-y-6">
        {/* Progress */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            {Math.round((completedCount / steps.length) * 100)}% complete
          </p>
        </div>

        {/* Active Steps */}
        {activeSteps.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Active Prep</h2>
            <div className="space-y-2">
              {activeSteps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => onStepToggle(step.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    step.isCompleted
                      ? 'bg-green-50 border-green-500'
                      : 'bg-gray-50 border-gray-300 hover:border-purple-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {step.isCompleted ? (
                        <CheckCircle2 size={24} className="text-green-600" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold text-lg ${step.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {step.recipeName}
                      </p>
                      <p className={`text-sm ${step.isCompleted ? 'text-gray-500' : 'text-gray-600'}`}>
                        {step.instruction}
                      </p>
                      <p className={`text-xs mt-2 ${step.isCompleted ? 'text-gray-400' : 'text-gray-500'}`}>
                        ⏱️ {step.durationMinutes} minutes
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Passive Steps */}
        {passiveSteps.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={20} className="text-yellow-600" />
              <h2 className="text-lg font-semibold text-gray-900">Can Happen in Parallel</h2>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <div className="space-y-2">
                {passiveSteps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => onStepToggle(step.id)}
                    className={`w-full p-3 rounded text-left transition-all ${
                      step.isCompleted
                        ? 'bg-green-100 opacity-60'
                        : 'bg-yellow-100 hover:bg-yellow-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {step.isCompleted ? (
                          <CheckCircle2 size={20} className="text-green-600" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-yellow-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${step.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {step.recipeName}
                        </p>
                        <p className="text-xs text-gray-600">{step.instruction}</p>
                      </div>
                      <span className="text-xs text-gray-600 flex-shrink-0">{step.durationMinutes}m</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Completion message */}
        {isAllComplete && (
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold text-green-900 mb-2">🎉 Great Job!</h3>
            <p className="text-green-800 mb-4">All prep steps completed. Your meals are ready!</p>
            {onComplete && (
              <button
                onClick={onComplete}
                className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                Mark Session Complete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sticky back button */}
      {!isAllComplete && (
        <div className="fixed bottom-6 left-6 right-6 flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
