/**
 * UI State Slice
 * Filters, search, calendar view, and UI visibility toggles
 */

import { useState, useCallback } from 'react';

export interface UIState {
  // Filters
  searchQuery: string;
  prepTimeFilter: number;
  cookTimeFilter: number;
  difficultyFilter: string[];

  // Calendar
  calendarView: 'week' | 'month' | 'year';

  // UI visibility
  showPreferencesPopup: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  setPrepTimeFilter: (time: number) => void;
  setCookTimeFilter: (time: number) => void;
  setDifficultyFilter: (difficulty: string[]) => void;
  setCalendarView: (view: 'week' | 'month' | 'year') => void;
  setShowPreferencesPopup: (show: boolean) => void;
}

export function useUIState(): UIState {
  const [searchQuery, setSearchQuery] = useState('');
  const [prepTimeFilter, setPrepTimeFilter] = useState(120);
  const [cookTimeFilter, setCookTimeFilter] = useState(120);
  const [difficultyFilter, setDifficultyFilter] = useState<string[]>([]);
  const [calendarView, setCalendarView] = useState<'week' | 'month' | 'year'>('week');
  const [showPreferencesPopup, setShowPreferencesPopup] = useState(false);

  return {
    searchQuery,
    prepTimeFilter,
    cookTimeFilter,
    difficultyFilter,
    calendarView,
    showPreferencesPopup,
    setSearchQuery: useCallback((query) => setSearchQuery(query), []),
    setPrepTimeFilter: useCallback((time) => setPrepTimeFilter(time), []),
    setCookTimeFilter: useCallback((time) => setCookTimeFilter(time), []),
    setDifficultyFilter: useCallback((difficulty) => setDifficultyFilter(difficulty), []),
    setCalendarView: useCallback((view) => setCalendarView(view), []),
    setShowPreferencesPopup: useCallback((show) => setShowPreferencesPopup(show), []),
  };
}
