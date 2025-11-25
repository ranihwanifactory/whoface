import React, { useState, useEffect } from 'react';
import { Download, X, Share as ShareIcon, Sparkles } from 'lucide-react';

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
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 backdrop-blur-lg border-2 border-yellow-400/50 p-4 rounded-3xl shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-400 p-2 rounded-xl shadow-lg">
            <Sparkles className="w-6 h-6 text-indigo-900" />
          </div>
          <div>
            <h3 className="font-black text-white text-base">마법 거울 보관하기</h3>
            <p className="text-xs text-indigo-200 font-medium">
              {isIOS 
                ? "홈 화면에 추가해서 언제든 사용해봐요!" 
                : "앱을 설치하고 친구들과 함께 놀아요!"}
            </p>
          </div>
        </div>

        {isIOS ? (
          <div className="flex items-center gap-2 text-xs text-white bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
            <span><ShareIcon className="w-3 h-3 inline mb-0.5" /> 공유 &gt; 홈 화면에 추가</span>
            <button onClick={handleClose} className="ml-2 text-indigo-200 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="bg-yellow-400 hover:bg-yellow-300 text-indigo-900 text-sm font-black px-4 py-2 rounded-xl transition-all shadow-md transform hover:scale-105"
            >
              설치
            </button>
            <button onClick={handleClose} className="p-2 text-indigo-300 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallPrompt;