# Phase 2 Readiness: Daily Nutrition Dashboard

**Status:** Foundation complete, ready to begin Phase 2 ✅

---

## What's Already Built (Foundation Layer)

### Types Ready
```typescript
// From src/types/nutrition (already defined)
interface NutritionGoals {
  dailyCalories: number;
  macroTargets: Macros;
  waterGoal: number;
}

interface QuickAdd {
  id: string;
  label: string;
  calories: number;
  macros: Partial<Macros>;
  mealType: MealType;
  loggedAt: string;
}

interface MealEntry extends existing recipe {
  logged?: boolean;
  loggedAt?: string;
  servingsConsumed?: number;
}
```

### Store Ready
```typescript
// From useNutritionState() slice
nutritionGoals: NutritionGoals  // state
setNutritionGoals(goals)         // setter
dailyLogs: Map<date, { water, quickAdds }>  // state
addQuickAdd(date, entry)         // add raw calorie entry
removeQuickAdd(date, entryId)    // remove raw entry
setWaterIntake(date, glasses)    // track water
getDailyTotals(date, dayPlan)    // sum macros + calories
getRemainingCalories(date, dayPlan)  // budget left
```

### All Planner Data Available
```typescript
// useAppStore() gives us:
weeklyPlan: DailyMenu[]  // all meals for the week
preferences: UserPreferences  // user's macro targets
// Each meal has: recipe, rating, (and will have) logged, servingsConsumed
```

---

## Components to Build in Phase 2

### 1. Update Preferences Screen
**File:** `src/components/Preferences.tsx` (existing, extend it)

**Add:**
- New section: "Nutrition Goals"
- Input: Daily calorie target (default: 2000)
- Inputs: Macro targets — Protein (g), Carbs (g), Fats (g)
- Input: Water goal (glasses/day)
- Save to store via `setNutritionGoals()`

**Effort:** ~30 min

---

### 2. Create Dashboard Screen
**File:** `src/components/dashboard/DashboardScreen.tsx` (NEW)

**Purpose:** MFP-style "Today" view — the app's home screen

**Sections (top to bottom):**
1. **Daily Summary Card**
   - Large calorie count (e.g., "1,480 / 2,000")
   - Remaining calories in color
   - Quick-add button ("Add food" or "+")

2. **Macro Progress Rings**
   - Three rings: Protein, Carbs, Fats
   - Each shows: current/target (e.g., "120g / 150g")
   - Color coded (blue, orange, red)

3. **Water Tracker**
   - Row of 8 glass icons
   - Click to toggle each glass
   - Shows: "6 / 8 glasses"

4. **Today's Meals**
   - Breakfast section (collapsible)
     - Card for each meal (if any)
     - Show: recipe name, calories, macros
     - Checkbox: "Logged" toggle
     - Edit button (servings consumed)
     - Delete button
   - Lunch, Dinner, Snack (same structure)

5. **Quick Entries** section
   - Raw calorie log entries
   - Delete button on each

6. **Add Meal** button
   - Opens modal to:
     - Select from today's plan
     - Or quick-add raw calories

---

### 3. Common Components (Shared UI)
**Files:** `src/components/common/*.tsx` (NEW)

Create these reusable pieces:

1. **MacroRing.tsx**
   - Circular progress indicator
   - Props: label, current, target, color
   - Shows percentage, grams, inside circle
   - Example: `<MacroRing label="Protein" current={120} target={150} color="#3B82F6" />`

2. **NutritionBar.tsx**
   - Horizontal progress bar for calories
   - Props: label, current, goal, remaining
   - Shows: 1,480 / 2,000 | Remaining: 520

3. **WaterGlassTracker.tsx**
   - Grid of 8 glass icons (clickable)
   - Props: filled (number), goal (number), onToggle (index)
   - Filled glasses are blue, empty are gray

4. **EmptyState.tsx** (if needed)
   - "No meals logged yet" illustration
   - "Start by adding food" prompt

---

### 4. Dashboard Subcomponents
**Files:** `src/components/dashboard/*.tsx` (NEW)

1. **CalorieBudget.tsx**
   - Props: remaining (number), goal (number), consumed (number)
   - Large display: "1,480 / 2,000"
   - Progress bar underneath
   - Color: green if under, yellow if near, red if over

2. **MacroSummary.tsx**
   - Props: logs (DailyNutritionLog), goals (NutritionGoals)
   - Three MacroRings side-by-side
   - Uses `<MacroRing>` component

3. **MealSlot.tsx**
   - Props: mealType ("Breakfast"), meals (MealEntry[])
   - Collapsible section
   - Lists each meal with calories/macros
   - Checkboxes for logged
   - Delete buttons

4. **QuickAddModal.tsx**
   - Props: isOpen (bool), onClose (fn), onAdd (fn)
   - Inputs: name, calories, protein (g), carbs (g), fats (g)
   - Submit button
   - Uses store `addQuickAdd()` action

