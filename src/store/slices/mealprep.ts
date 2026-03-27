/**
 * Meal Prep State Slice
 * NEW: Batch cooking sessions, prep timelines, step tracking
 */

import { useState, useCallback } from 'react';
import type { Recipe, PrepSession, PrepBatch, PrepTimeline } from '../../types';

export interface MealPrepState {
  // Active prep sessions
  prepSessions: PrepSession[];
  activePrepSessionId: string | null;

  // Actions
  createPrepSession: (
    name: string,
    recipes: Recipe[],
    servingsMap: Record<string, number>
  ) => PrepSession;
  deletePrepSession: (sessionId: string) => void;
  setActivePrepSession: (sessionId: string | null) => void;

  // Prep timeline generation (will call Gemini in Phase 5)
  generateTimeline: (sessionId: string) => void;

  // Execution tracking
  markStepCompleted: (sessionId: string, stepId: string) => void;
  markStepIncomplete: (sessionId: string, stepId: string) => void;
  updatePrepStatus: (sessionId: string, status: 'planning' | 'in-progress' | 'completed') => void;
}

export function useMealPrepState(): MealPrepState {
  const [prepSessions, setPrepSessionsState] = useState<PrepSession[]>([]);
  const [activePrepSessionId, setActivePrepSessionIdState] = useState<string | null>(null);

  const createPrepSession = useCallback(
    (name: string, recipes: Recipe[], servingsMap: Record<string, number>): PrepSession => {
      const sessionId = `prep-${Date.now()}`;

      // Convert recipes to batches with scaled ingredients
      const batches: PrepBatch[] = recipes.map((recipe) => {
        const servings = servingsMap[recipe.id] || recipe.servings;
        const scale = servings / recipe.servings;

        return {
          id: `batch-${recipe.id}`,
          recipe,
          scaledServings: servings,
          originalServings: recipe.servings,
          scaledIngredients: recipe.ingredients.map((ing) => ({
            ...ing,
            amount: ing.amount * scale,
          })),
        };
      });

      // Placeholder timeline — will be generated in Phase 5
      const timeline: PrepTimeline = {
        totalDuration: 0,
        steps: [],
      };

      const session: PrepSession = {
        id: sessionId,
        name,
        batches,
        timeline,
        createdAt: new Date().toISOString(),
        status: 'planning',
        completedSteps: new Set(),
      };

      setPrepSessionsState((prev) => [...prev, session]);
      setActivePrepSessionIdState(sessionId);

      return session;
    },
    []
  );

  const deletePrepSession = useCallback((sessionId: string) => {
    setPrepSessionsState((prev) => prev.filter((s) => s.id !== sessionId));
    if (activePrepSessionId === sessionId) {
      setActivePrepSessionIdState(null);
    }
  }, [activePrepSessionId]);

  const setActivePrepSession = useCallback((sessionId: string | null) => {
    setActivePrepSessionIdState(sessionId);
  }, []);

  const generateTimeline = useCallback((sessionId: string) => {
    // TODO: Phase 5 — call Gemini to generate optimized timeline
    console.log(`Generate timeline for session ${sessionId}`);
  }, []);

  const markStepCompleted = useCallback((sessionId: string, stepId: string) => {
    setPrepSessionsState((prev) =>
      prev.map((s) => {
        if (s.id === sessionId && s.completedSteps) {
          return {
            ...s,
            completedSteps: new Set([...s.completedSteps, stepId]),
          };
        }
        return s;
      })
    );
  }, []);

  const markStepIncomplete = useCallback((sessionId: string, stepId: string) => {
    setPrepSessionsState((prev) =>
      prev.map((s) => {
        if (s.id === sessionId && s.completedSteps) {
          const updated = new Set(s.completedSteps);
          updated.delete(stepId);
          return {
            ...s,
            completedSteps: updated,
          };
        }
        return s;
      })
    );
  }, []);

  const updatePrepStatus = useCallback(
    (sessionId: string, status: 'planning' | 'in-progress' | 'completed') => {
      setPrepSessionsState((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, status } : s))
      );
    },
    []
  );

  return {
    prepSessions,
    activePrepSessionId,
    createPrepSession,
    deletePrepSession,
    setActivePrepSession,
    generateTimeline,
    markStepCompleted,
    markStepIncomplete,
    updatePrepStatus,
  };
}
