import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Screen, UserPreferences, Recipe, DailyMenu, ShoppingListItem } from './types';
import { AuthUser, getCurrentUser, onAuthStateChange } from './lib/auth';
import {
  loadPreferences,
  savePreferences,
  loadWeeklyPlan,
  saveWeeklyPlan,
  listenToPreferences,
  listenToWeeklyPlan
} from './lib/persistence';

// Generate current week dates dynamically
function getCurrentWeekDates(): DailyMenu[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7)); // Shift to Monday

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return dayNames.map((name, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return { date: `${yyyy}-${mm}-${dd}`, dayName: name, recipes: [] };
  });
}

interface AppState {
  currentScreen: Screen;
  navigationHistory: string[];
  setCurrentScreen: (screen: Screen) => void;
  goBack: () => void;
  authUser: AuthUser | null;
  setAuthUser: (user: AuthUser | null) => void;
  preferences: UserPreferences;
  setPreferences: (prefs: UserPreferences) => void;
  generatedRecipes: Recipe[];
  setGeneratedRecipes: (recipes: Recipe[]) => void;
  updateGeneratedRecipeImage: (id: string, imageUrl: string) => void;
  weeklyPlan: DailyMenu[];
  addToWeeklyPlan: (recipe: Recipe, dayIndex: number, mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack') => void;
  removeFromWeeklyPlan: (dayIndex: number, mealIndex: number) => void;
  updateRecipeNotes: (dayIndex: number, mealIndex: number, notes: string) => void;
  rateRecipe: (dayIndex: number, mealIndex: number, rating: number) => void;
  moveRecipe: (sourceDayIndex: number, sourceMealIndex: number, destDayIndex: number, destMealIndex: number) => void;
  favorites: Recipe[];
  toggleFavorite: (recipe: Recipe) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  prepTimeFilter: number;
  setPrepTimeFilter: (time: number) => void;
  cookTimeFilter: number;
  setCookTimeFilter: (time: number) => void;
  difficultyFilter: string[];
  setDifficultyFilter: (difficulty: string[]) => void;
  calendarView: 'week' | 'month' | 'year';
  setCalendarView: (view: 'week' | 'month' | 'year') => void;
  shoppingList: ShoppingListItem[];
  setShoppingList: (list: ShoppingListItem[]) => void;
  toggleShoppingListItem: (name: string) => void;
  addShoppingListItem: (item: ShoppingListItem) => void;
  savedImages: string[];
  saveImage: (image: string) => void;
  showPreferencesPopup: boolean;
  setShowPreferencesPopup: (show: boolean) => void;
  hasCompletedSetup: boolean;
  setHasCompletedSetup: (v: boolean) => void;
}

const defaultPreferences: UserPreferences = {
  cuisines: ['Italian', 'Japanese'],
  maxPrepTime: 30,
  macros: {
    protein: 30,
    carbs: 40,
    fats: 15,
  },
  dietaryRestrictions: [],
};

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreenState] = useState<Screen>('login');
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [showPreferencesPopup, setShowPreferencesPopup] = useState(false);
  const [hasCompletedSetup, setHasCompletedSetup] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [unsubscribers, setUnsubscribers] = useState<Array<() => void>>([]);

  const setCurrentScreen = (screen: Screen) => {
    setNavigationHistory(prev => [...prev, currentScreen]);
    setCurrentScreenState(screen);
  };

  const goBack = () => {
    if (navigationHistory.length > 0) {
      const prevScreen = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prev => prev.slice(0, -1));
      setCurrentScreenState(prevScreen as Screen);
    }
  };

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('userPreferences');
      return saved ? JSON.parse(saved) : defaultPreferences;
    } catch {
      return defaultPreferences;
    }
  });

  // Initialize auth and setup persistence
  useEffect(() => {
    // Check if user is already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
      setAuthUser(currentUser);
    }

    // Listen to auth state changes
    const unsubAuth = onAuthStateChange((user) => {
      setAuthUser(user);
      if (user) {
        // User logged in - load data from Firebase
        loadUserDataFromFirebase(user.uid);
        // Navigate to camera screen if setup is complete
        if (hasCompletedSetup) {
          setCurrentScreenState('camera');
        }
      } else {
        // User logged out
        setCurrentScreenState('login');
      }
    });

    return () => {
      unsubAuth();
      // Cleanup other listeners on unmount
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  // Load user data from Firebase
  const loadUserDataFromFirebase = async (userId: string) => {
    try {
      const savedPrefs = await loadPreferences(userId);
      if (savedPrefs) {
        setPreferences(savedPrefs);
      }

      const savedPlan = await loadWeeklyPlan(userId);
      if (savedPlan) {
        setWeeklyPlan(savedPlan);
      }

      // Setup real-time listeners
      const unsubPrefs = listenToPreferences(userId, (prefs) => {
        if (prefs) {
          setPreferences(prefs);
        }
      });

      const unsubPlan = listenToWeeklyPlan(userId, (plan) => {
        if (plan) {
          setWeeklyPlan(plan);
        }
      });

      setUnsubscribers([unsubPrefs, unsubPlan]);
    } catch (error) {
      console.error('Error loading user data from Firebase:', error);
    }
  };

  // Save preferences to Firebase when they change
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));

    if (authUser && !authUser.isAnonymous) {
      savePreferences(authUser.uid, preferences).catch(error => {
        console.error('Error saving preferences to Firebase:', error);
      });
    }
  }, [preferences, authUser]);

  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [prepTimeFilter, setPrepTimeFilter] = useState(120);
  const [cookTimeFilter, setCookTimeFilter] = useState(120);
  const [difficultyFilter, setDifficultyFilter] = useState<string[]>([]);
  const [calendarView, setCalendarView] = useState<'week' | 'month' | 'year'>('week');
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [savedImages, setSavedImages] = useState<string[]>([]);

  const saveImage = (image: string) => {
    setSavedImages(prev => [...prev, image]);
  };

  const toggleFavorite = (recipe: Recipe) => {
    setFavorites(prev => {
      const isFav = prev.some(r => r.id === recipe.id);
      if (isFav) return prev.filter(r => r.id !== recipe.id);
      return [...prev, { ...recipe, isFavorite: true }];
    });
  };

  const toggleShoppingListItem = (name: string) => {
    setShoppingList(prev => prev.map(item => item.name === name ? { ...item, checked: !item.checked } : item));
  };

  const addShoppingListItem = (item: ShoppingListItem) => {
    setShoppingList(prev => [...prev, item]);
  };

  const updateGeneratedRecipeImage = (id: string, imageUrl: string) => {
    setGeneratedRecipes(prev => prev.map(r => r.id === id ? { ...r, imageUrl } : r));
  };

  // Initialize with current week dates (7 days, Mon-Sun)
  const [weeklyPlan, setWeeklyPlanState] = useState<DailyMenu[]>(getCurrentWeekDates);

  // Wrapper for setWeeklyPlan to also sync to Firebase
  const setWeeklyPlan = (updater: DailyMenu[] | ((prev: DailyMenu[]) => DailyMenu[])) => {
    setWeeklyPlanState((prev) => {
      const newPlan = typeof updater === 'function' ? updater(prev) : updater;

      // Sync to Firebase if user is authenticated
      if (authUser && !authUser.isAnonymous) {
        saveWeeklyPlan(authUser.uid, newPlan).catch(error => {
          console.error('Error saving weekly plan to Firebase:', error);
        });
      }

      return newPlan;
    });
  };

  // FIX: Immutable update — no shallow-copy mutation
  const addToWeeklyPlan = (recipe: Recipe, dayIndex: number, mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack') => {
    setWeeklyPlan(prev =>
      prev.map((day, i) =>
        i === dayIndex
          ? {
              ...day,
              recipes: [
                ...day.recipes,
                {
                  id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  mealType,
                  recipe,
                },
              ],
            }
          : day
      )
    );
  };

  const removeFromWeeklyPlan = (dayIndex: number, mealIndex: number) => {
    setWeeklyPlan(prev =>
      prev.map((day, i) =>
        i === dayIndex
          ? { ...day, recipes: day.recipes.filter((_, mi) => mi !== mealIndex) }
          : day
      )
    );
  };

  const moveRecipe = (sourceDayIndex: number, sourceMealIndex: number, destDayIndex: number, destMealIndex: number) => {
    setWeeklyPlan(prev => {
      const newPlan = prev.map(day => ({ ...day, recipes: [...day.recipes] }));
      const [movedItem] = newPlan[sourceDayIndex].recipes.splice(sourceMealIndex, 1);
      newPlan[destDayIndex].recipes.splice(destMealIndex, 0, movedItem);
      return newPlan;
    });
  };

  const updateRecipeNotes = (dayIndex: number, mealIndex: number, notes: string) => {
    setWeeklyPlan(prev =>
      prev.map((day, i) =>
        i === dayIndex
          ? {
              ...day,
              recipes: day.recipes.map((meal, mi) =>
                mi === mealIndex ? { ...meal, recipe: { ...meal.recipe, notes } } : meal
              ),
            }
          : day
      )
    );
  };

  const rateRecipe = (dayIndex: number, mealIndex: number, rating: number) => {
    setWeeklyPlan(prev =>
      prev.map((day, i) =>
        i === dayIndex
          ? {
              ...day,
              recipes: day.recipes.map((meal, mi) =>
                mi === mealIndex ? { ...meal, rating } : meal
              ),
            }
          : day
      )
    );
  };

  return (
    <AppContext.Provider value={{
      currentScreen,
      setCurrentScreen,
      goBack,
      navigationHistory,
      authUser,
      setAuthUser,
      preferences,
      setPreferences,
      generatedRecipes,
      setGeneratedRecipes,
      updateGeneratedRecipeImage,
      weeklyPlan,
      addToWeeklyPlan,
      removeFromWeeklyPlan,
      updateRecipeNotes,
      rateRecipe,
      moveRecipe,
      favorites,
      toggleFavorite,
      searchQuery,
      setSearchQuery,
      prepTimeFilter,
      setPrepTimeFilter,
      cookTimeFilter,
      setCookTimeFilter,
      difficultyFilter,
      setDifficultyFilter,
      calendarView,
      setCalendarView,
      shoppingList,
      setShoppingList,
      toggleShoppingListItem,
      addShoppingListItem,
      savedImages,
      saveImage,
      showPreferencesPopup,
      setShowPreferencesPopup,
      hasCompletedSetup,
      setHasCompletedSetup,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
