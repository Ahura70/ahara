import { Camera } from 'lucide-react';
import { motion } from 'motion/react';

export interface QuickScanFABProps {
  onClick: () => void;
}

export function QuickScanFAB({ onClick }: QuickScanFABProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-24 right-6 w-16 h-16 rounded-full shadow-lg transition-all flex items-center justify-center z-40 group"
      style={{ backgroundColor: '#5A7D9A' }}
      aria-label="Quick scan ingredients"
    >
      <div className="relative flex items-center justify-center">
        <Camera className="w-7 h-7 text-white" />
        {/* Animated ring effect */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full border-2 border-white/30"
        />
      </div>

      {/* Hover tooltip */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        whileHover={{ opacity: 1, x: 0 }}
        className="absolute right-20 bg-black/80 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap pointer-events-none"
      >
        Quick Scan
      </motion.div>
    </motion.button>
  );
}
