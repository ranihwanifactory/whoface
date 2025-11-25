import React, { useState } from 'react';
import { ScanFace, Share2, Check } from 'lucide-react';

const Header: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleShareApp = async () => {
    const shareData = {
      title: 'AI 닮은꼴 분석',
      text: 'AI가 분석해주는 내 닮은꼴 연예인은 누구일까요?',
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
    <header className="w-full py-8 px-4 flex flex-col items-center justify-center relative">
      <button 
        onClick={handleShareApp}
        className="absolute top-6 right-4 p-2.5 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="공유하기"
      >
        {copied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
      </button>

      <div className="flex items-center gap-2 mb-2">
        <div className="p-2.5 bg-indigo-50 rounded-xl">
          <ScanFace className="w-6 h-6 text-indigo-600" />
        </div>
        <span className="text-sm font-semibold text-indigo-600 tracking-wide uppercase">AI Image Analysis</span>
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight text-center">
        AI 닮은꼴 분석
      </h1>
      
      <p className="mt-3 text-slate-500 text-center max-w-sm leading-relaxed text-sm md:text-base">
        최신 AI가 당신의 얼굴 특징을 정밀 분석하여<br/>가장 닮은 연예인을 찾아드립니다.
      </p>
    </header>
  );
};

export default Header;