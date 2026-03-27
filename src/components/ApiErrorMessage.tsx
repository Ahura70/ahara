import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { motion } from 'motion/react';

export interface ApiError {
  code?: string;
  message: string;
  details?: string;
}

export interface ApiErrorMessageProps {
  error: ApiError | string;
  onRetry?: () => void;
  onDismiss?: () => void;
  title?: string;
}

export function ApiErrorMessage({ error, onRetry, onDismiss, title }: ApiErrorMessageProps) {
  const errorObj = typeof error === 'string' ? { message: error } : error;

  const getErrorMessage = () => {
    if (errorObj.code === 'API_KEY_ERROR') {
      return 'API configuration error. Please try again.';
    }
    if (errorObj.code === 'RATE_LIMIT') {
      return 'Too many requests. Please wait a moment and try again.';
    }
    if (errorObj.code === 'NETWORK_ERROR') {
      return 'Network connection failed. Please check your internet.';
    }
    if (errorObj.code === 'TIMEOUT') {
      return 'Request took too long. Please try again.';
    }
    return errorObj.message || 'Something went wrong. Please try again.';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="fixed bottom-6 left-6 right-6 max-w-sm mx-auto z-50"
    >
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 shadow-lg">
        <div className="flex gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-red-900 mb-1">
              {title || 'Error'}
            </h3>
            <p className="text-sm text-red-800 mb-3">
              {getErrorMessage()}
            </p>
            {errorObj.details && (
              <p className="text-xs text-red-700 mb-3 opacity-75">
                {errorObj.details}
              </p>
            )}
            <div className="flex gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="flex-1 h-9 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="flex-1 h-9 rounded-lg bg-red-200 text-red-900 text-sm font-semibold hover:bg-red-300 transition-colors"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
