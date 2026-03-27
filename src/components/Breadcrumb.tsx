import { useAppStore } from '../store';
import { ChevronLeft } from 'lucide-react';

export function Breadcrumb() {
  const { navigationHistory, goBack } = useAppStore();

  if ((navigationHistory?.length ?? 0) === 0) return null;

  return (
    <button 
      onClick={goBack}
      className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary/80 transition-colors px-4 py-2"
    >
      <ChevronLeft className="w-4 h-4" />
      Back
    </button>
  );
}
