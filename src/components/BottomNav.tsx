import { useAppStore } from '../store';
import { Camera, Calendar, User, Image as ImageIcon } from 'lucide-react';

export function BottomNav() {
  const { currentScreen, setCurrentScreen } = useAppStore();

  // Don't show nav on login or camera screens
  if (currentScreen === 'login' || currentScreen === 'camera') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="glass-panel rounded-t-3xl border-t border-white/60">
        <div className="flex gap-2 px-4 pb-6 pt-3">
          <button 
            onClick={() => setCurrentScreen('camera')}
            className={`flex flex-1 flex-col items-center justify-end gap-1 transition-colors ${currentScreen === 'camera' ? 'text-primary' : 'text-text-muted hover:text-primary'}`}
          >
            <div className="flex h-8 items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <p className="text-[11px] font-bold leading-normal tracking-wide uppercase">Capture</p>
          </button>
          
          <button 
            onClick={() => setCurrentScreen('planner')}
            className={`flex flex-1 flex-col items-center justify-end gap-1 transition-colors ${currentScreen === 'planner' ? 'text-primary' : 'text-text-muted hover:text-primary'}`}
          >
            <div className="flex h-8 items-center justify-center">
              <Calendar className={`w-6 h-6 ${currentScreen === 'planner' ? 'fill-current' : ''}`} />
            </div>
            <p className="text-[11px] font-bold leading-normal tracking-wide uppercase">Plan</p>
          </button>
          
          <button 
            onClick={() => setCurrentScreen('gallery')}
            className={`flex flex-1 flex-col items-center justify-end gap-1 transition-colors ${currentScreen === 'gallery' ? 'text-primary' : 'text-text-muted hover:text-primary'}`}
          >
            <div className="flex h-8 items-center justify-center">
              <ImageIcon className={`w-6 h-6 ${currentScreen === 'gallery' ? 'fill-current' : ''}`} />
            </div>
            <p className="text-[11px] font-bold leading-normal tracking-wide uppercase">Gallery</p>
          </button>
          
          <button 
            onClick={() => setCurrentScreen('preferences')}
            className={`flex flex-1 flex-col items-center justify-end gap-1 transition-colors ${currentScreen === 'preferences' ? 'text-primary' : 'text-text-muted hover:text-primary'}`}
          >
            <div className="flex h-8 items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <p className="text-[11px] font-bold leading-normal tracking-wide uppercase">Profile</p>
          </button>
        </div>
      </div>
    </div>
  );
}