5. **WaterTracker.tsx**
   - Props: current (number), goal (number), onChange (fn)
   - Uses `<WaterGlassTracker>` component

---

## Integration Points

### Navigation
1. **Update BottomNav.tsx:**
   - Change tabs: `Capture | Scan | Plan | Grocery | Profile`
   - Add 'dashboard' screen
   - Default screen after login: 'dashboard' (not 'camera')

2. **Update Screen type (already done in types/index.ts):**
   ```typescript
   export type Screen = 'login' | ... | 'dashboard' | 'grocery' | ...
   ```

3. **Update App.tsx:**
   ```tsx
   {currentScreen === 'dashboard' && <DashboardScreen key="dashboard" />}
   ```

### State Wiring
```typescript
const {
  preferences,
  weeklyPlan,
  nutritionGoals,
  setNutritionGoals,
  addQuickAdd,
  removeQuickAdd,
  setWaterIntake,
  getDailyTotals,
  getRemainingCalories,
  logMeal,
  unlogMeal,
} = useAppStore();
```

### Today's Date
```typescript
const today = new Date().toISOString().split('T')[0];  // 'YYYY-MM-DD'
const todayMenu = weeklyPlan.find(d => d.date === today);
```

---

## Effort Estimate

| Component | LOC | Time |
|-----------|-----|------|
| Preferences ext. | 80 | 30 min |
| DashboardScreen | 200 | 1 hr |
| MacroRing | 60 | 20 min |
| NutritionBar | 50 | 15 min |
| WaterGlassTracker | 70 | 25 min |
| CalorieBudget | 60 | 20 min |
| MacroSummary | 60 | 20 min |
| MealSlot | 120 | 40 min |
| QuickAddModal | 140 | 45 min |
| WaterTracker | 60 | 20 min |
| BottomNav update | 20 | 10 min |
| App.tsx update | 10 | 5 min |
| **Total** | **~930** | **~5 hours** |

---

## Testing Checklist (Post-Phase 2)

- [ ] Dashboard shows today's date
- [ ] Calorie budget calculated correctly: `goal - (logged meals + quick adds)`
- [ ] Macro rings show correct percentages
- [ ] Quick-add modal submits and appears on dashboard
- [ ] Water glass tracker toggles and persists
- [ ] Logging a meal updates totals
- [ ] Removing a meal recalculates totals
- [ ] Serving size multiplier works (e.g., 0.5 × recipe = half the macros)
- [ ] All old features (camera, matches, planner, gallery) still work
- [ ] Preferences save nutrition goals to Firebase
- [ ] On reload, nutrition goals restored

---

## Notes for Phase 2 Dev

### Derived State Hook (Optional but helpful)
Consider creating `src/hooks/useNutritionProgress.ts`:
```typescript
export function useNutritionProgress(date: string) {
  const { getNutritionTotals, getRemainingCalories, weeklyPlan, nutritionGoals } = useAppStore();
  const todayMenu = weeklyPlan.find(d => d.date === date);

  const totals = getNutritionTotals(date, todayMenu);
  const remaining = getRemainingCalories(date, todayMenu);
  const progress = {
    calories: { consumed: totals.calories, goal: nutritionGoals.dailyCalories, remaining },
    protein: { consumed: totals.macros.protein, goal: nutritionGoals.macroTargets.protein },
    carbs: { consumed: totals.macros.carbs, goal: nutritionGoals.macroTargets.carbs },
    fats: { consumed: totals.macros.fats, goal: nutritionGoals.macroTargets.fats },
    water: { consumed: todayMenu?.waterGlasses || 0, goal: nutritionGoals.waterGoal },
  };

  return progress;
}
```

This simplifies dashboard component code.

### Colors (Tailwind)
```
Protein (Blue):   bg-blue-500, text-blue-600
Carbs (Orange):   bg-orange-500, text-orange-600
Fats (Red):       bg-red-500, text-red-600
Water (Cyan):     bg-cyan-500, text-cyan-600
Goal Met (Green): text-green-600
Over (Red):       text-red-600
```

### Icons (lucide-react already installed)
```typescript
import { Flame, TrendingDown, Droplets, Plus, Trash2, Check } from 'lucide-react';
// Flame: calories
// TrendingDown: budget remaining
// Droplets: water
// Plus: add food
// Trash2: delete
// Check: logged checkbox
```

---

## Go/No-Go Criteria

✅ **Phase 2 is go-ahead if:**
- [ ] All existing tests pass (if you have them)
- [ ] App builds with no errors
- [ ] All 4 existing tabs work unchanged (Camera, Planner, Gallery, Preferences)
- [ ] Commit 565aa7e is verified on main branch

✅ **All of the above are satisfied. Phase 2 ready to start.**

---

**Next: Implement Phase 2 Dashboard (5 hours of development)**
