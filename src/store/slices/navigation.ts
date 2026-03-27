/**
 * Navigation State Slice
 * Current screen, history, and navigation actions
 */

import { useState, useCallback } from 'react';
import type { Screen } from '../../types';

export interface NavigationState {
  currentScreen: Screen;
  navigationHistory: string[];
  hasCompletedSetup: boolean;

  setCurrentScreen: (screen: Screen) => void;
  goBack: () => void;
  setHasCompletedSetup: (v: boolean) => void;
}

export function useNavigationState(): NavigationState {
  const [currentScreen, setCurrentScreenState] = useState<Screen>('login');
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [hasCompletedSetup, setHasCompletedSetup] = useState(false);

  const setCurrentScreen = useCallback((screen: Screen) => {
    setNavigationHistory((prev) => [...prev, currentScreen]);
    setCurrentScreenState(screen);
  }, [currentScreen]);

  const goBack = useCallback(() => {
    setNavigationHistory((prev) => {
      if (prev.length > 0) {
        const prevScreen = prev[prev.length - 1];
        setCurrentScreenState(prevScreen as Screen);
        return prev.slice(0, -1);
      }
      return prev;
    });
  }, []);

  return {
    currentScreen,
    navigationHistory,
    hasCompletedSetup,
    setCurrentScreen,
    goBack,
    setHasCompletedSetup: useCallback((v) => setHasCompletedSetup(v), []),
  };
}
