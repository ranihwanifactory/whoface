import React, { useState, useEffect } from 'react';
import { Download, X, Share as ShareIcon } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    // Check if standalone (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

    if (isIOSDevice && !isStandalone) {
      // Show iOS instruction after a small delay
      const timer = setTimeout(() => {
        // Simple heuristic: don't show if user closed it before in this session (could use localStorage for persistence)
        setShowPrompt(true);
      }, 3000);
      setIsIOS(true);
      return () => clearTimeout(timer);
    }

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

  const handleClose = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-slate-800/90 backdrop-blur-md border border-indigo-500/30 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">앱 설치하기</h3>
            <p className="text-xs text-slate-300">
              {isIOS 
                ? "홈 화면에 추가하여 앱처럼 사용하세요" 
                : "더 빠르고 편리하게 이용하세요"}
            </p>
          </div>
        </div>

        {isIOS ? (
          <div className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-900/30 px-3 py-1.5 rounded-lg">
            <span><ShareIcon className="w-3 h-3 inline mb-0.5" /> 공유 &gt; 홈 화면에 추가</span>
            <button onClick={handleClose} className="ml-2 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
            >
              설치
            </button>
            <button onClick={handleClose} className="p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallPrompt;