import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths, startOfYear, endOfYear, eachMonthOfInterval, getDate, getDaysInMonth } from 'date-fns';
import { useAppStore } from '../store';
import { ChevronLeft, ChevronRight, ChevronDown, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function CalendarView() {
  const { calendarView, weeklyPlan } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [drillDownView, setDrillDownView] = useState<'year' | 'month' | 'week'>(calendarView);

  // Create a lookup for planned meals by date
  const mealLookup = weeklyPlan.reduce((acc, day) => {
    acc[day.date] = day;
    return acc;
  }, {} as Record<string, typeof weeklyPlan[0]>);

  // Get meal count for a day
  const getMealCount = (dateStr: string) => {
    return mealLookup[dateStr]?.recipes?.length || 0;
  };

  // Get meal type breakdown
  const getMealTypeBreakdown = (dateStr: string) => {
    const meals = mealLookup[dateStr]?.recipes || [];
    const breakdown: Record<string, number> = {};
    meals.forEach(meal => {
      breakdown[meal.mealType] = (breakdown[meal.mealType] || 0) + 1;
    });
    return breakdown;
  };

  // Render a meal type badge with color coding
  const renderMealBadge = (type: string, count: number) => {
    const colors: Record<string, string> = {
      'Breakfast': 'bg-orange-100 text-orange-700',
      'Lunch': 'bg-green-100 text-green-700',
      'Dinner': 'bg-blue-100 text-blue-700',
      'Snack': 'bg-yellow-100 text-yellow-700',
    };
    return (
      <span key={type} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${colors[type] || 'bg-gray-100 text-gray-700'}`}>
        {type.substring(0, 3)}{count > 1 ? `×${count}` : ''}
      </span>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <div className="glass-panel p-6 rounded-xl space-y-4">
        {/* Header with navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center hover:bg-white/60 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center flex-1">
            <h3 className="font-heading font-bold text-2xl text-text-main">{format(currentDate, 'MMMM')}</h3>
            <p className="text-sm text-text-muted font-medium">{format(currentDate, 'yyyy')}</p>
          </div>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center hover:bg-white/60 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar grid */}
        <div className="space-y-2">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-text-muted py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const isCurrentMonth = isSameMonth(day, monthStart);
              const mealCount = getMealCount(dateStr);
              const mealTypes = getMealTypeBreakdown(dateStr);
              const isExpanded = expandedDay === dateStr;

              return (
                <div key={day.toString()}>
                  <button
                    onClick={() => setExpandedDay(isExpanded ? null : dateStr)}
                    className={`w-full p-2 rounded-lg transition-all text-left ${
                      isCurrentMonth
                        ? 'bg-white/40 hover:bg-white/60 cursor-pointer'
                        : 'opacity-20 cursor-default'
                    } ${mealCount > 0 ? 'ring-2 ring-primary/40' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-text-main">{getDate(day)}</span>
                      {mealCount > 0 && (
                        <Utensils className="w-3 h-3 text-primary" />
                      )}
                    </div>
                    {mealCount > 0 && (
                      <div className="mt-1 flex flex-wrap gap-0.5">
                        {Object.entries(mealTypes).map(([type, count]) =>
                          renderMealBadge(type, count)
                        )}
                      </div>
                    )}
                  </button>

                  {/* Expanded day details */}
                  <AnimatePresence>
                    {isExpanded && isCurrentMonth && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="col-span-7 bg-white/30 rounded-lg p-3 mt-2 border border-white/50"
                      >
                        <h4 className="font-bold text-text-main text-sm mb-2">
                          {format(day, 'EEEE, MMMM d')}
                        </h4>
                        {mealLookup[dateStr]?.recipes && mealLookup[dateStr].recipes.length > 0 ? (
                          <div className="space-y-2">
                            {mealLookup[dateStr].recipes.map((meal, idx) => (
                              <div key={idx} className="bg-white/40 rounded-lg p-2">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="text-xs font-bold text-text-main">{meal.recipe.title}</p>
                                    <p className="text-[10px] text-text-muted">{meal.recipe.calories} kcal</p>
                                  </div>
                                  <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-primary text-white">
                                    {meal.mealType}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-text-muted">No meals planned</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(yearStart);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    // Count meals per month
    const getMealsInMonth = (month: Date) => {
      let count = 0;
      const startDay = startOfMonth(month);
      const endDay = endOfMonth(month);
      const daysInMonth = eachDayOfInterval({ start: startDay, end: endDay });
      daysInMonth.forEach(day => {
        count += getMealCount(format(day, 'yyyy-MM-dd'));
      });
      return count;
    };

    return (
      <div className="glass-panel p-6 rounded-xl space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 12))}
            className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center hover:bg-white/60 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center flex-1">
            <h3 className="font-heading font-bold text-2xl text-text-main">{format(currentDate, 'yyyy')}</h3>
            <p className="text-sm text-text-muted font-medium">Year Overview</p>
          </div>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 12))}
            className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center hover:bg-white/60 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 3x4 grid of months */}
        <div className="grid grid-cols-3 gap-3">
          {months.map(month => {
            const mealCount = getMealsInMonth(month);
            const intensity = Math.min(mealCount / 20, 1); // Scale intensity from 0 to 1

            return (
              <button
                key={month.toString()}
                onClick={() => {
                  setCurrentDate(month);
                  setDrillDownView('month');
                }}
                className="p-4 rounded-xl transition-all group"
                style={{
                  backgroundColor: `rgba(90, 125, 154, ${0.2 + intensity * 0.4})`,
                  borderWidth: '2px',
                  borderColor: mealCount > 0 ? '#5A7D9A' : 'rgba(90, 125, 154, 0.2)',
                }}
              >
                <div className="text-center">
                  <h4 className="font-bold text-text-main text-sm mb-1 group-hover:text-primary transition-colors">
                    {format(month, 'MMM')}
                  </h4>
                  <p className="text-xs text-text-muted font-medium">
                    {mealCount} {mealCount === 1 ? 'meal' : 'meals'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    return (
      <div className="glass-panel p-6 rounded-xl space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center hover:bg-white/60 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center flex-1">
            <h3 className="font-heading font-bold text-2xl text-text-main">Weekly Plan</h3>
            <p className="text-sm text-text-muted font-medium">{format(currentDate, 'MMM yyyy')}</p>
          </div>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center hover:bg-white/60 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Weekly grid */}
        <div className="space-y-3">
          {weeklyPlan.map((day, idx) => (
            <div key={idx} className="bg-white/40 rounded-xl p-4 border border-white/50">
              <h4 className="font-bold text-text-main mb-3">{day.dayName}</h4>
              {day.recipes && day.recipes.length > 0 ? (
                <div className="space-y-2">
                  {day.recipes.map((meal, mealIdx) => (
                    <div
                      key={mealIdx}
                      className="flex items-start justify-between p-2 bg-white/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-bold text-text-main">{meal.recipe.title}</p>
                        <div className="flex gap-2 mt-1 text-[10px] text-text-muted">
                          <span>{meal.recipe.calories} kcal</span>
                          <span>•</span>
                          <span>{meal.recipe.prepTime}min prep</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-primary text-white ml-2 flex-shrink-0">
                        {meal.mealType}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted italic">No meals planned</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {calendarView === 'month' && renderMonthView()}
      {calendarView === 'year' && renderYearView()}
      {calendarView === 'week' && renderWeekView()}
    </div>
  );
}
