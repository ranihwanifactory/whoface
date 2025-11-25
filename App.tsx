import React, { useState } from 'react';
import Header from './components/Header';
import UploadArea from './components/UploadArea';
import ResultCard from './components/ResultCard';
import InstallPrompt from './components/InstallPrompt';
import { analyzeImage } from './services/geminiService';
import { ImageFile, AnalysisResult } from './types';
import { RefreshCw, Zap, AlertCircle, Share2, Check, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareBtnText, setShareBtnText] = useState('결과 자랑하기');

  const handleImageSelected = (image: ImageFile | null) => {
    setSelectedImage(image);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await analyzeImage(selectedImage.base64, selectedImage.mimeType);
      setResult(data);
    } catch (err: any) {
      setError(err.message || '마법에 문제가 생겼어요!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = async () => {
    if (!result) return;

    const shareData = {
      title: '✨ 마법의 닮은꼴 찾기 결과',
      text: `내 닮은꼴 1위는 ${result.matches[0].name} (${result.matches[0].similarity}%)야! 정말 닮았나 봐! 🧚‍♀️`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareBtnText('주소 복사 완료!');
        setTimeout(() => setShareBtnText('결과 자랑하기'), 2000);
      }
    } catch (err) {
      console.log('Error sharing', err);
      await navigator.clipboard.writeText(window.location.href);
      setShareBtnText('주소 복사 완료!');
      setTimeout(() => setShareBtnText('결과 자랑하기'), 2000);
    }
  };

  return (
    // Magic/Game Theme Background
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-purple-900 to-slate-900 text-slate-100 pb-20 font-sans selection:bg-purple-500 selection:text-white">
      
      {/* Background Particles (Simulated with simple divs) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-10 w-4 h-4 bg-yellow-400 rounded-full animate-pulse opacity-50"></div>
        <div className="absolute top-1/3 right-20 w-3 h-3 bg-pink-400 rounded-full animate-bounce opacity-50 delay-700"></div>
        <div className="absolute bottom-1/4 left-1/3 w-6 h-6 bg-purple-400 rounded-full animate-pulse opacity-30 delay-300"></div>
      </div>

      <div className="max-w-2xl mx-auto px-4 relative z-10">
        <Header />

        <div className="space-y-8 mt-4">
          {/* Section 1: Upload */}
          <section className="animate-fade-in-up">
            <UploadArea 
              onImageSelected={handleImageSelected} 
              selectedImage={selectedImage}
              isLoading={isLoading}
            />
            
            {/* Start Button */}
            {selectedImage && !result && !isLoading && (
              <div className="mt-8 flex justify-center animate-bounce-slow">
                <button
                  onClick={handleAnalyze}
                  className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-black text-white transition-all duration-200 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full focus:outline-none ring-4 ring-purple-300 ring-offset-4 ring-offset-slate-900 hover:scale-105 shadow-[0_0_40px_rgba(168,85,247,0.6)]"
                >
                  <Zap className="w-8 h-8 mr-3 fill-yellow-300 text-yellow-300 animate-pulse" />
                  마법 거울에게 물어보기!
                </button>
              </div>
            )}
          </section>

          {/* Section 2: Error Message */}
          {error && (
            <div className="p-6 bg-red-500/20 border-2 border-red-400 rounded-3xl text-red-100 flex items-center gap-4 animate-shake shadow-lg backdrop-blur-md">
              <div className="bg-red-500 p-2 rounded-full">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <p className="font-bold text-lg">{error}</p>
            </div>
          )}

          {/* Section 3: Results */}
          {result && (
            <section className="space-y-6 animate-fade-in-up pb-10">
              {/* Confetti Effect (CSS only for simplicity) */}
              <div className="fixed inset-0 pointer-events-none flex justify-center overflow-hidden z-0">
                  <div className="w-2 h-2 bg-yellow-400 absolute top-10 left-1/4 animate-[spin_2s_linear_infinite]"></div>
                  <div className="w-2 h-2 bg-red-400 absolute top-20 right-1/4 animate-[bounce_2s_infinite]"></div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 border-2 border-white/10 shadow-2xl relative z-10">
                <div className="flex flex-col items-center mb-6">
                    <span className="text-4xl mb-2">🎉</span>
                    <h2 className="text-3xl font-black text-center text-white drop-shadow-md">분석 완료!</h2>
                    <div className="w-20 h-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mt-4"></div>
                </div>
                
                <div className="text-center text-white mb-8 font-bold text-lg leading-relaxed bg-gradient-to-r from-indigo-900/60 to-purple-900/60 p-6 rounded-2xl border border-indigo-400/30 shadow-inner">
                  <Sparkles className="inline w-5 h-5 text-yellow-300 mr-2" />
                  "{result.overallComment}"
                  <Sparkles className="inline w-5 h-5 text-yellow-300 ml-2" />
                </div>

                <div className="space-y-4">
                  {result.matches.map((match) => (
                    <ResultCard key={match.rank} match={match} />
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center px-6 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-white font-bold transition-all border-2 border-slate-600 hover:border-slate-500 shadow-lg"
                >
                  <RefreshCw className="w-6 h-6 mr-2" />
                  다른 친구도 해보기
                </button>
                
                <button
                  onClick={handleShare}
                  className={`flex-1 flex items-center justify-center px-6 py-4 rounded-2xl font-bold transition-all border-2 shadow-lg ${
                    shareBtnText.includes('완료') 
                    ? 'bg-green-600 text-white border-green-400' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400'
                  }`}
                >
                  {shareBtnText.includes('완료') ? <Check className="w-6 h-6 mr-2" /> : <Share2 className="w-6 h-6 mr-2" />}
                  {shareBtnText}
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
      
      <InstallPrompt />
    </div>
  );
};

export default App;