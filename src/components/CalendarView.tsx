import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';
import { useAppStore } from '../store';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function CalendarView() {
  const { calendarView, weeklyPlan } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Create a lookup for planned meals
  const mealLookup = weeklyPlan.reduce((acc, day) => {
    acc[day.date] = day.recipes;
    return acc;
  }, {} as Record<string, typeof weeklyPlan[0]['recipes']>);

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <div className="glass-panel p-4 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}><ChevronLeft /></button>
          <h3 className="font-bold text-lg">{format(currentDate, 'MMMM yyyy')}</h3>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}><ChevronRight /></button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="text-center text-xs font-bold text-text-muted">{day}</div>)}
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const meals = mealLookup[dateStr] || [];
            return (
              <div key={day.toString()} className={`p-2 rounded-lg text-center ${isSameMonth(day, monthStart) ? 'bg-white/40' : 'opacity-30'}`}>
                <div className="text-xs">{format(day, 'd')}</div>
                <div className="flex justify-center gap-0.5 mt-1">
                  {meals.map((meal, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />
                  ))}
                </div>
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

    return (
      <div className="glass-panel p-4 rounded-xl">
        <h3 className="font-bold text-lg mb-4 text-center">{format(currentDate, 'yyyy')}</h3>
        <div className="grid grid-cols-3 gap-2">
          {months.map(month => (
            <div key={month.toString()} className="p-2 rounded-lg text-center bg-white/40">
              {format(month, 'MMM')}
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
      {calendarView === 'week' && (
        <div className="glass-panel p-4 rounded-xl">
          <h3 className="font-bold text-lg mb-2">Calendar View: WEEK</h3>
          <p className="text-sm text-text-muted">Displaying weekly schedule...</p>
        </div>
      )}
    </div>
  );
}
