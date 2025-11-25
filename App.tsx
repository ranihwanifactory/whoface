import React, { useState } from 'react';
import Header from './components/Header';
import UploadArea from './components/UploadArea';
import ResultCard from './components/ResultCard';
import { useInstallPrompt } from './components/InstallPrompt';
import { analyzeImage } from './services/geminiService';
import { ImageFile, AnalysisResult } from './types';
import { RefreshCw, Share2, AlertCircle, Check, Download } from 'lucide-react';

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareBtnText, setShareBtnText] = useState('결과 공유');
  
  // PWA Install Hook
  const { showInstallButton, triggerInstall } = useInstallPrompt();

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
      setError(err.message || '분석 중 오류가 발생했습니다.');
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
      title: 'AI 닮은꼴 분석 결과',
      text: `제 닮은꼴 1위는 ${result.matches[0].name} (${result.matches[0].similarity}%) 입니다.`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareBtnText('주소 복사됨');
        setTimeout(() => setShareBtnText('결과 공유'), 2000);
      }
    } catch (err) {
      console.log('Share error', err);
      await navigator.clipboard.writeText(window.location.href);
      setShareBtnText('주소 복사됨');
      setTimeout(() => setShareBtnText('결과 공유'), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 pb-20">
      <div className="max-w-md mx-auto px-5 relative z-10">
        <Header />

        <div className="space-y-6 mt-2">
          {/* Main Content Area */}
          <section className="transition-all duration-500">
            <UploadArea 
              onImageSelected={handleImageSelected} 
              selectedImage={selectedImage}
              isLoading={isLoading}
            />
            
            {/* Analyze Button */}
            {selectedImage && !result && !isLoading && (
              <div className="mt-8 flex justify-center animate-fade-in">
                <button
                  onClick={handleAnalyze}
                  className="w-full bg-slate-900 text-white text-lg font-bold py-4 rounded-2xl shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98]"
                >
                  분석 시작하기
                </button>
              </div>
            )}
          </section>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium leading-relaxed">{error}</p>
            </div>
          )}

          {/* Results Section */}
          {result && (
            <section className="space-y-6 animate-slide-up pb-10">
              <div className="flex flex-col items-center pt-8 pb-4">
                <p className="text-center text-slate-600 mb-6 px-4 py-3 bg-white rounded-xl border border-slate-100 shadow-sm text-sm">
                   ✨ {result.overallComment}
                </p>

                <div className="w-full space-y-3">
                  {result.matches.map((match) => (
                    <ResultCard key={match.rank} match={match} />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleReset}
                  className={`flex items-center justify-center px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm ${showInstallButton ? 'col-span-2' : ''}`}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  다시 하기
                </button>
                
                <button
                  onClick={handleShare}
                  className={`flex items-center justify-center px-4 py-3.5 rounded-xl font-bold text-sm transition-colors shadow-sm ${
                    shareBtnText.includes('복사')
                      ? 'bg-green-500 text-white border border-green-500'
                      : 'bg-indigo-600 text-white border border-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {shareBtnText.includes('복사') ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                  {shareBtnText}
                </button>

                {showInstallButton && (
                  <button
                    onClick={triggerInstall}
                    className="flex items-center justify-center px-4 py-3.5 bg-slate-900 text-white border border-slate-900 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    앱 설치
                  </button>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;