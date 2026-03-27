# Āhāra — MyFitnessPal Architecture Guide

This document is your guide to the app's architecture and development roadmap.

---

## 📚 Key Documents

**Read in this order:**

1. **[ARCHITECTURE_PLAN.md](./ARCHITECTURE_PLAN.md)** — The 7-phase strategic plan
   - Gap analysis (what Āhāra has vs. MFP)
   - Folder structure proposal
   - Type definitions for all features
   - Store architecture
   - 7-phase roadmap with effort estimates
   - **Duration:** 20 min read (reference document)

2. **[PHASE_1_SUMMARY.md](./PHASE_1_SUMMARY.md)** — What's been completed
   - Type system refactored into 6 domain modules
   - Store refactored into 8 composable slices
   - All changes maintain backward compatibility
   - Build verified, no broken components
   - **Duration:** 10 min read (now that Phase 1 is done)

3. **[PHASE_2_READINESS.md](./PHASE_2_READINESS.md)** — Ready to build the nutrition dashboard
   - What's already built (foundation)
   - Components to create in Phase 2
   - Integration points
   - Testing checklist
   - Effort estimate: ~5 hours
   - **Duration:** 10 min read (before starting Phase 2)

---

## 🏗️ Project Structure

### Type System
```
src/types/
├── index.ts          # Re-exports (backward compat)
├── recipe.ts         # Recipes, ingredients, macros
├── planner.ts        # Meals, nutrition logs, quick-adds
├── grocery.ts        # Grocery lists and items
├── user.ts           # User preferences, nutrition goals
└── mealprep.ts       # Batch cooking sessions
```

### Store (State Management)
```
src/store/
├── index.tsx         # AppProvider (composes slices)
└── slices/
    ├── auth.ts       # Firebase auth
    ├── navigation.ts # Screen routing
    ├── recipes.ts    # Generated, favorites, library
    ├── planner.ts    # Weekly meals
    ├── nutrition.ts  # Daily logs, goals ← NEW
    ├── grocery.ts    # Shopping lists ← EXTENDED
    ├── mealprep.ts   # Batch prep ← NEW
    └── ui.ts         # Filters, search, calendar view
```

### Components
```
src/components/
├── common/           # Shared UI primitives (Phase 2+)
│   ├── MacroRing.tsx
│   ├── NutritionBar.tsx
│   ├── WaterGlassTracker.tsx
│   └── ...
├── dashboard/        # Nutrition dashboard (Phase 2)
│   ├── DashboardScreen.tsx
│   ├── CalorieBudget.tsx
│   ├── MacroSummary.tsx
│   ├── QuickAddModal.tsx
│   └── ...
├── planner/          # Meal planning (reorganize Phase 2)
│   ├── PlannerScreen.tsx
│   ├── CalendarView.tsx
│   └── ...
├── grocery/          # Shopping lists (Phase 3)
│   ├── GroceryScreen.tsx
│   ├── GroceryCategory.tsx
│   └── ...
├── recipes/          # Recipe library (Phase 4)
│   ├── RecipeLibrary.tsx
│   ├── RecipeDetail.tsx
│   ├── CookMode.tsx
│   └── ...
├── mealprep/         # Batch cooking (Phase 5)
│   ├── MealPrepScreen.tsx
│   ├── PrepTimeline.tsx
│   ├── BatchScaler.tsx
│   └── ...
├── BottomNav.tsx     # Navigation (6 tabs, Phase 2+)
├── LoginScreen.tsx   # Auth (unchanged)
├── Camera.tsx        # Ingredient scan (unchanged)
├── Preferences.tsx   # Settings (Phase 2: extend)
├── Matches.tsx       # Recipe discovery (unchanged)
└── ... (others)
```

---

## 🔄 Development Flow

### Phase 1: ✅ DONE
**Foundation: Types & Store Architecture**
- Refactored types into domain modules
- Refactored store into 8 slices
- **Status:** Build verified, pushed to main
- **Commit:** `565aa7e`

### Phase 2: 📋 NEXT
**Daily Nutrition Dashboard**
- Build "Today" screen with calorie budget, macro rings, water tracker
- Add quick-add (raw calorie logging)
- Update BottomNav to 5 tabs
- **Duration:** ~5 hours
- **Files to create:** 10 components + 1 hook
- **Documentation:** PHASE_2_READINESS.md ← Start here

### Phase 3: 🔮 PLANNED
**Grocery Consolidation**
- Auto-generate shopping list from meal plan
- Ingredient dedup with unit conversion (Gemini-powered)
- Browse by category (produce, dairy, pantry, etc.)
- **Duration:** ~3 hours

### Phase 4: 🔮 PLANNED
**Recipe Library**
- Save generated recipes for later
- Manual recipe entry form
- Search and filter library
- **Duration:** ~2 hours

### Phase 5: 🔮 PLANNED
**Meal Prep Planning**
- Select recipes and servings for batch cooking
- Gemini generates optimized prep timeline
- Visual timeline showing parallel steps
- Execution checklist
- **Duration:** ~3 hours

