# Āhāra — MyFitnessPal-Style Architecture Plan

## 1. Gap Analysis: What Exists vs What's Needed

### Already Built
- Weekly meal planner with drag-and-drop
- Recipe discovery via Gemini (image → recipes)
- Favorites (toggle on/off)
- Shopping list with categories + manual add
- Cook mode with ingredient checklist
- Calendar views (week/month/year)
- Firebase auth + real-time sync
- Rating system (1-5 stars)

### Missing for MFP Parity
| Feature | Gap |
|---------|-----|
| **Daily nutrition dashboard** | No calorie/macro budget, no progress bars, no "remaining" calc |
| **Nutrition logging** | Meals are *planned* but never *logged as eaten* |
| **Grocery consolidation** | Shopping list exists but isn't auto-generated from plan; no duplicate merging |
| **Recipe library** | Favorites exist as flat array; no categories, no search, no custom recipes |
| **Meal prep mode** | No batch scaling, no prep timeline, no batch-cook grouping |
| **Barcode scanning** | No packaged food lookup at all |
| **Quick-add** | Can't log raw calories/macros without a full recipe |
| **Water/hydration** | Not tracked |
| **Streaks & history** | No logging history, no consistency tracking |

---

## 2. Proposed Folder Structure

```
src/
├── types/                          # ← NEW: split types.ts into domain modules
│   ├── index.ts                    # Re-exports everything
│   ├── recipe.ts                   # Recipe, Ingredient, Macros
│   ├── planner.ts                  # DailyMenu, MealEntry, NutritionLog
│   ├── grocery.ts                  # GroceryList, GroceryItem, GroceryAisle
│   ├── user.ts                     # UserPreferences, NutritionGoals, AuthUser
│   └── mealprep.ts                 # PrepSession, PrepBatch, PrepTimeline
│
├── store/                          # ← NEW: split monolithic store.tsx
│   ├── index.tsx                   # AppProvider + useAppStore (unchanged API)
│   ├── slices/
│   │   ├── auth.ts                 # Auth state + Firebase listener
│   │   ├── navigation.ts           # Screen, history, goBack
│   │   ├── recipes.ts              # generatedRecipes, favorites, recipeLibrary
│   │   ├── planner.ts              # weeklyPlan, addToWeeklyPlan, moveRecipe
│   │   ├── nutrition.ts            # ← NEW: daily logs, goals, progress
│   │   ├── grocery.ts              # shoppingList + auto-generation
│   │   ├── mealprep.ts             # ← NEW: prep sessions, batch state
│   │   └── ui.ts                   # filters, search, calendar view, popups
│   └── persistence.ts              # Firebase sync wiring (extracted from store)
│
├── components/
│   ├── common/                     # ← NEW: shared UI primitives
│   │   ├── MacroRing.tsx           # Circular progress for a single macro
│   │   ├── NutritionBar.tsx        # Horizontal calorie progress bar
│   │   ├── EmptyState.tsx          # Reusable empty-state illustration
│   │   ├── BottomSheet.tsx         # Reusable bottom sheet (for quick-add, etc.)
│   │   └── ConfirmDialog.tsx       # Reusable confirmation modal
│   │
│   ├── dashboard/                  # ← NEW: daily nutrition dashboard
│   │   ├── DashboardScreen.tsx     # Main "Today" view
│   │   ├── CalorieBudget.tsx       # Remaining cals = goal - food + exercise
│   │   ├── MacroSummary.tsx        # Three MacroRings for P/C/F
│   │   ├── MealSlot.tsx            # Breakfast/Lunch/Dinner/Snack row
│   │   ├── QuickAddModal.tsx       # Log raw cals/macros without recipe
│   │   └── WaterTracker.tsx        # Glasses/ml counter
│   │
│   ├── planner/                    # ← NEW subfolder (refactor from Planner.tsx)
│   │   ├── PlannerScreen.tsx       # Weekly overview (existing, refactored)
│   │   ├── CalendarView.tsx        # Existing calendar (moved here)
│   │   ├── DayDetail.tsx           # Expanded single-day view
│   │   └── MealCard.tsx            # Extracted reusable meal card
│   │
│   ├── grocery/                    # ← NEW subfolder
│   │   ├── GroceryScreen.tsx       # Full grocery list view
│   │   ├── GroceryCategory.tsx     # Collapsible aisle group
│   │   ├── GroceryItem.tsx         # Single item with check/edit/delete
│   │   └── GenerateListModal.tsx   # "Generate from plan" date-range picker
│   │
│   ├── recipes/                    # ← NEW subfolder (refactor from Matches.tsx)
│   │   ├── MatchesScreen.tsx       # Existing AI matches (moved here)
│   │   ├── RecipeLibrary.tsx       # Saved/favorite recipes browsable
│   │   ├── RecipeDetail.tsx        # Full recipe view (extracted from Matches)
│   │   ├── CreateRecipe.tsx        # Manual recipe entry form
│   │   └── CookMode.tsx            # Cook mode (extracted from Matches)
│   │
│   ├── mealprep/                   # ← NEW
│   │   ├── MealPrepScreen.tsx      # Select recipes → generate prep plan
│   │   ├── PrepTimeline.tsx        # Gantt-style parallel prep view
│   │   ├── BatchScaler.tsx         # Adjust servings for batch cooking
│   │   └── PrepChecklist.tsx       # Step-by-step batch execution
│   │
│   ├── BottomNav.tsx               # Updated: 5 tabs instead of 4
│   ├── LoginScreen.tsx             # Unchanged
│   ├── Camera.tsx                  # Unchanged
│   ├── QuickScanFAB.tsx            # Unchanged
│   └── ... (other existing)
│
├── lib/
│   ├── gemini.ts                   # Existing (add grocery consolidation prompt)
│   ├── auth.ts                     # Existing
│   ├── persistence.ts              # Existing (extend for new collections)
│   ├── nutrition.ts                # ← NEW: calorie/macro math helpers
│   ├── grocery-utils.ts            # ← NEW: ingredient dedup, unit conversion
│   └── barcode.ts                  # ← NEW: barcode scan + Open Food Facts API
│
├── hooks/                          # ← NEW: custom hooks
│   ├── useNutritionProgress.ts     # Derives daily totals from logged meals
│   ├── useGroceryFromPlan.ts       # Generates consolidated grocery list
│   └── useMealPrepPlan.ts          # Generates prep timeline from selected recipes
│
└── config/
    └── firebase.ts                 # Existing
```

