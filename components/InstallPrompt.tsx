import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Only show prompt if not in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-slide-up">
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="font-bold text-sm mb-0.5">앱 설치하기</p>
          <p className="text-xs text-slate-400">더 빠르고 편하게 이용해보세요.</p>
        </div>
        <div className="flex items-center gap-3">
            <button
              onClick={handleInstallClick}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
            >
              설치
            </button>
            <button 
              onClick={() => setShowPrompt(false)} 
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;