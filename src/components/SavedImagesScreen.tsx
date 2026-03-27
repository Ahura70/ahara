import { useAppStore } from '../store';
import { motion } from 'motion/react';
import { Breadcrumb } from './Breadcrumb';

export function SavedImagesScreen() {
  const { savedImages } = useAppStore();

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen flex flex-col pb-24 relative"
    >
      <header className="sticky top-0 z-40 glass-panel border-b border-white/40 px-6 py-4 flex justify-between items-center rounded-b-xl">
        <Breadcrumb />
        <h1 className="font-heading text-2xl font-semibold text-text-main">Saved Images</h1>
        <div className="w-10"></div>
      </header>

      <main className="p-6">
        {savedImages.length === 0 ? (
          <div className="text-center text-text-muted mt-10">
            No saved images yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {savedImages.map((image, index) => (
              <div key={index} className="glass-panel rounded-2xl overflow-hidden aspect-square">
                <img src={image} alt={`Saved ${index}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        )}
      </main>
    </motion.div>
  );
}
