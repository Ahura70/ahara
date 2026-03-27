/**
 * Meal prep domain types — batch cooking sessions, timelines
 */

import { Recipe, Ingredient } from './recipe';

/**
 * A recipe scaled for batch cooking
 */
export interface PrepBatch {
  id: string;
  recipe: Recipe;
  scaledServings: number;  // how many servings to batch
  originalServings: number;  // recipe's original servings
  scaledIngredients: Ingredient[];  // amounts multiplied by scale factor
}

/**
 * A single prep step with timing info
 */
export interface PrepStep {
  batchId: string;  // which batch this step belongs to
  stepIndex: number;  // order within recipe
  instruction: string;
  durationMinutes: number;  // how long this step takes
  isPassive: boolean;  // e.g., "bake for 30 min" — can overlap with other steps
  startTime?: number;  // minutes from start (filled by timeline generator)
  endTime?: number;  // minutes from start
}

/**
 * Optimized timeline for parallel prep
 */
export interface PrepTimeline {
  totalDuration: number;  // minutes
  steps: PrepStep[];  // ordered, with timing filled in
}

/**
 * A meal prep session (e.g., "Sunday Prep")
 */
export interface PrepSession {
  id: string;
  name: string;  // "Sunday Prep", "Batch Cook", etc.
  batches: PrepBatch[];  // recipes to cook + servings
  timeline: PrepTimeline;  // optimized prep schedule
  createdAt: string;  // ISO date
  status: 'planning' | 'in-progress' | 'completed';
  completedSteps?: Set<string>;  // step IDs marked as done
}
