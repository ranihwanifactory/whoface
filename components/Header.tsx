import React, { useState } from 'react';
import { Wand2, Share2, Check, Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleShareApp = async () => {
    const shareData = {
      title: '✨ 마법의 닮은꼴 거울',
      text: '마법 거울아, 세상에서 내가 누구랑 제일 닮았니? 🧚‍♀️',
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="w-full py-6 flex flex-col items-center justify-center text-center px-4 relative z-10">
      <button 
        onClick={handleShareApp}
        className="absolute top-4 right-4 p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all hover:scale-110 border-2 border-white/30 shadow-lg backdrop-blur-md"
        aria-label="친구에게 자랑하기"
      >
        {copied ? <Check className="w-6 h-6 text-yellow-300" /> : <Share2 className="w-6 h-6" />}
      </button>

      <div className="animate-bounce-slow mb-2 relative">
        <div className="absolute -top-4 -right-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-yellow-300" />
        </div>
        <div className="absolute -bottom-2 -left-4 animate-pulse delay-100">
            <Sparkles className="w-6 h-6 text-pink-300" />
        </div>
        <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-[0_0_20px_rgba(139,92,246,0.5)] border-4 border-white/20 transform rotate-3">
          <Wand2 className="w-10 h-10 text-white" />
        </div>
      </div>
      
      <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)] tracking-tight mt-4" 
          style={{ textShadow: '3px 3px 0px #7c3aed' }}>
        마법의 닮은꼴 거울
      </h1>
      
      <div className="mt-4 bg-white/10 backdrop-blur-md rounded-full px-6 py-2 border border-white/20 shadow-xl">
        <p className="text-white md:text-lg font-bold flex items-center gap-2">
          <span className="text-2xl">🧚‍♀️</span>
          거울아 거울아, 내가 누구랑 닮았니?
          <span className="text-2xl">✨</span>
        </p>
      </div>
    </header>
  );
};

export default Header;