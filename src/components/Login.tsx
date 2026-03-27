import { useAppStore } from '../store';
import { motion } from 'motion/react';
import { Apple, Chrome } from 'lucide-react';

export function LoginScreen() {
  const { setCurrentScreen } = useAppStore();

  const handleLogin = () => {
    // Simulate login delay
    setTimeout(() => {
      setCurrentScreen('preferences');
    }, 500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center font-display px-6 relative overflow-hidden"
    >
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_20%_30%,_rgba(255,255,255,0.6)_0%,_transparent_40%),radial-gradient(circle_at_80%_70%,_rgba(255,255,255,0.4)_0%,_transparent_40%)] -z-10 pointer-events-none"></div>

      <header className="text-center mb-16 flex flex-col items-center">
        <h1 className="font-heading text-text-main text-[48px] leading-tight mb-2 tracking-tight">Āhāraḥ</h1>
        <p className="font-body text-text-muted text-lg tracking-wide">Health through food</p>
      </header>

      <div className="w-full max-w-sm flex flex-col gap-4">
        <button 
          onClick={handleLogin}
          className="group relative flex w-full h-[56px] items-center justify-center overflow-hidden rounded-full glass-panel text-text-main gap-3 px-6 font-body font-semibold text-[14px] uppercase tracking-[0.05em] hover:bg-white/70 transition-all active:scale-95"
        >
          <Apple className="w-5 h-5" />
          <span>Continue with Apple</span>
        </button>

        <button 
          onClick={handleLogin}
          className="group relative flex w-full h-[56px] items-center justify-center overflow-hidden rounded-full glass-panel text-text-main gap-3 px-6 font-body font-semibold text-[14px] uppercase tracking-[0.05em] hover:bg-white/70 transition-all active:scale-95"
        >
          <Chrome className="w-5 h-5" />
          <span>Continue with Google</span>
        </button>
      </div>

      <footer className="mt-12 text-center">
        <p className="font-body text-text-muted text-xs opacity-80">
          By continuing, you agree to our <a href="#" className="underline hover:text-text-main transition-colors">Terms</a> & <a href="#" className="underline hover:text-text-main transition-colors">Privacy</a>
        </p>
      </footer>
    </motion.div>
  );
}
