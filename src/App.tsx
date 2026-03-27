import { AppProvider, useAppStore } from './store';
import { LoginScreen } from './components/Login';
import { PreferencesScreen } from './components/Preferences';
import { CameraScreen } from './components/Camera';
import { MatchesScreen } from './components/Matches';
import { PlannerScreen } from './components/Planner';
import { SavedImagesScreen } from './components/SavedImagesScreen';
import { BottomNav } from './components/BottomNav';
import { AnimatePresence, motion } from 'motion/react';

function AppContent() {
  const { currentScreen, showPreferencesPopup, setShowPreferencesPopup, setCurrentScreen, completePreferencesAndNavigate, workflowStage } = useAppStore();

  // Show bottom nav only after workflow is complete or if user is on login/preferences screens
  const shouldShowBottomNav = workflowStage === 'WorkflowComplete' || currentScreen === 'login' || currentScreen === 'preferences';

  return (
    <>
      <AnimatePresence mode="wait">
        {currentScreen === 'login' && <LoginScreen key="login" />}
        {currentScreen === 'preferences' && <PreferencesScreen key="preferences" />}
        {currentScreen === 'camera' && <CameraScreen key="camera" />}
        {currentScreen === 'matches' && <MatchesScreen key="matches" />}
        {currentScreen === 'planner' && <PlannerScreen key="planner" />}
        {currentScreen === 'gallery' && <SavedImagesScreen key="gallery" />}
      </AnimatePresence>
      {shouldShowBottomNav && <BottomNav />}

      {/* Popup */}
      {showPreferencesPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-[24px] p-8 max-w-sm w-full text-center"
          >
            <h3 className="text-xl font-heading font-semibold mb-4">Save Preferences?</h3>
            <p className="text-text-muted mb-8">Would you like to save these dietary preferences?</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowPreferencesPopup(false)}
                className="flex-1 h-12 rounded-full bg-white/50 text-text-main font-semibold hover:bg-white/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPreferencesPopup(false);
                  completePreferencesAndNavigate();
                }}
                className="flex-1 h-12 rounded-full text-white font-semibold hover:opacity-90 transition-all"
                style={{ backgroundColor: '#5A7D9A' }}
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
