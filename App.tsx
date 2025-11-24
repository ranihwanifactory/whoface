import React, { useState } from 'react';
import Header from './components/Header';
import UploadArea from './components/UploadArea';
import ResultCard from './components/ResultCard';
import { analyzeImage } from './services/geminiService';
import { ImageFile, AnalysisResult } from './types';
import { RefreshCw, Camera, AlertCircle, Share2 } from 'lucide-react';

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    if (navigator.share && result) {
      try {
        await navigator.share({
          title: '내 닮은꼴 연예인 찾기 결과',
          text: `제 닮은꼴 1위는 ${result.matches[0].name} (${result.matches[0].similarity}%) 입니다! 당신도 확인해보세요.`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      alert('공유하기 기능이 지원되지 않는 브라우저입니다.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 pb-20">
      
      <div className="max-w-2xl mx-auto px-4">
        <Header />

        <div className="space-y-8">
          {/* Section 1: Upload */}
          <section className="animate-fade-in-up">
            <UploadArea 
              onImageSelected={handleImageSelected} 
              selectedImage={selectedImage}
              isLoading={isLoading}
            />
            
            {/* Action Button */}
            {selectedImage && !result && !isLoading && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleAnalyze}
                  className="group relative inline-flex items-center justify-center px-8 py-3.5 text-lg font-bold text-white transition-all duration-200 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5"
                >
                  <Camera className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                  닮은꼴 찾기 시작
                </button>
              </div>
            )}
          </section>

          {/* Section 2: Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200 flex items-center gap-3 animate-fade-in">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Section 3: Results */}
          {result && (
            <section className="space-y-6 animate-fade-in-up">
              <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-xl">
                <h2 className="text-2xl font-bold text-center mb-2">분석 결과</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full mb-6"></div>
                
                <p className="text-center text-slate-300 mb-8 font-medium leading-relaxed bg-indigo-900/20 p-4 rounded-xl border border-indigo-500/20">
                  "{result.overallComment}"
                </p>

                <div className="space-y-4">
                  {result.matches.map((match) => (
                    <ResultCard key={match.rank} match={match} />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-center pt-4">
                <button
                  onClick={handleReset}
                  className="flex items-center px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 font-medium transition-colors border border-slate-700"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  다른 사진으로 다시하기
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center px-6 py-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-full font-medium transition-colors border border-indigo-500/30"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  결과 공유하기
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
