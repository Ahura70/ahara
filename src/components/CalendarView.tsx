import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths, startOfYear, endOfYear, eachMonthOfInterval, getDate, getDay } from 'date-fns';
import { useAppStore } from '../store';
import { ChevronLeft, ChevronRight, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function CalendarView() {
  const { calendarView, setCalendarView, weeklyPlan } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  // Create a lookup for planned meals by date
  const mealLookup = weeklyPlan.reduce((acc, day) => {
    acc[day.date] = day;
    return acc;
  }, {} as Record<string, typeof weeklyPlan[0]>);

  const getMealCount = (dateStr: string) => {
    return mealLookup[dateStr]?.recipes?.length || 0;
  };

  const getMealTypeBreakdown = (dateStr: string) => {
    const meals = mealLookup[dateStr]?.recipes || [];
    const breakdown: Record<string, number> = {};
    meals.forEach(meal => {
      breakdown[meal.mealType] = (breakdown[meal.mealType] || 0) + 1;
    });
    return breakdown;
  };

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

    // Pad beginning of grid: getDay returns 0=Sun. We need empty cells before the 1st.
    const startDayOfWeek = getDay(monthStart); // 0=Sun, 1=Mon, ...
    const paddingCells = Array.from({ length: startDayOfWeek }, (_, i) => i);

    return (
      <div className="glass-panel p-4 rounded-xl space-y-3">
        {/* Header with navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="w-9 h-9 rounded-full bg-white/40 flex items-center justify-center hover:bg-white/60 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCalendarView('year')}
            className="text-center flex-1 hover:opacity-70 transition-opacity"
          >
            <h3 className="font-heading font-bold text-xl text-text-main">{format(currentDate, 'MMMM yyyy')}</h3>
            <p className="text-[10px] text-text-muted font-medium">Tap for year view</p>
          </button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="w-9 h-9 rounded-full bg-white/40 flex items-center justify-center hover:bg-white/60 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-[10px] font-bold text-text-muted py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days with proper alignment */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty padding cells */}
          {paddingCells.map(i => (
            <div key={`pad-${i}`} className="p-1" />
          ))}

          {/* Actual days */}
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const mealCount = getMealCount(dateStr);
            const mealTypes = getMealTypeBreakdown(dateStr);
            const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;
            const isExpanded = expandedDay === dateStr;

            return (
              <div key={dateStr}>
                <button
                  onClick={() => setExpandedDay(isExpanded ? null : dateStr)}
                  className={`w-full p-1.5 rounded-lg transition-all text-left min-h-[44px] ${
                    isToday
                      ? 'bg-primary/20 ring-2 ring-primary/50'
                      : mealCount > 0
                        ? 'bg-white/50 ring-1 ring-primary/30'
                        : 'bg-white/30 hover:bg-white/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-xs font-bold ${isToday ? 'text-primary' : 'text-text-main'}`}>
                      {getDate(day)}
                    </span>
                    {mealCount > 0 && (
                      <Utensils className="w-2.5 h-2.5 text-primary" />
                    )}
                  </div>
                  {mealCount > 0 && (
                    <div className="mt-0.5 flex flex-wrap gap-0.5">
                      {Object.entries(mealTypes).map(([type, count]) =>
                        renderMealBadge(type, count)
                      )}
                    </div>
                  )}
                </button>

                {/* Expanded day details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="col-span-7 bg-white/40 rounded-lg p-2 mt-1 border border-white/50"
                    >
                      <h4 className="font-bold text-text-main text-[11px] mb-1.5">
                        {format(day, 'EEEE, MMMM d')}
                      </h4>
                      {mealLookup[dateStr]?.recipes && mealLookup[dateStr].recipes.length > 0 ? (
                        <div className="space-y-1">
                          {mealLookup[dateStr].recipes.map((meal, idx) => (
                            <div key={idx} className="bg-white/50 rounded-md p-1.5">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="text-[10px] font-bold text-text-main">{meal.recipe.title}</p>
                                  <p className="text-[9px] text-text-muted">{meal.recipe.calories} kcal</p>
                                </div>
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
                                  {meal.mealType}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-text-muted italic">No meals planned</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(yearStart);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    const getMealsInMonth = (month: Date) => {
      let count = 0;
      const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
      days.forEach(day => {
        count += getMealCount(format(day, 'yyyy-MM-dd'));
      });
      return count;
    };

    return (
      <div className="glass-panel p-4 rounded-xl space-y-3">
        {/* Header */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 12))}
            className="w-9 h-9 rounded-full bg-white/40 flex items-center justify-center hover:bg-white/60 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center flex-1">
            <h3 className="font-heading font-bold text-xl text-text-main">{format(currentDate, 'yyyy')}</h3>
            <p className="text-[10px] text-text-muted font-medium">Year Overview</p>
          </div>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 12))}
            className="w-9 h-9 rounded-full bg-white/40 flex items-center justify-center hover:bg-white/60 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3x4 grid of months — click to drill down to month view */}
        <div className="grid grid-cols-3 gap-2">
          {months.map(month => {
            const mealCount = getMealsInMonth(month);
            const isCurrentMonth = format(new Date(), 'yyyy-MM') === format(month, 'yyyy-MM');
            const intensity = Math.min(mealCount / 10, 1);

            return (
              <button
                key={month.toString()}
                onClick={() => {
                  setCurrentDate(month);
                  setCalendarView('month'); // Drill down via store
                }}
                className={`p-3 rounded-xl transition-all ${isCurrentMonth ? 'ring-2 ring-primary' : ''}`}
                style={{
                  backgroundColor: mealCount > 0
                    ? `rgba(90, 125, 154, ${0.15 + intensity * 0.35})`
                    : 'rgba(255,255,255,0.3)',
                }}
              >
                <div className="text-center">
                  <h4 className="font-bold text-text-main text-sm mb-0.5">
                    {format(month, 'MMM')}
                  </h4>
                  <p className="text-[10px] text-text-muted font-medium">
                    {mealCount > 0 ? `${mealCount} meal${mealCount > 1 ? 's' : ''}` : '—'}
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
      <div className="space-y-3">
        {weeklyPlan.map((day, idx) => {
          const isToday = day.date === format(new Date(), 'yyyy-MM-dd');
          return (
            <div
              key={idx}
              className={`glass-panel rounded-xl p-4 ${isToday ? 'ring-2 ring-primary/50' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-text-main">{day.dayName}</h4>
                <span className="text-[10px] text-text-muted font-medium">
                  {day.date}
                </span>
              </div>
              {day.recipes && day.recipes.length > 0 ? (
                <div className="space-y-2">
                  {day.recipes.map((meal, mealIdx) => (
                    <div
                      key={mealIdx}
                      className="flex items-start justify-between p-2.5 bg-white/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-bold text-text-main">{meal.recipe.title}</p>
                        <div className="flex gap-2 mt-1 text-[10px] text-text-muted">
                          <span>{meal.recipe.calories} kcal</span>
                          <span>·</span>
                          <span>{meal.recipe.prepTime}min prep</span>
                        </div>
                      </div>
                      {renderMealBadge(meal.mealType, 1)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted italic">No meals planned</p>
              )}
            </div>
          );
        })}
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