---

## 3. Type Definitions (New & Extended)

### 3a. Extended Recipe Types (`types/recipe.ts`)

```typescript
// Existing — no changes
export interface Macros { protein: number; carbs: number; fats: number }
export interface Ingredient { name: string; amount: number; unit: string }

// NEW: Normalized ingredient for grocery merging
export interface NormalizedIngredient extends Ingredient {
  category: GroceryCategory;
  recipeIds: string[];        // which recipes need this
}

// EXTENDED: Recipe gets optional source tracking
export interface Recipe {
  // ... all existing fields ...
  source?: 'generated' | 'manual' | 'imported' | 'barcode';
  createdAt?: string;         // ISO date — for library sorting
  tags?: string[];            // user-defined tags for organization
}
```

### 3b. New Nutrition Types (`types/planner.ts`)

```typescript
export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

// EXTENDED: MealEntry replaces the inline recipes[] shape in DailyMenu
export interface MealEntry {
  id: string;
  mealType: MealType;
  recipe: Recipe;
  rating?: number;
  logged?: boolean;           // NEW: was this actually eaten?
  loggedAt?: string;          // NEW: when the user confirmed eating it
  servingsConsumed?: number;  // NEW: might eat 0.5 or 2 servings
}

// EXTENDED: DailyMenu gets nutrition summary + water
export interface DailyMenu {
  date: string;
  dayName: string;
  recipes: MealEntry[];
  waterGlasses?: number;      // NEW: hydration tracking
  quickAdds?: QuickAdd[];     // NEW: raw calorie/macro entries
}

// NEW: Log raw calories without a recipe
export interface QuickAdd {
  id: string;
  label: string;              // "Protein shake", "Snack bar"
  calories: number;
  macros: Partial<Macros>;
  mealType: MealType;
  loggedAt: string;
}
```

