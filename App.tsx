import React, { useState } from 'react';
import Header from './components/Header';
import UploadArea from './components/UploadArea';
import ResultCard from './components/ResultCard';
import { useInstallPrompt } from './components/InstallPrompt';
import { analyzeImage } from './services/geminiService';
import { ImageFile, AnalysisResult } from './types';
import { RefreshCw, Share2, AlertCircle, Check, Download, Share, PlusSquare } from 'lucide-react';

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareBtnText, setShareBtnText] = useState('결과 공유');
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  
  // PWA Install Hook
  const { isNativeInstallable, isIOS, triggerInstall } = useInstallPrompt();
  
  // 설치 버튼 표시 여부: 네이티브 설치가 가능하거나 iOS인 경우
  const showInstallButton = isNativeInstallable || isIOS;

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

  const handleInstallClick = () => {
    if (isNativeInstallable) {
      triggerInstall();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 pb-20">
      <div className="max-w-7xl mx-auto px-5 relative z-10">
        <Header />

        {/* Layout Container */}
        <div className={`mt-2 transition-all duration-500 ${result ? 'lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start' : 'max-w-xl mx-auto'}`}>
          
          {/* Left Column: Upload / Image Display */}
          <section className={`${result ? 'lg:sticky lg:top-8' : ''}`}>
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

          {/* Right Column: Results & Actions */}
          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 flex items-start gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-relaxed">{error}</p>
              </div>
            )}

            {/* Results Section */}
            {result && (
              <section className="animate-slide-up pb-10 mt-8 lg:mt-0">
                <div className="flex flex-col items-center pb-4">
                  <p className="text-center text-slate-600 mb-6 px-4 py-3 bg-white rounded-xl border border-slate-100 shadow-sm text-sm w-full">
                     ✨ {result.overallComment}
                  </p>

                  <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
                    {/* Rank 1 takes full width */}
                    <div className="md:col-span-2 lg:col-span-1">
                      <ResultCard match={result.matches[0]} />
                    </div>
                    
                    {/* Other Ranks */}
                    {result.matches.slice(1).map((match) => (
                      <ResultCard key={match.rank} match={match} />
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 mt-4">
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
                      onClick={handleInstallClick}
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

      {/* iOS Install Guide Modal */}
      {showIOSGuide && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowIOSGuide(false)}
        >
          <div 
            className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 text-center shadow-2xl space-y-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl mx-auto flex items-center justify-center text-indigo-600 mb-2">
              <Download className="w-7 h-7" />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-slate-900">아이폰에 앱 설치하기</h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                아이폰(iOS)에서는 아래 방법으로<br/>홈 화면에 앱을 추가할 수 있습니다.
              </p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4 text-left space-y-4 text-sm text-slate-700 border border-slate-100">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-6 h-6 bg-slate-200 rounded-full font-bold text-xs shrink-0 mt-0.5">1</div>
                <div>
                  화면 하단의 <span className="inline-flex items-center px-1.5 py-0.5 bg-slate-200 rounded text-xs font-bold mx-1"><Share className="w-3 h-3 mr-1" />공유</span> 버튼을 누르세요.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-6 h-6 bg-slate-200 rounded-full font-bold text-xs shrink-0 mt-0.5">2</div>
                <div>
                  메뉴에서 <span className="inline-flex items-center px-1.5 py-0.5 bg-slate-200 rounded text-xs font-bold mx-1"><PlusSquare className="w-3 h-3 mr-1" />홈 화면에 추가</span>를 찾아 선택하세요.
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              확인했습니다
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;