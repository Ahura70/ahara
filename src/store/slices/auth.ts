/**
 * Auth State Slice
 * Authentication user state and Firebase listener setup
 */

import { useState, useCallback, useEffect } from 'react';
import type { AuthUser } from '../../types';
import { onAuthStateChange } from '../../lib/auth';

export interface AuthState {
  authUser: AuthUser | null;
  setAuthUser: (user: AuthUser | null) => void;
  initializeAuthListener: (
    onUserLoaded: (user: AuthUser | null) => void
  ) => () => void;  // returns unsubscriber
}

export function useAuthState(): AuthState {
  const [authUser, setAuthUserState] = useState<AuthUser | null>(null);

  const setAuthUser = useCallback((user: AuthUser | null) => {
    setAuthUserState(user);
  }, []);

  const initializeAuthListener = useCallback(
    (onUserLoaded: (user: AuthUser | null) => void) => {
      // Set up Firebase auth state listener
      const unsubscriber = onAuthStateChange((user) => {
        setAuthUserState(user);
        onUserLoaded(user);
      });

      return unsubscriber;
    },
    []
  );

  return {
    authUser,
    setAuthUser,
    initializeAuthListener,
  };
}
