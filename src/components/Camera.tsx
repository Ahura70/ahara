import React, { useRef, useState } from 'react';
import { useAppStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Zap, Loader2 } from 'lucide-react';
import { generateRecipesFromImage } from '../lib/gemini';
import { ApiErrorMessage, type ApiError } from './ApiErrorMessage';

export function CameraScreen() {
  const { setCurrentScreen, preferences, setGeneratedRecipes, weeklyPlan, saveImage } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCaptureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        saveImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      const highlyRatedRecipes = weeklyPlan
        .flatMap(day => day.recipes)
        .filter(meal => (meal.rating || 0) >= 4)
        .map(meal => meal.recipe);

      const recipes = await generateRecipesFromImage(file, preferences, highlyRatedRecipes);
      setGeneratedRecipes(recipes);
      setCurrentScreen('matches');
    } catch (error: any) {
      console.error("Failed to generate recipes", error);

      let apiError: ApiError = {
        message: 'Failed to analyze image. Please try again.',
      };

      if (error.message?.includes('API')) {
        apiError = {
          code: 'API_KEY_ERROR',
          message: 'API configuration error. Please contact support.',
          details: 'The application encountered an API issue while analyzing your image.',
        };
      } else if (error.message?.includes('timeout') || error.message?.includes('time out')) {
        apiError = {
          code: 'TIMEOUT',
          message: 'Request took too long to process.',
          details: 'Try taking a clearer photo of your ingredients.',
        };
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        apiError = {
          code: 'NETWORK_ERROR',
          message: 'Network connection failed.',
          details: 'Please check your internet connection.',
        };
      }

      setError(apiError);
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-screen w-full relative bg-black overflow-hidden"
    >
      {/* Simulated Camera Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#88C0D0] to-[#E5E9F0]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556910103-1c02745a872f?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
      </div>

      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(24px)' }}
            className="absolute inset-0 z-40 flex items-center justify-center flex-col gap-8 bg-white/20"
          >
            <Loader2 className="w-16 h-16 text-white animate-spin" />
            <div className="text-center">
              <p className="text-white font-display font-medium text-lg tracking-widest uppercase drop-shadow-md">
                Analyzing Āhāra...
              </p>
              <p className="text-white/80 text-sm mt-2">
                Identifying ingredients & finding recipes
              </p>
            </div>
          </motion.div>
        )}
        {error && (
          <ApiErrorMessage
            error={error}
            title="Analysis Failed"
            onRetry={handleRetry}
            onDismiss={() => setError(null)}
          />
        )}
      </AnimatePresence>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none"></div>

      {/* UI Layer */}
      <div className={`absolute inset-0 z-30 flex flex-col justify-between pointer-events-none transition-opacity duration-300 ${isProcessing ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* Top Nav */}
        <div className="w-full pt-14 px-6 flex justify-center pointer-events-auto">
          <div className="bg-white/30 backdrop-blur-md border border-white/50 rounded-full h-14 flex items-center justify-between px-2 w-full max-w-sm">
            <button 
              onClick={() => setCurrentScreen('preferences')}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <span className="text-white font-display font-semibold tracking-widest text-xs uppercase">
              Āhāraḥ Lens
            </span>
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <Zap className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewfinder Brackets */}
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="relative w-full max-w-xs aspect-square">
            {[
              { top: 0, left: 0, borderT: true, borderL: true },
              { top: 0, right: 0, borderT: true, borderR: true },
              { bottom: 0, left: 0, borderB: true, borderL: true },
              { bottom: 0, right: 0, borderB: true, borderR: true },
            ].map((pos, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute w-12 h-12 ${pos.top !== undefined ? 'top-0' : 'bottom-0'} ${pos.left !== undefined ? 'left-0' : 'right-0'} 
                  ${pos.borderT ? 'border-t-4' : ''} ${pos.borderB ? 'border-b-4' : ''} 
                  ${pos.borderL ? 'border-l-4' : ''} ${pos.borderR ? 'border-r-4' : ''} 
                  border-white/90 drop-shadow-lg`}
              />
            ))}
          </div>
        </div>

        {/* Shutter Button */}
        <div className="w-full pb-20 px-6 flex justify-center items-center pointer-events-auto">
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden" 
          />
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCaptureClick}
            className="w-20 h-20 rounded-full border-4 border-white/80 flex items-center justify-center p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300"
          >
            <motion.div 
              animate={{ backgroundColor: ["rgba(255,255,255,0.5)", "rgba(255,255,255,0.8)", "rgba(255,255,255,0.5)"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full rounded-full backdrop-blur-md border border-white/70"
            ></motion.div>
          </motion.button>
        </div>

      </div>
    </motion.div>
  );
}
