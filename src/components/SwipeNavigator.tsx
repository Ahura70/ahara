import React, { useRef, useEffect, useState } from 'react';
import { useAppStore } from '../store';

/**
 * SwipeNavigator enables horizontal swipe gestures to navigate between main app screens
 * Wraps the main content and detects left/right swipes
 */
export function SwipeNavigator({ children }: { children: React.ReactNode }) {
  const { currentScreen, setCurrentScreen } = useAppStore();
  const touchStartXRef = useRef<number>(0);
  const touchStartTimeRef = useRef<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Define the main navigation screens in order (left = previous, right = next)
  const mainScreens: typeof currentScreen[] = [
    'dashboard',
    'camera',
    'planner',
    'grocery',
    'preferences'
  ];

  const currentScreenIndex = mainScreens.indexOf(currentScreen as any);
  const isMainScreen = currentScreenIndex !== -1;

  // Screens where swiping should be disabled (modals, special flows)
  const noSwipeScreens = new Set([
    'login',
    'preferences', // Initial setup, no swiping
    'gallery',
    'recipe-library',
    'recipe-detail',
    'create-recipe',
    'meal-prep',
    'prep-session'
  ]);

  const shouldEnableSwipe = isMainScreen && !noSwipeScreens.has(currentScreen as any);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!shouldEnableSwipe) return;

    // Only track single touch
    if (e.touches.length !== 1) return;

    touchStartXRef.current = e.touches[0].clientX;
    touchStartTimeRef.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!shouldEnableSwipe || isProcessing) return;

    const touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchStartXRef.current - touchEndX;
    const swipeTime = Date.now() - touchStartTimeRef.current;

    // Minimum swipe distance (50px) and maximum time (1000ms)
    const minSwipeDistance = 50;
    const maxSwipeTime = 1000;

    if (Math.abs(swipeDistance) < minSwipeDistance || swipeTime > maxSwipeTime) {
      return; // Not a significant swipe
    }

    // Calculate swipe velocity
    const velocity = Math.abs(swipeDistance) / swipeTime;
    const minVelocity = 0.2; // pixels per ms

    if (velocity < minVelocity) {
      return; // Too slow
    }

    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 300);

    // Swipe left (negative distance) = go to next screen
    // Swipe right (positive distance) = go to previous screen
    if (swipeDistance > 0) {
      // Swipe right: go to previous screen
      if (currentScreenIndex > 0) {
        const prevScreen = mainScreens[currentScreenIndex - 1];
        console.log(`👈 Swiped right, navigating to ${prevScreen}`);
        setCurrentScreen(prevScreen);
      }
    } else {
      // Swipe left: go to next screen
      if (currentScreenIndex < mainScreens.length - 1) {
        const nextScreen = mainScreens[currentScreenIndex + 1];
        console.log(`👉 Swiped left, navigating to ${nextScreen}`);
        setCurrentScreen(nextScreen);
      }
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="w-full h-full"
    >
      {children}
    </div>
  );
}
