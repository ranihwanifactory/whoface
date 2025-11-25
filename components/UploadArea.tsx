import React, { useState, useRef, useCallback } from 'react';
import { Camera, Image as ImageIcon, X, Stars, Sparkles } from 'lucide-react';
import { ImageFile } from '../types';

interface UploadAreaProps {
  onImageSelected: (image: ImageFile | null) => void;
  selectedImage: ImageFile | null;
  isLoading: boolean;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onImageSelected, selectedImage, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 마법 거울에 보여줄 수 있어요! 🖼️');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64Data = result.split(',')[1];
      
      onImageSelected({
        file,
        preview: result,
        base64: base64Data,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (selectedImage) {
    return (
      <div className="relative group w-full max-w-md mx-auto aspect-[3/4] sm:aspect-[4/5] rounded-[2rem] overflow-hidden border-[6px] border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.4)] bg-slate-900 transition-all duration-300 transform hover:scale-[1.02]">
        <img 
          src={selectedImage.preview} 
          alt="미리보기" 
          className="w-full h-full object-cover"
        />
        
        {/* Decorative Shine */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {!isLoading && (
            <button 
              onClick={handleClear}
              className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg transform hover:scale-110 transition-transform flex flex-col items-center"
            >
              <X className="w-8 h-8" />
              <span className="text-xs font-bold mt-1">다시 하기</span>
            </button>
          )}
        </div>
        
        {isLoading && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center backdrop-blur-sm z-10">
                <div className="relative mb-6">
                    <div className="w-24 h-24 border-8 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Stars className="w-10 h-10 text-yellow-300 animate-pulse" />
                    </div>
                </div>
                <p className="text-xl font-bold text-white animate-bounce">
                  마법을 부리는 중... 🧙‍♀️
                </p>
                <p className="text-purple-300 mt-2 text-sm">조금만 기다려줘!</p>
            </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-full max-w-md mx-auto aspect-[4/5] rounded-[2.5rem] border-[6px] border-dashed cursor-pointer
        flex flex-col items-center justify-center text-center p-6 transition-all duration-300 relative overflow-hidden
        ${isDragging 
          ? 'border-yellow-400 bg-yellow-400/20 scale-105 rotate-1' 
          : 'border-white/40 bg-white/10 hover:border-white hover:bg-white/20 hover:-translate-y-2'
        }
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-10 left-10 w-20 h-20 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-pink-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className={`
        w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-xl
        transform transition-transform duration-300 group-hover:scale-110 border-4 border-white/30
        ${isDragging ? 'animate-bounce' : ''}
      `}>
        {isDragging ? <Camera className="w-12 h-12 text-white" /> : <ImageIcon className="w-12 h-12 text-white" />}
      </div>

      <h3 className="text-2xl font-black text-white mb-3 drop-shadow-md">
        {isDragging ? '놓아주세요!' : '여기 얼굴 보여주기!'}
      </h3>
      
      <div className="bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
        <p className="text-white font-bold flex items-center gap-2">
           <Sparkles className="w-4 h-4 text-yellow-300" />
           사진을 찰칵! 또는 드래그
        </p>
      </div>
    </div>
  );
};

export default UploadArea;