### Phase 6: 🔮 PLANNED
**Barcode Scanning**
- Scan packaged food barcodes
- Fetch nutrition from Open Food Facts API
- Log directly or save to library
- **Duration:** ~2 hours

### Phase 7: 🔮 PLANNED
**Polish & History**
- Streak tracking (consecutive logged days)
- Weekly/monthly calorie trend charts
- Recents section
- Performance optimization
- **Duration:** ~2 hours

---

## ✅ Verification Checklist

**Before starting Phase 2:**

- [ ] Read PHASE_1_SUMMARY.md
- [ ] Read PHASE_2_READINESS.md
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors: `npm run build`
- [ ] App runs locally: `npm run dev`
- [ ] All 4 original tabs work:
  - [ ] Camera scan works
  - [ ] Matches carousel works
  - [ ] Planner drag-drop works
  - [ ] Gallery shows images
  - [ ] Preferences saves
- [ ] Latest commit: `565aa7e` on main branch

---

## 🎯 Key Architectural Decisions

### Why slice-based store (not Zustand)?
Context API + slices provides the same organization benefits as Zustand with zero new dependencies. A Zustand migration can happen later as a standalone refactor.

### Why 5 tabs instead of 4?
MFP's core is: "see today's budget → log food → plan → shop". The "Today" dashboard is the gravitational center. Gallery is low-frequency (moves to Profile).

### Why extract CookMode from Matches.tsx?
Future code reuses it from Recipe Library and Planner. Single-responsibility, testable component.

### Why Open Food Facts (not paid barcode API)?
Free, 3M+ products, no API key required. Swappable later if coverage is insufficient.

---

## 📖 Using the Store

### Backward Compatible Imports
```typescript
// These still work (they re-export from src/store/index.tsx)
import { useAppStore } from './store';
const { currentScreen, addToWeeklyPlan } = useAppStore();
```

### New Code Targets Domain Modules
```typescript
// Phase 2+: can import specific types
import type { NutritionGoals, QuickAdd } from './types';
```

### Example: Using Nutrition Store
```typescript
export function MyDashboard() {
  const {
    nutritionGoals,
    weeklyPlan,
    getDailyTotals,
    getRemainingCalories,
    addQuickAdd,
  } = useAppStore();

  const today = new Date().toISOString().split('T')[0];
  const todayMenu = weeklyPlan.find(d => d.date === today);
  const totals = getDailyTotals(today, todayMenu);
  const remaining = getRemainingCalories(today, todayMenu);

  return (
    <div>
      <h1>Calories: {totals.calories} / {nutritionGoals.dailyCalories}</h1>
      <p>Remaining: {remaining}</p>
    </div>
  );
}
```

---

## 🚀 Getting Started with Phase 2

**Step 1:** Read [PHASE_2_READINESS.md](./PHASE_2_READINESS.md)

**Step 2:** Create folder structure:
```bash
mkdir -p src/components/{dashboard,common}
```

**Step 3:** Follow the component checklist in PHASE_2_READINESS.md

**Step 4:** Wire into App.tsx:
```tsx
import { DashboardScreen } from './components/dashboard/DashboardScreen';

{currentScreen === 'dashboard' && <DashboardScreen key="dashboard" />}
```

**Step 5:** Update BottomNav to add 'dashboard' tab

**Step 6:** Test end-to-end (login → dashboard → nutrition tracking)

---

## 📊 Effort Summary

| Phase | Feature | Duration | Status |
|-------|---------|----------|--------|
| 1 | Foundation (types + store) | 3 hours | ✅ Done |
| 2 | Nutrition dashboard | 5 hours | 📋 Next |
| 3 | Grocery consolidation | 3 hours | 🔮 Planned |
| 4 | Recipe library | 2 hours | 🔮 Planned |
| 5 | Meal prep planning | 3 hours | 🔮 Planned |
| 6 | Barcode scanning | 2 hours | 🔮 Planned |
| 7 | Polish & history | 2 hours | 🔮 Planned |
| **Total** | **MFP parity** | **~20 hours** | **~1.5 weeks** |

---

## 🔗 Related Files

- `ARCHITECTURE_PLAN.md` — Strategic design document (reference)
- `PHASE_1_SUMMARY.md` — Completion summary
- `PHASE_2_READINESS.md` — Phase 2 development guide ← **Start here for Phase 2**
- `package.json` — Dependencies
- `vite.config.ts` — Build config
- `tailwind.config.js` — Styling

---

## 💬 Questions?

Refer to the phase-specific documents:
- **"How is the app structured?"** → ARCHITECTURE_PLAN.md
- **"What's been done?"** → PHASE_1_SUMMARY.md
- **"How do I start Phase 2?"** → PHASE_2_READINESS.md
- **"How do I use the store?"** → Check this file's "Using the Store" section

---

**Last Updated:** 2026-03-28
**Phase 1 Status:** ✅ Complete
**Next Phase:** Phase 2 (Nutrition Dashboard)
