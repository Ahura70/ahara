import React, { useRef, useState } from 'react';
import { useAppStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Zap, Loader2, Plus, X, Image as ImageIcon } from 'lucide-react';
import { generateRecipesFromMultipleImages } from '../lib/gemini';
import { ApiErrorMessage, type ApiError } from './ApiErrorMessage';

interface SelectedImage {
  file: File;
  preview: string;
}

export function CameraScreen() {
  const { setCurrentScreen, preferences, setGeneratedRecipes, weeklyPlan, saveImage } = useAppStore();
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result as string;
      saveImage(preview);
      setSelectedImages(prev => [...prev, { file, preview }]);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input so same file can be selected again
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => processFile(file));
    }
    // Reset input
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (selectedImages.length === 0) {
      setError({
        message: 'Please select at least one image',
        details: 'Take a picture or choose images from your gallery.',
      });
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const files = selectedImages.map(img => img.file);

      const highlyRatedRecipes = weeklyPlan
        .flatMap(day => day.recipes)
        .filter(meal => (meal.rating || 0) >= 4)
        .map(meal => meal.recipe);

      console.log('🔍 Starting recipe analysis with', files.length, 'image(s)');
      const recipes = await generateRecipesFromMultipleImages(files, preferences, highlyRatedRecipes);

      if (!recipes || recipes.length === 0) {
        throw new Error('No recipes generated from the images');
      }

      console.log('✅ Successfully generated', recipes.length, 'recipes');
      setGeneratedRecipes(recipes);
      setCurrentScreen('matches');
    } catch (error: any) {
      console.error('❌ Failed to generate recipes:', error);

      let apiError: ApiError = {
        message: 'Failed to analyze images. Please try again.',
      };

      const errorMsg = error?.message?.toLowerCase() || '';
      const errorCode = error?.code?.toLowerCase() || '';

      if (errorMsg.includes('api') || errorMsg.includes('gemini') || errorCode.includes('api')) {
        apiError = {
          code: 'API_KEY_ERROR',
          message: 'API configuration error.',
          details: 'Check that your Gemini API key is valid and has quota available.',
        };
      } else if (errorMsg.includes('timeout') || errorMsg.includes('time out') || errorMsg.includes('deadline')) {
        apiError = {
          code: 'TIMEOUT',
          message: 'Analysis took too long.',
          details: 'Try using fewer images or with clearer photos.',
        };
      } else if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('connection')) {
        apiError = {
          code: 'NETWORK_ERROR',
          message: 'Network connection failed.',
          details: 'Check your internet connection and try again.',
        };
      } else if (errorMsg.includes('no recipes') || errorMsg.includes('no response')) {
        apiError = {
          code: 'NO_RECIPES',
          message: 'Could not generate recipes.',
          details: 'The images might not show clear ingredients. Try different photos.',
        };
      } else if (errorMsg.includes('invalid') || errorMsg.includes('malformed')) {
        apiError = {
          code: 'INVALID_RESPONSE',
          message: 'Invalid response from AI.',
          details: 'Try again with different images.',
        };
      }

      setError(apiError);
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setError(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-screen w-full relative bg-black overflow-hidden flex flex-col"
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
                {selectedImages.length} ingredient photo{selectedImages.length !== 1 ? 's' : ''} • Finding recipes
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

        {/* Bottom Controls */}
        <div className="w-full pb-24 px-6 flex flex-col items-center gap-4 pointer-events-auto">
          {/* Image Thumbnails */}
          <AnimatePresence>
            {selectedImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex gap-3 flex-wrap justify-center max-w-sm"
              >
                {selectedImages.map((img, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative"
                  >
                    <img
                      src={img.preview}
                      alt={`Selected ${idx + 1}`}
                      className="w-16 h-16 rounded-lg object-cover border-2 border-white/60"
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={cameraInputRef}
              onChange={handleCameraFileChange}
              className="hidden"
            />
            <input
              type="file"
              accept="image/*"
              multiple
              ref={galleryInputRef}
              onChange={handleGalleryFileChange}
              className="hidden"
            />

            {/* Camera Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCameraClick}
              className="w-16 h-16 rounded-full border-4 border-white/80 flex items-center justify-center p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
            >
              <motion.div
                animate={{ backgroundColor: ["rgba(255,255,255,0.5)", "rgba(255,255,255,0.8)", "rgba(255,255,255,0.5)"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full rounded-full backdrop-blur-md border border-white/70"
              ></motion.div>
            </motion.button>

            {/* Gallery Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGalleryClick}
              className="w-16 h-16 rounded-full bg-white/40 backdrop-blur-md border border-white/60 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
            >
              <ImageIcon className="w-7 h-7 text-white" />
            </motion.button>
          </div>

          {/* Analyze Button */}
          <AnimatePresence>
            {selectedImages.length > 0 && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                onClick={handleAnalyze}
                disabled={isProcessing}
                className="w-full max-w-xs h-14 rounded-full text-white font-semibold text-sm uppercase tracking-wider shadow-[0_8px_32px_rgba(0,0,0,0.3)] disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 transition-all active:scale-95"
                style={{ backgroundColor: '#5A7D9A' }}
              >
                Use these {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Help Text */}
          <p className="text-white/70 text-xs text-center max-w-xs">
            {selectedImages.length === 0
              ? '📷 Take a photo of ingredients or 🖼️ select from gallery'
              : '✅ Add more photos for better recipe suggestions'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
