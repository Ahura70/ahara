import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { analyzeIngredients } from '../../lib/gemini';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onDetected: (ingredients: Array<{ name: string; amount?: number; unit?: string }>) => void;
  title?: string;
}

export function BarcodeScanner({ isOpen, onClose, onDetected, title = 'Scan Barcode' }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      // Clean up when modal closes
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {
          // Ignore errors when stopping
        });
        scannerRef.current = null;
      }
      return;
    }

    initializeScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {
          // Ignore errors when stopping
        });
      }
    };
  }, [isOpen]);

  const initializeScanner = async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Create scanner instance
      const scanner = new Html5Qrcode('barcode-scanner');
      scannerRef.current = scanner;

      // Start scanning with rear camera
      await scanner.start(
        { facingMode: 'environment' }, // Use rear camera on mobile
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          disableFlip: false,
          aspectRatio: 1.0,
        },
        onBarcodeDetected,
        onScanFailure
      );
    } catch (err: any) {
      console.error('Scanner initialization error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on your device.');
      } else if (err.name === 'NotSupportedError') {
        setError('Camera scanning is not supported on your device.');
      } else {
        setError('Failed to initialize camera. Please try again.');
      }
      setIsScanning(false);
    }
  };

  const onBarcodeDetected = async (decodedText: string) => {
    // Only process if it's a new code and we're not already processing
    if (decodedText === lastScannedCode || isProcessing) {
      return;
    }

    setLastScannedCode(decodedText);
    setIsProcessing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log('Barcode detected:', decodedText);

      // Send to Gemini for product name and nutrition parsing
      const prompt = `This is a product barcode/UPC: "${decodedText}".

Based on this barcode number, identify:
1. The likely product name and brand
2. Key ingredients if known
3. Nutritional information

Respond in JSON format:
{
  "productName": "string",
  "brand": "string",
  "ingredients": [
    {
      "name": "ingredient name",
      "amount": number or null,
      "unit": "g/ml/etc" or null
    }
  ],
  "confidence": "high/medium/low"
}

If you cannot identify the product with confidence, set confidence to "low" and provide your best guess.`;

      const response = await analyzeIngredients(prompt);

      if (response && response.ingredients && Array.isArray(response.ingredients)) {
        setSuccessMessage(`Found: ${response.productName || 'Product detected'}`);
        onDetected(response.ingredients);

        // Keep success message visible for 2 seconds before closing
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError('Could not parse product information. Please try another barcode or enter manually.');
      }
    } catch (err: any) {
      console.error('Barcode processing error:', err);
      setError('Failed to process barcode. Please try another or enter manually.');
    } finally {
      setIsProcessing(false);
      // Reset last scanned code after 3 seconds to allow rescanning
      setTimeout(() => {
        setLastScannedCode(null);
      }, 3000);
    }
  };

  const onScanFailure = (error: any) => {
    // Suppress error messages during normal scanning
    // Only log if it's a critical error
    if (error && error.message && !error.message.includes('QR code parse error')) {
      console.debug('Scan attempt:', error.message);
    }
  };

  const handleManualEntry = () => {
    // Fallback: user can manually enter barcode
    const manualCode = prompt('Enter barcode number manually:');
    if (manualCode) {
      onBarcodeDetected(manualCode);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black text-white px-6 py-4 flex items-center justify-between border-b border-gray-700">
        <h1 className="text-xl font-bold">{title}</h1>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Scanner Container */}
      <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden">
        {isScanning ? (
          <div
            ref={containerRef}
            id="barcode-scanner"
            className="w-full h-full"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#000',
            }}
          />
        ) : (
          <div className="text-center text-white">
            <Loader2 size={48} className="mx-auto mb-4 animate-spin" />
            <p>Initializing camera...</p>
          </div>
        )}

        {/* Scanning frame overlay */}
        {isScanning && !error && !successMessage && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="relative"
              style={{
                width: 250,
                height: 250,
                border: '3px solid #00ff00',
                borderRadius: '8px',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
              }}
            >
              {/* Animated corners */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-400"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-400"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-400"></div>
            </div>
          </div>
        )}
      </div>

      {/* Status Messages */}
      <div className="bg-gray-900 px-6 py-4 border-t border-gray-700 space-y-3">
        {successMessage && (
          <div className="flex items-center gap-3 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
            <CheckCircle2 size={24} className="text-green-500 flex-shrink-0" />
            <div>
              <p className="text-green-100 font-medium">{successMessage}</p>
              <p className="text-xs text-green-300">Adding to ingredients...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-100">{error}</p>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center gap-3 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
            <Loader2 size={20} className="text-blue-400 animate-spin flex-shrink-0" />
            <p className="text-sm text-blue-100">Processing barcode...</p>
          </div>
        )}

        {/* Instructions */}
        {!error && !successMessage && !isProcessing && (
          <div className="text-center text-gray-400 text-sm">
            <p>Point camera at barcode to scan</p>
            <button
              onClick={handleManualEntry}
              className="mt-2 text-blue-400 hover:text-blue-300 underline transition-colors"
            >
              Or enter manually
            </button>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
