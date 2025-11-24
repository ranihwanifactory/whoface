import React from 'react';
import { Sparkles, ScanFace } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-8 flex flex-col items-center justify-center text-center px-4">
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