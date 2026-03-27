import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Share, Clock, X, GripVertical, Star, Users, Flame, Bookmark, Check, Camera, Trash2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { VoiceAssistant } from './VoiceAssistant';
import { CalendarView } from './CalendarView';
import { Breadcrumb } from './Breadcrumb';
import { getIngredientSubstitutions } from '../lib/gemini';

export function PlannerScreen() {
  const { weeklyPlan, updateRecipeNotes, moveRecipe, rateRecipe, removeFromWeeklyPlan, setCurrentScreen, calendarView, setCalendarView, shoppingList, addShoppingListItem, preferences } = useAppStore();
  const [newIngredient, setNewIngredient] = useState({ name: '', amount: 0, unit: '', category: 'pantry' as any });

  const handleAddIngredient = () => {
    if (newIngredient.name) {
      addShoppingListItem({ ...newIngredient, checked: false });
      setNewIngredient({ name: '', amount: 0, unit: '', category: 'pantry' });
    }
  };
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareSummary, setShareSummary] = useState<string | null>(null);
  const [cookModeRecipe, setCookModeRecipe] = useState<any>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [substitution, setSubstitution] = useState<string | null>(null);

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

  const toggleExpand = (id: string) => {
    setExpandedRecipeId(prev => prev === id ? null : id);
  };

  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };

  const handleConfirmShare = () => {
    let summary = "Weekly Plan Summary:\n\n";
    weeklyPlan.forEach(day => {
      summary += `${day.dayName}:\n`;
      if (day.recipes.length === 0) {
        summary += "  No meals planned\n";
      } else {
        day.recipes.forEach(meal => {
          summary += `  - ${meal.mealType}: ${meal.recipe.title} (${meal.recipe.calories} kcal)\n`;
        });
      }
      summary += "\n";
    });
    setShareSummary(summary);
  };

  const handleCloseModal = () => {
    setIsShareModalOpen(false);
    setShareSummary(null);
  };

  const exportToCalendar = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//MealPlanner//EN\n";
    weeklyPlan.forEach(day => {
      day.recipes.forEach(meal => {
        icsContent += "BEGIN:VEVENT\n";
        icsContent += `SUMMARY:${meal.recipe.title}\n`;
        icsContent += `DESCRIPTION:${meal.mealType} meal\n`;
        icsContent += "END:VEVENT\n";
      });
    });
    icsContent += "END:VCALENDAR";
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mealplan.ics';
    a.click();
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const sourceDayIndex = parseInt(result.source.droppableId);
    const sourceMealIndex = result.source.index;
    
    const destDayIndex = parseInt(result.destination.droppableId);
    const destMealIndex = result.destination.index;
    
    if (sourceDayIndex === destDayIndex && sourceMealIndex === destMealIndex) {
      return;
    }
    
    moveRecipe(sourceDayIndex, sourceMealIndex, destDayIndex, destMealIndex);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col pb-24 relative"
    >
      <header className="sticky top-0 z-40 glass-panel border-b border-white/40 px-6 py-4 flex justify-between items-center rounded-b-xl">
        <Breadcrumb />
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map(view => (
            <button 
              key={view}
              onClick={() => setCalendarView(view)}
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${calendarView === view ? 'bg-primary text-white' : 'bg-white/40 text-text-main'}`}
            >
              {view}
            </button>
          ))}
        </div>
        <button 
          onClick={handleShareClick}
          className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center text-primary hover:bg-white/80 transition-colors shadow-sm border border-white/50"
        >
          <Share className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 px-4 py-6 space-y-8">
        {/* Quick action: scan more ingredients */}
        <button
          onClick={() => setCurrentScreen('camera')}
          className="w-full h-12 rounded-full text-white font-semibold text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all active:scale-95"
          style={{ backgroundColor: '#5A7D9A' }}
        >
          <Camera className="w-5 h-5" /> Scan More Ingredients
        </button>

        {/* Calendar View */}
        <CalendarView />

        {/* Shopping List Manual Add */}
        <div className="glass-panel p-4 rounded-xl space-y-2">
          <h3 className="font-bold text-lg">Add to Shopping List</h3>
          <div className="flex gap-2">
            <input type="text" placeholder="Ingredient" value={newIngredient.name} onChange={e => setNewIngredient({...newIngredient, name: e.target.value})} className="flex-1 p-2 rounded-lg bg-white/40" />
            <input type="number" placeholder="Qty" value={newIngredient.amount} onChange={e => setNewIngredient({...newIngredient, amount: parseFloat(e.target.value)})} className="w-16 p-2 rounded-lg bg-white/40" />
            <input type="text" placeholder="Unit" value={newIngredient.unit} onChange={e => setNewIngredient({...newIngredient, unit: e.target.value})} className="w-16 p-2 rounded-lg bg-white/40" />
            <button onClick={handleAddIngredient} className="px-4 py-2 bg-primary text-white rounded-lg font-bold">Add</button>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          {weeklyPlan.map((day, dayIdx) => (
            <Droppable key={dayIdx} droppableId={dayIdx.toString()}>
              {(provided, snapshot) => (
                <section 
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`space-y-4 ${day.recipes?.length === 0 && !snapshot.isDraggingOver ? 'opacity-70' : ''}`}
                >
                  <h2 className="text-xl font-bold text-primary px-2 sticky top-20 z-30 bg-background-light/80 backdrop-blur-md py-2 rounded-lg -mx-2">
                    {day.dayName}
                  </h2>
                  
                  {day.recipes?.length === 0 && !snapshot.isDraggingOver ? (
                    <div className="glass-panel rounded-full p-4 flex items-center justify-center text-text-muted text-sm font-medium border-dashed border-2 border-white/60">
                      No meals planned yet
                    </div>
                  ) : (
                    day.recipes.map((meal, mealIdx) => {
                      const isExpanded = expandedRecipeId === meal.id;
                      const recipe = meal.recipe;

                      return (
                        <Draggable draggableId={meal.id || `${dayIdx}-${mealIdx}`} index={mealIdx}>
                          {(provided, snapshot) => (
                            <div 
                              key={meal.id || `${dayIdx}-${mealIdx}`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={provided.draggableProps.style}
                              className={`glass-panel transition-all duration-300 overflow-hidden ${isExpanded ? 'rounded-3xl' : 'rounded-full'} ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary scale-[1.02] z-50' : ''}`}
                            >
                              <div 
                                className="flex items-center gap-3 cursor-pointer p-4"
                                onClick={() => toggleExpand(meal.id)}
                              >
                                <div 
                                  {...provided.dragHandleProps}
                                  className="cursor-grab active:cursor-grabbing p-1 -ml-2 text-text-muted hover:text-primary transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <GripVertical className="w-5 h-5" />
                                </div>
                                <img 
                                  src={recipe.imageUrl} 
                                  alt={recipe.title} 
                                  className="w-16 h-16 rounded-full object-cover shadow-sm flex-shrink-0 border-2 border-white/80"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-base truncate text-text-main">{recipe.title}</h3>
                                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-white/60 text-text-muted border border-white/80 shrink-0">
                                      {meal.mealType}
                                    </span>
                                  </div>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-white/80 text-xs font-bold text-primary shadow-sm border border-white/60 flex-shrink-0">
                                  {recipe.calories} kcal
                                </div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); removeFromWeeklyPlan(dayIdx, mealIdx); }}
                                  className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors flex-shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-6 pb-6"
                                  >
                                    <div className="h-px w-full bg-primary/10 mb-4 rounded-full"></div>
                                    
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                      <div className="bg-white/40 rounded-xl p-2 text-center border border-white/50">
                                        <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Protein</p>
                                        <p className="font-bold text-sm text-text-main">{recipe.macros.protein}g</p>
                                      </div>
                                      <div className="bg-white/40 rounded-xl p-2 text-center border border-white/50">
                                        <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Carbs</p>
                                        <p className="font-bold text-sm text-text-main">{recipe.macros.carbs}g</p>
                                      </div>
                                      <div className="bg-white/40 rounded-xl p-2 text-center border border-white/50">
                                        <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Fats</p>
                                        <p className="font-bold text-sm text-text-main">{recipe.macros.fats}g</p>
                                      </div>
                                    </div>

                                    {(recipe.cuisineType || (recipe.dietaryRestrictions && recipe.dietaryRestrictions.length > 0)) && (
                                      <div className="flex flex-wrap gap-2 mb-4">
                                        {recipe.cuisineType && (
                                          <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-scandi-blue/20 text-scandi-blue border border-scandi-blue/30">
                                            {recipe.cuisineType}
                                          </span>
                                        )}
                                        {recipe.dietaryRestrictions?.map((restriction, idx) => (
                                          <span key={idx} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                                            {restriction}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                      <div className="flex items-center gap-2 text-xs font-semibold text-text-muted bg-white/50 inline-flex px-3 py-1.5 rounded-full border border-white/40">
                                        <Clock className="w-4 h-4" />
                                        <span>{recipe.prepTime} min prep</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs font-semibold text-text-muted bg-white/50 inline-flex px-3 py-1.5 rounded-full border border-white/40">
                                        <Users className="w-4 h-4" />
                                        <span>{recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}</span>
                                      </div>
                                    </div>

                                    {/* Macros */}
                                    <div className="flex justify-between items-center bg-white/40 rounded-full py-3 px-5 border border-white/50 mb-4">
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

                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-bold text-sm text-text-main mb-2">Ingredients</h4>
                                        <ul className="text-sm space-y-1 text-text-muted list-disc pl-4 marker:text-scandi-blue">
                                          {recipe.ingredients.map((ing, i) => <li key={i}>{ing.amount} {ing.unit} {ing.name}</li>)}
                                        </ul>
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-sm text-text-main mb-2">Instructions</h4>
                                        <ol className="text-sm space-y-2 text-text-muted list-decimal pl-4 marker:font-bold marker:text-text-main">
                                          {recipe.instructions.map((inst, i) => <li key={i}>{inst}</li>)}
                                        </ol>
                                      </div>
                                      <div className="pt-2">
                                        <h4 className="font-bold text-sm text-text-main mb-2">Personal Notes</h4>
                                        <textarea
                                          className="w-full bg-white/50 border border-white/60 rounded-xl p-3 text-sm text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                          rows={3}
                                          placeholder="Add your personal notes here..."
                                          value={recipe.notes || ''}
                                          onChange={(e) => updateRecipeNotes(dayIdx, mealIdx, e.target.value)}
                                        />
                                      </div>
                                      <div className="pt-2">
                                        <button
                                          onClick={() => setCookModeRecipe(recipe)}
                                          className="w-full h-12 flex items-center justify-center gap-2 bg-primary text-white rounded-full font-semibold text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors mb-4"
                                        >
                                          <Flame className="w-5 h-5" /> Cook Mode
                                        </button>
                                        <h4 className="font-bold text-sm text-text-main mb-2">Rate this recipe</h4>
                                        <div className="flex gap-2">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                              key={star}
                                              onClick={() => rateRecipe(dayIdx, mealIdx, star)}
                                              className={`p-1 transition-colors ${
                                                (meal.rating || 0) >= star ? 'text-yellow-400' : 'text-gray-300'
                                              }`}
                                            >
                                              <Star className="w-6 h-6 fill-current" />
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                      <div className="pt-4">
                                        <VoiceAssistant recipe={recipe} />
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </Draggable>
                      );
                    })
                  )}
                  {provided.placeholder}
                </section>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </main>

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
                    {cookModeRecipe.ingredients.map((ing: any, i: number) => {
                      const id = `${cookModeRecipe.id}-${i}`;
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

      {/* Custom Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
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
                    {shareSummary ? 'Share Summary' : 'Share Weekly Plan'}
                  </h3>
                  <button 
                    onClick={handleCloseModal}
                    className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-text-muted hover:bg-white/80 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {shareSummary ? (
                  <div className="space-y-4">
                    <div className="bg-white/50 rounded-xl p-4 max-h-[40vh] overflow-y-auto whitespace-pre-wrap text-sm text-text-main font-body border border-white/60">
                      {shareSummary}
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={exportToCalendar}
                        className="flex-1 h-12 rounded-full bg-scandi-blue text-white font-semibold text-sm uppercase tracking-wider hover:bg-scandi-blue/90 transition-colors"
                      >
                        Export Calendar
                      </button>
                      <button 
                        onClick={handleCloseModal}
                        className="flex-1 h-12 rounded-full bg-white/60 text-text-main font-semibold text-sm uppercase tracking-wider hover:bg-white/80 transition-colors border border-white/80"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <p className="text-text-muted text-sm">
                      Do you want to generate a summary of your weekly plan to share?
                    </p>
                    <div className="flex gap-3">
                      <button 
                        onClick={handleCloseModal}
                        className="flex-1 h-12 rounded-full bg-white/60 text-text-main font-semibold text-sm uppercase tracking-wider hover:bg-white/80 transition-colors border border-white/80"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleConfirmShare}
                        className="flex-1 h-12 rounded-full bg-primary text-white font-semibold text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
