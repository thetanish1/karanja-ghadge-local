import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

export const InstallPwaBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (installed)
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Listen for beforeinstallprompt on Android/Chrome
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  if (isStandalone || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-3 py-2 text-xs flex items-center justify-between gap-2 shadow-md">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
          <Download className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="font-bold">Install Karanjaghadge App</div>
          <div className="text-[11px] text-emerald-100">
            {isIos
              ? 'Tap Share ⎋ then "Add to Home Screen" ➕ for iOS'
              : 'Fast & lightweight Android app, works offline'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        {!isIos && deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="bg-white text-emerald-800 font-bold px-3 py-1 rounded-md text-xs shadow hover:bg-emerald-50 transition"
          >
            Install
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-white/10 rounded-full text-emerald-100"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