### 3c. Nutrition Goals (`types/user.ts`)

```typescript
// EXTENDED: UserPreferences gets daily nutrition targets
export interface NutritionGoals {
  dailyCalories: number;      // e.g., 2000
  macroTargets: Macros;       // grams — replaces percentage-based
  waterGoal: number;          // glasses per day
}

export interface UserPreferences {
  // ... all existing fields ...
  nutritionGoals?: NutritionGoals;  // NEW
}
```

### 3d. Grocery Types (`types/grocery.ts`)

```typescript
export type GroceryCategory =
  | 'produce' | 'dairy' | 'meat' | 'seafood'
  | 'pantry' | 'frozen' | 'bakery' | 'beverages' | 'other';

// EXTENDED: richer item with source tracking
export interface GroceryItem {
  id: string;                 // NEW: stable ID for reorder/edit
  name: string;
  amount: number;
  unit: string;
  category: GroceryCategory;
  checked: boolean;
  recipeIds?: string[];       // NEW: which recipes need this ingredient
  isManual?: boolean;         // NEW: user-added vs auto-generated
}

// NEW: a saved grocery list with metadata
export interface GroceryList {
  id: string;
  name: string;               // "Week of Mar 28" or custom name
  items: GroceryItem[];
  createdAt: string;
  dateRange?: { start: string; end: string };  // plan dates it covers
}
```

### 3e. Meal Prep Types (`types/mealprep.ts`)

```typescript
export interface PrepBatch {
  id: string;
  recipe: Recipe;
  scaledServings: number;     // how many servings to batch
  originalServings: number;
  scaledIngredients: Ingredient[];  // amounts multiplied
}

export interface PrepStep {
  batchId: string;
  stepIndex: number;
  instruction: string;
  durationMinutes: number;
  isPassive: boolean;         // e.g., "bake for 30 min" — can overlap
}

export interface PrepTimeline {
  totalDuration: number;      // minutes
  steps: PrepStep[];          // ordered, with parallel passive steps noted
}

export interface PrepSession {
  id: string;
  name: string;               // "Sunday Prep"
  batches: PrepBatch[];
  timeline: PrepTimeline;
  createdAt: string;
  status: 'planning' | 'in-progress' | 'completed';
}
```

---

## 4. Store Extensions

The current store is a single `AppProvider` with ~25 `useState` calls. The plan is to **keep the Context API** (not migrate to Zustand yet — that's a separate refactor) but organize the state into logical slice files that each export a custom hook returning their state + actions. The main `AppProvider` composes them.

### 4a. New Slice: `store/slices/nutrition.ts`

```typescript
// State
dailyLogs: Map<string, { meals: MealEntry[], quickAdds: QuickAdd[], water: number }>
nutritionGoals: NutritionGoals

// Actions
logMeal(date: string, entryId: string, servings?: number): void
unlogMeal(date: string, entryId: string): void
addQuickAdd(date: string, entry: QuickAdd): void
removeQuickAdd(date: string, entryId: string): void
setWaterIntake(date: string, glasses: number): void
setNutritionGoals(goals: NutritionGoals): void

// Derived (via useNutritionProgress hook)
getDailyTotals(date: string): { calories: number, macros: Macros, water: number }
getRemainingCalories(date: string): number
getMacroProgress(date: string): { protein: %, carbs: %, fats: % }
```

### 4b. New Slice: `store/slices/grocery.ts` (extends existing)

```typescript
// State (replaces flat shoppingList)
groceryLists: GroceryList[]
activeGroceryListId: string | null

// Actions (extends existing)
generateGroceryFromPlan(startDate: string, endDate: string): void  // auto-populate
mergeIngredients(items: GroceryItem[]): GroceryItem[]              // dedup logic
addManualItem(listId: string, item: GroceryItem): void
toggleItem(listId: string, itemId: string): void
removeItem(listId: string, itemId: string): void
clearChecked(listId: string): void
```

### 4c. New Slice: `store/slices/mealprep.ts`

```typescript
// State
prepSessions: PrepSession[]
activePrepSessionId: string | null

// Actions
createPrepSession(name: string, recipes: Recipe[], servingsMap: Record<string, number>): PrepSession
generateTimeline(sessionId: string): PrepTimeline    // calls Gemini for optimization
updatePrepStatus(sessionId: string, status: string): void
deletePrepSession(sessionId: string): void
```

### 4d. Extended: `store/slices/recipes.ts`

```typescript
// State (extends existing)
generatedRecipes: Recipe[]        // existing — transient AI results
recipeLibrary: Recipe[]           // NEW — persisted saved recipes
favorites: Recipe[]               // existing

// Actions
saveToLibrary(recipe: Recipe): void
removeFromLibrary(recipeId: string): void
createManualRecipe(recipe: Omit<Recipe, 'id'>): Recipe
importFromBarcode(barcode: string): Promise<Recipe>   // calls barcode.ts
searchLibrary(query: string, filters?: object): Recipe[]
```

---

## 5. Navigation Changes

### Current Tabs (4)
```
Capture | Plan | Gallery | Profile
```

### Proposed Tabs (5)
```
Today | Scan | Plan | Grocery | Profile
```

**Rationale:**
- **Today** (new) = daily nutrition dashboard — this is the MFP home screen
- **Scan** = existing camera (renamed from "Capture")
- **Plan** = existing planner (unchanged)
- **Grocery** (new) = replaces Gallery (gallery moves into Profile as a subsection)
- **Profile** = existing preferences + gallery + recipe library subsections

### Screen Type Update
```typescript
export type Screen =
  | 'login'
  | 'preferences'
  | 'camera'
  | 'matches'
  | 'planner'
  | 'gallery'
  // NEW screens:
  | 'dashboard'        // Today tab — nutrition dashboard
  | 'grocery'          // Grocery tab — shopping lists
  | 'recipe-library'   // Profile subsection — saved recipes
  | 'recipe-detail'    // Full recipe view
  | 'create-recipe'    // Manual recipe entry
  | 'meal-prep'        // Meal prep planning
  | 'prep-session';    // Active prep execution
```

### BottomNav Update
```typescript
const items = [
  { id: 'dashboard',    label: 'Today',   Icon: BarChart3 },
  { id: 'camera',       label: 'Scan',    Icon: Camera },
  { id: 'planner',      label: 'Plan',    Icon: Calendar },
  { id: 'grocery',      label: 'Grocery', Icon: ShoppingCart },
  { id: 'preferences',  label: 'Profile', Icon: User },
] as const;
```

---

## 6. New Dependencies

| Package | Purpose | Size |
|---------|---------|------|
| `quagga2` | Client-side barcode scanning from camera | ~45 KB |
| *None others required* | — | — |

**Why so few?** The existing stack covers most needs:
- `@hello-pangea/dnd` — already installed for drag-drop
- `date-fns` — already installed for date math
- `motion` — already installed for animations
- `lucide-react` — already installed for icons
- Gemini API — already integrated for AI features

**Barcode data source:** Open Food Facts API (free, no key required) for nutritional data lookup. This is a `fetch` call — no SDK needed.

**[Inference]** quagga2 is the most commonly recommended client-side barcode library for React as of early 2025. Verify it's still actively maintained before installing.

---

## 7. Firebase Persistence Extensions

### New Collections in Realtime Database
```
users/{uid}/
  ├── preferences/        # existing
  ├── weeklyPlan/         # existing
  ├── nutritionLogs/      # NEW: { [date]: { meals, quickAdds, water } }
  ├── recipeLibrary/      # NEW: saved recipes
  ├── groceryLists/       # NEW: shopping lists with metadata
  └── prepSessions/       # NEW: meal prep sessions
```

### New Listener Functions in `lib/persistence.ts`
```typescript
export function listenToNutritionLogs(userId: string, cb: (logs: any) => void): () => void
export function listenToRecipeLibrary(userId: string, cb: (recipes: Recipe[]) => void): () => void
export function listenToGroceryLists(userId: string, cb: (lists: GroceryList[]) => void): () => void
export function listenToPrepSessions(userId: string, cb: (sessions: PrepSession[]) => void): () => void
```

---

## 8. New Gemini Prompts Needed

| Function | Purpose | Input | Output |
|----------|---------|-------|--------|
| `generatePrepTimeline` | Optimize parallel cooking steps for batch prep | PrepBatch[] | PrepTimeline |
| `consolidateGroceryList` | Smart ingredient merging (e.g., "2 cups flour" + "1 cup flour" → "3 cups flour") | Ingredient[][] | NormalizedIngredient[] |
| `categorizeFoodItem` | Assign grocery aisle category to an ingredient name | string | GroceryCategory |

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Types + Store Refactor)
**Effort: ~2 hours**

1. Create `src/types/` folder, split `types.ts` into domain modules
2. Add new types (NutritionGoals, QuickAdd, MealEntry extensions, GroceryList, PrepSession)
3. Create `src/store/slices/` folder structure
4. Extract existing store logic into slices (no behavior change — pure refactor)
5. Wire slices back into AppProvider with identical public API
6. **Verify:** app builds, all existing features work identically

### Phase 2: Daily Nutrition Dashboard
**Effort: ~3 hours**

1. Add `NutritionGoals` to UserPreferences + Preferences UI
2. Create `store/slices/nutrition.ts` (dailyLogs, quickAdds, water)
3. Create `useNutritionProgress` hook (derives totals from plan + logs)
4. Build `DashboardScreen.tsx` with CalorieBudget, MacroSummary, MealSlots
5. Build `QuickAddModal.tsx` for raw calorie logging
6. Build `WaterTracker.tsx`
7. Update BottomNav to 5 tabs, add 'dashboard' screen to App.tsx
8. Add Firebase persistence for nutritionLogs
9. **Verify:** dashboard shows correct remaining calories after logging

### Phase 3: Grocery Consolidation
**Effort: ~2 hours**

1. Create `lib/grocery-utils.ts` (unit conversion, ingredient dedup)
2. Extend store grocery slice with `generateGroceryFromPlan`
3. Build `GroceryScreen.tsx`, `GroceryCategory.tsx`, `GroceryItem.tsx`
4. Build `GenerateListModal.tsx` (date-range picker → auto-populate)
5. Add Gemini prompt for smart ingredient categorization
6. Update BottomNav to point to grocery screen
7. Move Gallery into Profile as a subsection
8. Add Firebase persistence for groceryLists
9. **Verify:** selecting a week generates a merged, categorized list

### Phase 4: Recipe Library
**Effort: ~2 hours**

1. Extend store recipes slice with `recipeLibrary`, `saveToLibrary`, `searchLibrary`
2. Extract `RecipeDetail.tsx` from Matches.tsx (the full recipe view)
3. Extract `CookMode.tsx` from Matches.tsx
4. Build `RecipeLibrary.tsx` (grid/list view, search, tag filter)
5. Build `CreateRecipe.tsx` (manual entry form)
6. Add "Save to Library" button in Matches cards
7. Add Firebase persistence for recipeLibrary
8. **Verify:** can save generated recipe, find it in library, open detail view

### Phase 5: Meal Prep Mode
**Effort: ~3 hours**

1. Create `store/slices/mealprep.ts`
2. Create `lib/gemini.ts` → `generatePrepTimeline` function
3. Build `MealPrepScreen.tsx` (select recipes, set servings)
4. Build `BatchScaler.tsx` (adjust servings with ingredient recalc)
5. Build `PrepTimeline.tsx` (visual timeline with parallel steps)
6. Build `PrepChecklist.tsx` (execution mode with step completion)
7. Add entry point from Planner ("Prep these meals" button)
8. Add Firebase persistence for prepSessions
9. **Verify:** can select 3 recipes, scale to 4 servings each, get a timeline

### Phase 6: Barcode Scanning
**Effort: ~2 hours**

1. Install `quagga2`
2. Create `lib/barcode.ts` (camera → barcode → Open Food Facts API → Recipe)
3. Add barcode scan button to Camera screen
4. Build barcode result card (show nutrition, add to log or library)
5. **Verify:** scan a barcode, see nutrition data, log it

### Phase 7: Polish & History
**Effort: ~2 hours**

1. Add streak tracking (consecutive days with logged meals)
2. Add nutrition history chart (weekly/monthly calorie trend)
3. Add "Recents" section to dashboard (last 10 logged items)
4. Performance: lazy-load dashboard charts
5. Final testing pass across all features

---

## 10. Key Architectural Decisions

### Why keep Context API (not migrate to Zustand)?
The current store works. A Zustand migration is a full-session refactor with no user-visible benefit. The slice pattern above gives us the same organization benefits. Zustand migration can happen later as a dedicated tech-debt task.

### Why 5 tabs instead of 4?
MFP's core loop is: **see today's budget → log food → plan ahead → shop**. The "Today" dashboard is the gravitational center of the app. Gallery is low-frequency and fits better as a Profile subsection.

### Why extract CookMode and RecipeDetail from Matches.tsx?
Matches.tsx is currently ~500+ lines with multiple modals inlined. Extracting these into standalone components enables reuse from the Recipe Library and Planner, not just from the AI matches carousel.

### Why Open Food Facts for barcodes (not a paid API)?
It's free, has 3M+ products, no API key required, and covers the 80% case for packaged foods. If coverage is insufficient later, swapping to a paid provider (Nutritionix, FatSecret) is a single-file change in `lib/barcode.ts`.

---

## 11. Files Modified (Summary)

### New Files (21)
```
src/types/{index,recipe,planner,grocery,user,mealprep}.ts
src/store/{index,persistence}.tsx
src/store/slices/{auth,navigation,recipes,planner,nutrition,grocery,mealprep,ui}.ts
src/hooks/{useNutritionProgress,useGroceryFromPlan,useMealPrepPlan}.ts
src/lib/{nutrition,grocery-utils,barcode}.ts
src/components/common/{MacroRing,NutritionBar,EmptyState,BottomSheet,ConfirmDialog}.tsx
src/components/dashboard/{DashboardScreen,CalorieBudget,MacroSummary,MealSlot,QuickAddModal,WaterTracker}.tsx
src/components/grocery/{GroceryScreen,GroceryCategory,GroceryItem,GenerateListModal}.tsx
src/components/recipes/{RecipeLibrary,RecipeDetail,CreateRecipe,CookMode}.tsx
src/components/mealprep/{MealPrepScreen,PrepTimeline,BatchScaler,PrepChecklist}.tsx
src/components/planner/{DayDetail,MealCard}.tsx
```

### Modified Files (7)
```
src/types.ts              → deprecated, re-exports from types/index.ts
src/store.tsx             → deprecated, re-exports from store/index.tsx
src/App.tsx               → add new screen routes
src/components/BottomNav.tsx → 5 tabs
src/components/Matches.tsx   → extract RecipeDetail + CookMode
src/components/Planner.tsx   → move to planner/ subfolder, add prep entry point
src/lib/gemini.ts            → add grocery + prep timeline prompts
```

---

## 12. Risk Notes

- **Store refactor (Phase 1)** is the riskiest step — it touches everything. Do it first, verify the app still works identically, then layer features on top.
- **Barcode scanning (Phase 6)** depends on camera permissions already working (they do for the existing scan flow) and Open Food Facts having the scanned product. Build a graceful "product not found" path.
- **Gemini prep timeline (Phase 5)** is speculative — the quality of the generated timeline depends on prompt engineering. Budget time for iteration.
