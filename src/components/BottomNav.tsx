import { useAppStore } from '../store';
import { Camera, Calendar, User, BarChart3, ShoppingCart } from 'lucide-react';

export function BottomNav() {
  const { currentScreen, setCurrentScreen } = useAppStore();

  const items = [
    { id: 'dashboard', label: 'Today', Icon: BarChart3 },
    { id: 'camera', label: 'Scan', Icon: Camera },
    { id: 'planner', label: 'Plan', Icon: Calendar },
    { id: 'grocery', label: 'Grocery', Icon: ShoppingCart },
    { id: 'preferences', label: 'Profile', Icon: User },
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="glass-panel rounded-t-3xl border-t border-white/60">
        <div className="flex gap-1 px-4 pb-6 pt-3">
          {items.map(({ id, label, Icon }) => {
            const isActive = currentScreen === id;
            return (
              <button
                key={id}
                onClick={() => setCurrentScreen(id)}
                className={`flex flex-1 flex-col items-center justify-end gap-1 py-1 rounded-2xl transition-all ${
                  isActive ? 'text-primary' : 'text-text-muted hover:text-primary'
                }`}
              >
                <div className="flex h-8 items-center justify-center">
                  <Icon className={`w-6 h-6 transition-all ${isActive ? 'scale-110' : ''}`} />
                </div>
                <p className={`text-[11px] font-bold leading-normal tracking-wide uppercase transition-all ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  {label}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
