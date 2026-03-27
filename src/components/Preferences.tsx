import { useState } from 'react';
import { useAppStore } from '../store';
import { motion } from 'motion/react';
import { ArrowLeft, Camera } from 'lucide-react';

const AVAILABLE_CUISINES = ['Italian', 'Japanese', 'Mexican', 'Thai', 'Mediterranean', 'Indian', 'American'];
const AVAILABLE_RESTRICTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Keto', 'Paleo'];

export function PreferencesScreen() {
  const { preferences, setPreferences, setCurrentScreen, weeklyPlan, showPreferencesPopup, setShowPreferencesPopup } = useAppStore();

  const [activeMacro, setActiveMacro] = useState<string | null>(null);

  const toggleCuisine = (cuisine: string) => {
    const current = preferences.cuisines;
    if (current.includes(cuisine)) {
      setPreferences({ ...preferences, cuisines: current.filter(c => c !== cuisine) });
    } else {
      setPreferences({ ...preferences, cuisines: [...current, cuisine] });
    }
  };

  const toggleRestriction = (restriction: string) => {
    const current = preferences.dietaryRestrictions || [];
    if (current.includes(restriction)) {
      setPreferences({ ...preferences, dietaryRestrictions: current.filter(r => r !== restriction) });
    } else {
      setPreferences({ ...preferences, dietaryRestrictions: [...current, restriction] });
    }
  };

  const handleSave = () => {
    setShowPreferencesPopup(false);
    setCurrentScreen('camera');
  };

  const handleBack = () => {
    // If they already have items in the planner, they likely came from the profile tab
    const hasItems = weeklyPlan?.some(day => day?.recipes?.length > 0) ?? false;
    if (hasItems) {
      setCurrentScreen('planner');
    } else {
      setCurrentScreen('login');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen pb-24 relative"
    >
      <header className="sticky top-0 z-50 px-6 py-6 flex items-center justify-between">
        <button 
          onClick={handleBack}
          className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-text-main hover:bg-white/70 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-heading font-semibold text-text-main">Dietary Preferences</h1>
        <div className="w-10"></div>
      </header>

      <main className="px-6 space-y-6 max-w-md mx-auto">
        {/* ... (rest of the content) ... */}
        {/* Cuisines */}
        <section className="glass-panel rounded-[24px] p-6">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-heading font-semibold">Cuisines</h2>
            <span className="text-xs font-medium text-text-muted">Select at least three</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {AVAILABLE_CUISINES.map((cuisine) => {
              const isSelected = preferences.cuisines.includes(cuisine);
              const index = preferences.cuisines.indexOf(cuisine);
              return (
                <button
                  key={cuisine}
                  onClick={() => toggleCuisine(cuisine)}
                  className={`relative px-4 py-2 rounded-full flex items-center gap-2 transition-all border ${
                    isSelected 
                      ? 'bg-scandi-blue/20 text-text-main border-scandi-blue/30' 
                      : 'bg-white/50 text-text-main hover:bg-white/80 border-transparent'
                  }`}
                >
                  <span className="text-sm font-medium">{cuisine}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Dietary Restrictions */}
        <section className="glass-panel rounded-[24px] p-6">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-heading font-semibold">Dietary Restrictions</h2>
            <span className="text-xs font-medium text-text-muted">Select all that apply</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {AVAILABLE_RESTRICTIONS.map((restriction) => {
              const isSelected = (preferences.dietaryRestrictions || []).includes(restriction);
              return (
                <button
                  key={restriction}
                  onClick={() => toggleRestriction(restriction)}
                  className={`relative px-4 py-2 rounded-full flex items-center gap-2 transition-all border ${
                    isSelected 
                      ? 'bg-scandi-blue/20 text-text-main border-scandi-blue/30' 
                      : 'bg-white/50 text-text-main hover:bg-white/80 border-transparent'
                  }`}
                >
                  <span className="text-sm font-medium">{restriction}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Prep Time */}
        <section className="glass-panel rounded-[24px] p-6">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-heading font-semibold">Max Prep Time</h2>
            <span className="text-sm font-semibold text-primary">{preferences.maxPrepTime} mins</span>
          </div>
          <div className="relative w-full px-2">
            <input 
              type="range" 
              min="10" max="60" step="5"
              value={preferences.maxPrepTime}
              onChange={(e) => setPreferences({...preferences, maxPrepTime: parseInt(e.target.value)})}
            />
            <div className="flex justify-between mt-2 text-xs font-medium text-text-muted">
              <span>10m</span>
              <span>60m</span>
            </div>
          </div>
        </section>

        {/* Macros */}
        <section className="glass-panel rounded-[24px] p-6">
          <div className="mb-4">
            <h2 className="text-xl font-heading font-semibold">Macro Goals</h2>
            <p className="text-xs font-medium text-text-muted mt-1">Per meal targets (grams)</p>
          </div>
          <div className="space-y-6">
            <motion.div 
              className={`space-y-3 p-4 rounded-2xl transition-all ${activeMacro === 'protein' ? 'bg-scandi-blue/10 border border-scandi-blue/20' : ''}`}
              animate={{ scale: activeMacro === 'protein' ? 1.02 : 1 }}
            >
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-text-main">Protein</label>
                <motion.span 
                  className="text-sm font-semibold text-primary"
                  key={preferences.macros.protein}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >{preferences.macros.protein}g</motion.span>
              </div>
              <input 
                type="range" min="0" max="100" step="5"
                value={preferences.macros.protein}
                onMouseDown={() => setActiveMacro('protein')}
                onMouseUp={() => setActiveMacro(null)}
                onTouchStart={() => setActiveMacro('protein')}
                onTouchEnd={() => setActiveMacro(null)}
                onChange={(e) => setPreferences({...preferences, macros: {...preferences.macros, protein: parseInt(e.target.value)}})}
              />
            </motion.div>
            
            <motion.div 
              className={`space-y-3 p-4 rounded-2xl transition-all ${activeMacro === 'carbs' ? 'bg-scandi-blue/10 border border-scandi-blue/20' : ''}`}
              animate={{ scale: activeMacro === 'carbs' ? 1.02 : 1 }}
            >
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-text-main">Carbs</label>
                <motion.span 
                  className="text-sm font-semibold text-primary"
                  key={preferences.macros.carbs}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >{preferences.macros.carbs}g</motion.span>
              </div>
              <input 
                type="range" min="0" max="100" step="5"
                value={preferences.macros.carbs}
                onMouseDown={() => setActiveMacro('carbs')}
                onMouseUp={() => setActiveMacro(null)}
                onTouchStart={() => setActiveMacro('carbs')}
                onTouchEnd={() => setActiveMacro(null)}
                onChange={(e) => setPreferences({...preferences, macros: {...preferences.macros, carbs: parseInt(e.target.value)}})}
              />
            </motion.div>

            <motion.div 
              className={`space-y-3 p-4 rounded-2xl transition-all ${activeMacro === 'fats' ? 'bg-scandi-blue/10 border border-scandi-blue/20' : ''}`}
              animate={{ scale: activeMacro === 'fats' ? 1.02 : 1 }}
            >
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-text-main">Fats</label>
                <motion.span 
                  className="text-sm font-semibold text-primary"
                  key={preferences.macros.fats}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >{preferences.macros.fats}g</motion.span>
              </div>
              <input 
                type="range" min="0" max="100" step="5"
                value={preferences.macros.fats}
                onMouseDown={() => setActiveMacro('fats')}
                onMouseUp={() => setActiveMacro(null)}
                onTouchStart={() => setActiveMacro('fats')}
                onTouchEnd={() => setActiveMacro(null)}
                onChange={(e) => setPreferences({...preferences, macros: {...preferences.macros, fats: parseInt(e.target.value)}})}
              />
            </motion.div>
          </div>
        </section>
      </main>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-background-light via-background-light/80 to-transparent pointer-events-none z-40">
        <button 
          onClick={() => setShowPreferencesPopup(true)}
          className="w-full max-w-md mx-auto h-14 bg-white text-text-main font-semibold text-[15px] uppercase tracking-[1.5px] rounded-full shadow-[0_8px_32px_rgba(143,169,177,0.15)] pointer-events-auto hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 active:scale-95"
        >
          Save Preferences
        </button>
      </div>
    </motion.div>
  );
}
