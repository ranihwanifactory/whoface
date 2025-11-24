import React, { useState } from 'react';
import { Sparkles, ScanFace, Share2, Check } from 'lucide-react';

const Header: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleShareApp = async () => {
    const shareData = {
      title: 'AI 닮은꼴 찾기',
      text: 'AI가 분석해주는 내 닮은꼴 연예인은 누구일까요? 지금 바로 확인해보세요!',
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
      // Fallback
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="w-full py-8 flex flex-col items-center justify-center text-center px-4 relative">
      <button 
        onClick={handleShareApp}
        className="absolute top-4 right-4 p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-full text-slate-400 hover:text-indigo-300 transition-colors border border-slate-700/50 backdrop-blur-sm"
        aria-label="앱 공유하기"
      >
        {copied ? <Check className="w-5 h-5 text-green-400" /> : <Share2 className="w-5 h-5" />}
      </button>

      <div className="flex items-center gap-2 mb-2">
        <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
          <ScanFace className="w-8 h-8 text-white" />
        </div>
      </div>
      <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 tracking-tight">
        AI 닮은꼴 찾기
      </h1>
      <p className="mt-4 text-slate-400 max-w-md text-lg">
        Gemini AI가 당신의 얼굴을 분석하여<br className="hidden sm:block" /> 
        <span className="text-indigo-400 font-semibold flex items-center justify-center gap-1 inline-flex">
          싱크로율 Top 5 <Sparkles className="w-4 h-4" />
        </span>
        연예인을 찾아드립니다.
      </p>
    </header>
  );
};

export default Header;