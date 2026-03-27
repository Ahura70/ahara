import { motion } from 'motion/react';

export function RecipeCardSkeleton() {
  return (
    <div className="snap-center shrink-0 w-[85vw] max-w-sm h-full max-h-[520px] glass-panel rounded-[24px] flex flex-col relative overflow-hidden">
      {/* Image Half */}
      <motion.div
        className="h-[50%] w-full bg-gradient-to-r from-white/20 to-white/10"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* Details Half */}
      <div className="h-[50%] p-6 flex flex-col justify-between">
        {/* Title Skeleton */}
        <motion.div
          className="space-y-2 mb-4"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="h-6 bg-gradient-to-r from-white/20 to-white/10 rounded-lg w-3/4" />
          <div className="h-4 bg-gradient-to-r from-white/20 to-white/10 rounded-lg w-full" />
          <div className="h-4 bg-gradient-to-r from-white/20 to-white/10 rounded-lg w-2/3" />
        </motion.div>

        {/* Time & Calories Skeleton */}
        <motion.div
          className="flex gap-3 mb-4"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="h-4 bg-gradient-to-r from-white/20 to-white/10 rounded w-24" />
          <div className="h-4 bg-gradient-to-r from-white/20 to-white/10 rounded w-24" />
        </motion.div>

        {/* Macros Skeleton */}
        <motion.div
          className="bg-white/40 rounded-full py-3 px-5 flex justify-between mb-4"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="h-3 bg-white/40 rounded w-12" />
            <div className="h-4 bg-white/40 rounded w-10" />
          </div>
          <div className="w-px h-8 bg-white/60" />
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="h-3 bg-white/40 rounded w-12" />
            <div className="h-4 bg-white/40 rounded w-10" />
          </div>
          <div className="w-px h-8 bg-white/60" />
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="h-3 bg-white/40 rounded w-12" />
            <div className="h-4 bg-white/40 rounded w-10" />
          </div>
        </motion.div>

        {/* Buttons Skeleton */}
        <motion.div
          className="flex gap-3"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="flex-1 h-12 bg-gradient-to-r from-white/20 to-white/10 rounded-full" />
          <div className="w-12 h-12 bg-gradient-to-r from-white/20 to-white/10 rounded-full" />
          <div className="flex-1 h-12 bg-gradient-to-r from-white/20 to-white/10 rounded-full" />
        </motion.div>
      </div>
    </div>
  );
}
