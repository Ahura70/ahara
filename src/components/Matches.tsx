import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Clock, Flame, Bookmark, Plus, X, Image as ImageIcon, Loader2, Play, Users, Check, Share2, ExternalLink, Filter } from 'lucide-react';
import { generateRecipeImage, getIngredientSubstitutions } from '../lib/gemini';
import { VoiceAssistant } from './VoiceAssistant';
import { Breadcrumb } from './Breadcrumb';

export function MatchesScreen() {
  const { generatedRecipes, setCurrentScreen, addToWeeklyPlan, weeklyPlan, updateGeneratedRecipeImage, searchQuery, setSearchQuery, prepTimeFilter, setPrepTimeFilter, cookTimeFilter, setCookTimeFilter, difficultyFilter, setDifficultyFilter, favorites, toggleFavorite, preferences, hasCompletedSetup, setHasCompletedSetup } = useAppStore();
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mealType, setMealType] = useState('Dinner');
  const [dayIndex, setDayIndex] = useState(0);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState<string | 'All'>('All');
  const [generatingImages, setGeneratingImages] = useState<Record<string, boolean>>({});
  const [cookModeRecipe, setCookModeRecipe] = useState<any>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [substitution, setSubstitution] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const requestedImagesRef = useRef<Set<string>>(new Set());

  const cuisines = Array.from(new Set(generatedRecipes.map(r => r.cuisineType).filter(Boolean)));

  const filteredRecipes = generatedRecipes.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = selectedCuisine === 'All' || r.cuisineType === selectedCuisine;
    const matchesTime = (r.prepTime + (r.cookTime || 0)) <= prepTimeFilter;
    const matchesCookTime = (r.cookTime || 0) <= cookTimeFilter;
    const matchesDifficulty = (difficultyFilter?.length ?? 0) === 0 || (r.difficulty && difficultyFilter?.includes(r.difficulty));
    return matchesSearch && matchesCuisine && matchesTime && matchesCookTime && matchesDifficulty;
  });

  const handleShare = (recipe: any) => {
    const text = `Check out this recipe: ${recipe.title}\n\nIngredients:\n${recipe.ingredients.map((i: any) => `- ${i.amount} ${i.unit} ${i.name}`).join('\n')}\n\nInstructions:\n${recipe.instructions.join('\n')}`;
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: text,
      }).catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Recipe copied to clipboard!');
    }
  };

  const handleSubstitution = async (ingredient: any) => {
    setSubstitution("Loading...");
    try {
      const subs = await getIngredientSubstitutions(ingredient, cookModeRecipe, preferences.dietaryRestrictions);
      if (subs.length > 0) {
        setSubstitution(`${subs[0].ingredient} (${subs[0].quantity}) - ${subs[0].rationale}`);
      } else {
        setSubstitution("No substitution found.");
      }
    } catch (error) {
      setSubstitution("Could not find a substitution.");
    }
  };

  useEffect(() => {
    setCompletedSteps(new Set());
    setCheckedIngredients(new Set());
  }, [cookModeRecipe]);

  useEffect(() => {
    generatedRecipes.forEach(recipe => {
      if (!recipe.imageUrl.startsWith('data:') && !requestedImagesRef.current.has(recipe.id)) {
        requestedImagesRef.current.add(recipe.id);
        handleGenerateImage(recipe);
      }
    });
  }, [generatedRecipes]);

  const handleGenerateImage = async (recipe: any) => {
    setGeneratingImages(prev => ({ ...prev, [recipe.id]: true }));
    try {
      const dataUrl = await generateRecipeImage(recipe.imageUrl);
      updateGeneratedRecipeImage(recipe.id, dataUrl);
    } catch (error) {
      console.error("Failed to generate image", error);
    } finally {
      setGeneratingImages(prev => ({ ...prev, [recipe.id]: false }));
    }
  };

  const handleAddToMenuClick = (recipe: any) => {
    setSelectedRecipe(recipe);
    setIsAddModalOpen(true);
    setShowDuplicateWarning(false);
  };

  const handleConfirmAdd = () => {
    // Prevent double submission
    if (!selectedRecipe || isSubmitting) return;

    // Capture current state values immediately to prevent race conditions
    const capturedDayIndex = dayIndex;
    const capturedMealType = mealType;
    const capturedRecipe = selectedRecipe;

    // Check for duplicates
    const existingDay = weeklyPlan[capturedDayIndex];
    if (existingDay && !showDuplicateWarning) {
      const exists = existingDay.recipes.some(
        m => m.mealType === capturedMealType && m.recipe.title === capturedRecipe.title
      );

      if (exists) {
        setShowDuplicateWarning(true);
        return;
      }
    }

    // Set submitting flag to prevent double submission
    setIsSubmitting(true);

    try {
      // Add recipe with captured values (store now uses immutable update)
      addToWeeklyPlan(capturedRecipe, capturedDayIndex, capturedMealType as any);

      // Reset modal state
      setIsAddModalOpen(false);
      setSelectedRecipe(null);
      setShowDuplicateWarning(false);
      setMealType('Dinner');
      setDayIndex(0);

      // Mark setup as complete and navigate to planner
      if (!hasCompletedSetup) {
        setHasCompletedSetup(true);
      }
      setCurrentScreen('planner');
    } catch (error) {
      console.error('Error adding recipe to weekly plan:', error);
      alert('Failed to add recipe. Please try again.');
    } finally {
      // Always reset submitting flag
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setSelectedRecipe(null);
    setShowDuplicateWarning(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen flex flex-col overflow-hidden relative pb-24"
    >
      {/* Top Navigation */}
      <header className="w-full pt-12 pb-4 px-6 flex items-center justify-between z-10">
        <Breadcrumb />
        <h1 className="font-heading text-3xl font-semibold tracking-wide text-text-main">Perfect Matches</h1>
        <div className="w-12 h-12"></div>
      </header>

      {/* Search and Filters */}
      <div className="px-6 pb-4 space-y-4">
        <input 
          type="text"
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/60 border border-white/80 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['easy', 'medium', 'hard'].map(d => (
            <button 
              key={d}
              onClick={() => setDifficultyFilter(prev => prev.includes(d) ? prev.filter(f => f !== d) : [...prev, d])}
              className={`px-4 py-2 rounded-full text-sm font-body ${difficultyFilter.includes(d) ? 'bg-primary text-white' : 'bg-white/40 text-text-main'}`}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
          <input 
            type="range"
            min="15"
            max="180"
            step="15"
            value={prepTimeFilter}
            onChange={(e) => setPrepTimeFilter(parseInt(e.target.value))}
            className="w-32"
          />
          <span className="text-sm text-text-muted">{prepTimeFilter}m prep</span>
          <input 
            type="range"
            min="15"
            max="180"
            step="15"
            value={cookTimeFilter}
            onChange={(e) => setCookTimeFilter(parseInt(e.target.value))}
            className="w-32"
          />
          <span className="text-sm text-text-muted">{cookTimeFilter}m cook</span>
        </div>
      </div>

      {/* Cuisine Filter */}
      <div className="px-6 pb-4 flex items-center gap-2 overflow-x-auto">
        <Filter className="w-5 h-5 text-text-muted" />
        <button 
          onClick={() => setSelectedCuisine('All')}
          className={`px-4 py-2 rounded-full text-sm font-body ${selectedCuisine === 'All' ? 'bg-primary text-white' : 'bg-white/40 text-text-main'}`}
        >
          All
        </button>
        {cuisines.map(cuisine => (
          <button 
            key={cuisine}
            onClick={() => setSelectedCuisine(cuisine)}
            className={`px-4 py-2 rounded-full text-sm font-body ${selectedCuisine === cuisine ? 'bg-primary text-white' : 'bg-white/40 text-text-main'}`}
          >
            {cuisine}
          </button>
        ))}
      </div>

      {/* Main Content Area: Horizontal Carousel */}
      <main className="flex-1 flex flex-col justify-center relative z-10 w-full overflow-hidden pb-24">
        <div className="w-full flex overflow-x-auto hide-scrollbar snap-x snap-mandatory px-8 gap-6 pb-12 pt-4 items-center h-[600px]">
          
          {filteredRecipes.slice().sort((a, b) => b.matchPercentage - a.matchPercentage).map((recipe, idx) => (
            <div key={recipe.id || idx} className="snap-center shrink-0 w-[85vw] max-w-sm h-full max-h-[520px] glass-panel rounded-[24px] flex flex-col relative overflow-hidden">
              {/* Image Half */}
              <div className="h-[50%] w-full relative bg-gray-100 flex flex-col items-center justify-center">
                {recipe.imageUrl.startsWith('data:') ? (
                  <img 
                    src={recipe.imageUrl} 
                    alt={recipe.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : generatingImages[recipe.id] ? (
                  <div className="flex flex-col items-center justify-center p-4 text-center h-full w-full bg-white/40">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                    <p className="text-sm font-semibold text-text-main">Generating Image...</p>
                  </div>
                ) : (
                  <img 
                    src="https://picsum.photos/seed/cooking/400/400?blur=4"
                    alt="Placeholder"
                    className="w-full h-full object-cover opacity-60"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="absolute top-4 left-4">
                  <button 
                    onClick={() => toggleFavorite(recipe)}
                    className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center transition-transform active:scale-95"
                  >
                    <Bookmark className={`w-5 h-5 ${favorites.some(r => r.id === recipe.id) ? 'fill-primary text-primary' : 'text-text-main'}`} />
                  </button>
                </div>
                <div className="absolute top-4 right-4 bg-white/70 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <span className="font-body font-semibold text-sm text-text-main">{recipe.matchPercentage}% Match</span>
                </div>
              </div>

              {/* Details Half */}
              <div className="h-[50%] p-6 flex flex-col justify-between">
                <div>
                  <h2 className="font-heading text-2xl font-semibold text-text-main leading-tight mb-2 line-clamp-2">
                    {recipe.title}
                  </h2>
                  <div className="flex items-center gap-3 text-text-muted font-body text-sm mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {recipe.prepTime} min
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4" />
                      {recipe.calories} kcal
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs text-text-muted font-body">
                    <span>P: {recipe.macros.protein}g</span>
                    <span>C: {recipe.macros.carbs}g</span>
                    <span>F: {recipe.macros.fats}g</span>
                  </div>
                </div>

                {/* Macros */}
                <div className="flex justify-between items-center bg-white/40 rounded-full py-3 px-5 border border-white/50">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-text-muted font-body font-bold uppercase tracking-widest">Protein</span>
                    <span className="font-display font-bold text-text-main">{recipe.macros.protein}g</span>
                  </div>
                  <div className="w-px h-8 bg-white/60"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-text-muted font-body font-bold uppercase tracking-widest">Carbs</span>
                    <span className="font-display font-bold text-text-main">{recipe.macros.carbs}g</span>
                  </div>
                  <div className="w-px h-8 bg-white/60"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-text-muted font-body font-bold uppercase tracking-widest">Fats</span>
                    <span className="font-display font-bold text-text-main">{recipe.macros.fats}g</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-3">
                  <button 
                    onClick={() => handleAddToMenuClick(recipe)}
                    title="Add to menu"
                    className="flex-1 h-12 rounded-full bg-primary text-white flex items-center justify-center gap-2 font-body font-bold uppercase tracking-wider text-sm shadow-md active:scale-95 transition-transform"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                  <button 
                    onClick={() => handleShare(recipe)}
                    className="h-12 w-12 rounded-full bg-white/40 flex items-center justify-center text-text-main transition-transform active:scale-95"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  {recipe.sourceUrl && (
                    <a 
                      href={recipe.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-12 w-12 rounded-full bg-white/40 flex items-center justify-center text-text-main transition-transform active:scale-95"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                  <button 
                    onClick={() => setCookModeRecipe(recipe)}
                    title="Start cooking"
                    className="flex-1 h-12 rounded-full bg-white/60 text-text-main border border-white/80 flex items-center justify-center gap-2 font-body font-bold uppercase tracking-wider text-sm shadow-sm active:scale-95 transition-transform hover:bg-white/80"
                  >
                    <Play className="w-4 h-4" />
                    Cook
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Spacer for scrolling */}
          <div className="shrink-0 w-4 h-full"></div>
        </div>
      </main>

      {/* Add to Menu Modal */}
      <AnimatePresence>
        {isAddModalOpen && selectedRecipe && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background-light rounded-[24px] shadow-xl w-full max-w-sm overflow-hidden border border-white/50"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-heading font-semibold text-text-main">
                    Add to Menu
                  </h3>
                  <button 
                    onClick={handleCloseModal}
                    className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-text-muted hover:bg-white/80 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mb-6">
                  <p className="font-semibold text-text-main mb-1">{selectedRecipe.title}</p>
                  <p className="text-sm text-text-muted mb-2">Select when you want to eat this meal.</p>
                  <p className="text-xs text-text-muted font-medium mt-4">Ingredients will be available in Cook Mode</p>
                </div>

                {showDuplicateWarning ? (
                  <div className="space-y-6">
                    <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200 text-sm">
                      <p className="font-bold mb-1">Duplicate Recipe Detected</p>
                      <p>This recipe is already planned for {mealType} on {weeklyPlan[dayIndex]?.dayName}. Add it again?</p>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setShowDuplicateWarning(false)}
                        className="flex-1 h-12 rounded-full bg-white/60 text-text-main font-semibold text-sm uppercase tracking-wider hover:bg-white/80 transition-colors border border-white/80"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmAdd}
                        disabled={isSubmitting}
                        className="flex-1 h-12 rounded-full bg-red-500 text-white font-semibold text-sm uppercase tracking-wider hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Adding...' : 'Add Anyway'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-text-main mb-2">Day</label>
                      <select 
                        value={dayIndex}
                        onChange={(e) => setDayIndex(parseInt(e.target.value))}
                        className="w-full bg-white/50 border border-white/60 rounded-xl p-3 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        {weeklyPlan.map((day, idx) => (
                          <option key={idx} value={idx}>{day.dayName}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-text-main mb-2">Meal Type</label>
                      <select 
                        value={mealType}
                        onChange={(e) => setMealType(e.target.value)}
                        className="w-full bg-white/50 border border-white/60 rounded-xl p-3 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                        <option value="Snack">Snack</option>
                      </select>
                    </div>

                    <button
                      onClick={handleConfirmAdd}
                      disabled={isSubmitting}
                      className="mt-4 w-full h-12 rounded-full bg-primary text-white font-semibold text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Adding...' : 'Confirm'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Cook Mode Modal */}
      <AnimatePresence>
        {cookModeRecipe && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-background-light flex flex-col"
          >
            <header className="glass-panel border-b border-white/40 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold tracking-tight text-text-main font-display truncate pr-4">
                Cooking: {cookModeRecipe.title}
              </h2>
              <button 
                onClick={() => setCookModeRecipe(null)}
                className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center text-text-muted hover:bg-white/80 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </header>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <section>
                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <Bookmark className="w-5 h-5" /> Ingredients
                </h3>
                <ul className="space-y-3">
                  {cookModeRecipe?.ingredients?.map((ing: any, i: number) => {
                    const id = `${cookModeRecipe?.id}-${i}`;
                    const isChecked = checkedIngredients.has(id);
                    return (
                      <li key={i} className={`flex items-center gap-3 bg-white/40 p-3 rounded-xl border border-white/50 transition-colors ${isChecked ? 'opacity-60 bg-green-50' : ''}`}>
                        <button
                          onClick={() => {
                            const next = new Set(checkedIngredients);
                            if (next.has(id)) next.delete(id);
                            else next.add(id);
                            setCheckedIngredients(next);
                            handleSubstitution(ing);
                          }}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isChecked ? 'bg-green-500 border-green-500 text-white' : 'border-text-muted'}`}
                        >
                          {isChecked && <Check className="w-4 h-4" />}
                        </button>
                        <span className={`text-text-main font-medium ${isChecked ? 'line-through' : ''}`}>{ing.amount} {ing.unit} {ing.name}</span>
                      </li>
                    );
                  })}
                </ul>
                {substitution && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
                    <strong>Substitution Suggestion:</strong> {substitution}
                    <button onClick={() => setSubstitution(null)} className="ml-2 text-yellow-600 underline">Close</button>
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <Flame className="w-5 h-5" /> Instructions
                </h3>
                <div className="space-y-6">
                  {cookModeRecipe.instructions.map((inst: string, i: number) => (
                    <div key={i} className={`bg-white/80 p-6 rounded-3xl border border-white/90 shadow-md transition-colors ${completedSteps.has(i) ? 'opacity-70 bg-green-50' : ''}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold shadow-sm">
                            {i + 1}
                          </div>
                          <h4 className="font-bold text-text-main text-sm uppercase tracking-wider">Instruction</h4>
                        </div>
                        <button
                          onClick={() => {
                            const next = new Set(completedSteps);
                            if (next.has(i)) next.delete(i);
                            else next.add(i);
                            setCompletedSteps(next);
                          }}
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${completedSteps.has(i) ? 'bg-green-500 border-green-500 text-white' : 'border-text-muted hover:border-primary'}`}
                        >
                          {completedSteps.has(i) && <Check className="w-6 h-6" />}
                        </button>
                      </div>
                      <p className={`text-text-main text-xl leading-relaxed ${completedSteps.has(i) ? 'line-through' : ''}`}>{inst}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="p-6 glass-panel border-t border-white/40 pb-safe">
              <VoiceAssistant recipe={cookModeRecipe} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
