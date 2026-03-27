import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Screen, UserPreferences, Recipe, DailyMenu, ShoppingListItem } from './types';

interface AppState {
  navigationHistory: string[];
  setCurrentScreen: (screen: Screen) => void;
  goBack: () => void;
  preferences: UserPreferences;
  setPreferences: (prefs: UserPreferences) => void;
  generatedRecipes: Recipe[];
  setGeneratedRecipes: (recipes: Recipe[]) => void;
  updateGeneratedRecipeImage: (id: string, imageUrl: string) => void;
  weeklyPlan: DailyMenu[];
  addToWeeklyPlan: (recipe: Recipe, dayIndex: number, mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack') => void;
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
    const saved = localStorage.getItem('userPreferences');
    return saved ? JSON.parse(saved) : defaultPreferences;
  });

  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  }, [preferences]);

  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [prepTimeFilter, setPrepTimeFilter] = useState(120); // Default 2 hours
  const [cookTimeFilter, setCookTimeFilter] = useState(120); // Default 2 hours
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

  // Initialize with some dummy data for the planner to match the mockup
  const [weeklyPlan, setWeeklyPlan] = useState<DailyMenu[]>([
    { date: '2023-10-23', dayName: 'Monday', recipes: [] },
    { date: '2023-10-24', dayName: 'Tuesday', recipes: [] },
    { date: '2023-10-25', dayName: 'Wednesday', recipes: [] },
    { date: '2023-10-26', dayName: 'Thursday', recipes: [] },
    { date: '2023-10-27', dayName: 'Friday', recipes: [] }
  ]);

  const addToWeeklyPlan = (recipe: Recipe, dayIndex: number, mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack') => {
    setWeeklyPlan(prev => {
      const newPlan = [...prev];
      if (newPlan[dayIndex]) {
        newPlan[dayIndex].recipes.push({ 
          id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          mealType, 
          recipe 
        });
      }
      return newPlan;
    });
  };

  const moveRecipe = (sourceDayIndex: number, sourceMealIndex: number, destDayIndex: number, destMealIndex: number) => {
    setWeeklyPlan(prev => {
      const newPlan = [...prev];
      
      // Create copies of the days to avoid direct mutation
      const sourceDay = { ...newPlan[sourceDayIndex], recipes: [...newPlan[sourceDayIndex].recipes] };
      const destDay = sourceDayIndex === destDayIndex 
        ? sourceDay 
        : { ...newPlan[destDayIndex], recipes: [...newPlan[destDayIndex].recipes] };

      // Remove from source
      const [movedItem] = sourceDay.recipes.splice(sourceMealIndex, 1);
      
      // Insert into destination
      destDay.recipes.splice(destMealIndex, 0, movedItem);

      newPlan[sourceDayIndex] = sourceDay;
      newPlan[destDayIndex] = destDay;

      return newPlan;
    });
  };

  const updateRecipeNotes = (dayIndex: number, mealIndex: number, notes: string) => {
    setWeeklyPlan(prev => {
      const newPlan = [...prev];
      if (newPlan[dayIndex] && newPlan[dayIndex].recipes[mealIndex]) {
        newPlan[dayIndex].recipes[mealIndex].recipe.notes = notes;
      }
      return newPlan;
    });
  };

  const rateRecipe = (dayIndex: number, mealIndex: number, rating: number) => {
    setWeeklyPlan(prev => {
      const newPlan = [...prev];
      if (newPlan[dayIndex] && newPlan[dayIndex].recipes[mealIndex]) {
        newPlan[dayIndex].recipes[mealIndex].rating = rating;
      }
      return newPlan;
    });
  };

  return (
    <AppContext.Provider value={{
      currentScreen,
      setCurrentScreen,
      goBack,
      preferences,
      setPreferences,
      generatedRecipes,
      setGeneratedRecipes,
      updateGeneratedRecipeImage,
      weeklyPlan,
      addToWeeklyPlan,
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
      setShowPreferencesPopup
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
