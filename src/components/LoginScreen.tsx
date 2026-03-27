import React, { useState } from 'react';
import { motion } from 'motion/react';
import { signInWithGoogle, signInWithApple, signInAsGuest } from '../lib/auth';
import { Loader2, AlertCircle } from 'lucide-react';

export interface LoginScreenProps {
  onSuccess: () => void;
}

export function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setActiveProvider('google');

    try {
      await signInWithGoogle();
      onSuccess();
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else if (err?.code === 'auth/cancelled-popup-request') {
        setError('Another sign-in attempt is in progress.');
      } else {
        setError('Failed to sign in with Google. Please try again.');
      }
      setActiveProvider(null);
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    setError(null);
    setActiveProvider('apple');

    try {
      await signInWithApple();
      onSuccess();
    } catch (err: any) {
      console.error('Apple sign-in error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else if (err?.code === 'auth/cancelled-popup-request') {
        setError('Another sign-in attempt is in progress.');
      } else {
        setError('Failed to sign in with Apple. Please try again.');
      }
      setActiveProvider(null);
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setLoading(true);
    setError(null);
    setActiveProvider('guest');

    try {
      await signInAsGuest();
      onSuccess();
    } catch (err: any) {
      console.error('Guest sign-in error:', err);
      setError('Failed to continue as guest. Please try again.');
      setActiveProvider(null);
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-screen w-full bg-gradient-to-b from-[#88C0D0] to-[#E5E9F0] flex flex-col items-center justify-center px-6 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="text-6xl font-bold text-white mb-2 drop-shadow-lg font-display">
            Āhāra
          </div>
          <p className="text-lg text-white/80">
            Discover recipes from your ingredients
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}

        {/* Auth Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-4"
        >
          {/* Google Sign-In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading && activeProvider !== 'google'}
            className="w-full h-14 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-3 font-medium text-gray-900 hover:bg-gray-50 active:scale-95"
          >
            {loading && activeProvider === 'google' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {loading && activeProvider === 'google' ? 'Signing in...' : 'Sign in with Google'}
          </button>

          {/* Apple Sign-In */}
          <button
            onClick={handleAppleSignIn}
            disabled={loading && activeProvider !== 'apple'}
            className="w-full h-14 bg-black rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-3 font-medium text-white hover:bg-gray-900 active:scale-95"
          >
            {loading && activeProvider === 'apple' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 13.5c-.91 0-1.82.55-2.25 1.51.93.64 1.54 1.79 1.54 3.22 0 2.03-1.71 3.68-3.81 3.68-2.04 0-3.63-1.6-3.63-3.68 0-1.43.61-2.58 1.54-3.22-.43-.96-1.34-1.51-2.25-1.51-2.04 0-3.71 1.66-3.71 3.68 0 2.03 1.67 3.68 3.71 3.68.91 0 1.82-.55 2.25-1.51-.93-.64-1.54-1.79-1.54-3.22 0-2.03 1.71-3.68 3.81-3.68 2.04 0 3.63 1.6 3.63 3.68 0 1.43-.61 2.58-1.54 3.22.43.96 1.34 1.51 2.25 1.51 2.04 0 3.71-1.66 3.71-3.68 0-2.02-1.67-3.68-3.71-3.68zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              </svg>
            )}
            {loading && activeProvider === 'apple' ? 'Signing in...' : 'Sign in with Apple'}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-white/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 text-white/70 bg-gradient-to-b from-[#88C0D0] to-[#E5E9F0]">
                or
              </span>
            </div>
          </div>

          {/* Guest Sign-In */}
          <button
            onClick={handleGuestSignIn}
            disabled={loading && activeProvider !== 'guest'}
            className="w-full h-14 bg-white/20 border-2 border-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-3 font-medium text-white hover:bg-white/30 active:scale-95 backdrop-blur-sm"
          >
            {loading && activeProvider === 'guest' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </>
            )}
            {loading && activeProvider === 'guest' ? 'Continuing...' : 'Continue as Guest'}
          </button>
        </motion.div>

        {/* Info Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center text-sm text-white/70 mt-8"
        >
          Sign in to save your preferences and recipes. Guest mode doesn't save data across sessions.
        </motion.p>
      </div>
    </motion.div>
  );
}
