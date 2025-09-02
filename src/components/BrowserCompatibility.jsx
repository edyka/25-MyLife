import { useState, useEffect } from 'react';
import { AlertTriangle, X, Shield } from 'lucide-react';

const BrowserCompatibility = ({ darkMode }) => {
  const [showBraveWarning, setShowBraveWarning] = useState(false);
  const [showStorageWarning, setShowStorageWarning] = useState(false);

  useEffect(() => {
    // Check for Brave browser
    const isBrave = (navigator.brave && navigator.brave.isBrave) || false;
    
    // Test localStorage availability
    let storageAvailable = true;
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
    } catch {
      storageAvailable = false;
    }

    if (isBrave) {
      setShowBraveWarning(true);
    }

    if (!storageAvailable) {
      setShowStorageWarning(true);
    }
  }, []);

  if (!showBraveWarning && !showStorageWarning) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      {showBraveWarning && (
        <div className={`mb-2 p-4 rounded-lg border shadow-lg ${
          darkMode 
            ? 'bg-orange-900/20 border-orange-600/30 text-orange-200' 
            : 'bg-orange-50 border-orange-200 text-orange-800'
        }`}>
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">Brave Browser Detected</h4>
              <p className="text-xs leading-relaxed mb-2">
                For the best experience, please disable Brave Shields for localhost by clicking the shield icon in your address bar.
              </p>
              <p className="text-xs opacity-80">
                This allows the app to save your data locally and function properly.
              </p>
            </div>
            <button
              onClick={() => setShowBraveWarning(false)}
              className="text-orange-500 hover:text-orange-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {showStorageWarning && (
        <div className={`p-4 rounded-lg border shadow-lg ${
          darkMode 
            ? 'bg-red-900/20 border-red-600/30 text-red-200' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">Storage Access Limited</h4>
              <p className="text-xs leading-relaxed mb-2">
                Your browser settings prevent local data storage. Your progress may not be saved between sessions.
              </p>
              <p className="text-xs opacity-80">
                Try disabling private/incognito mode or adjusting privacy settings.
              </p>
            </div>
            <button
              onClick={() => setShowStorageWarning(false)}
              className="text-red-500 hover:text-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowserCompatibility;