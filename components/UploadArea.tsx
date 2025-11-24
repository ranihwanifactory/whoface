import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, Image as ImageIcon, X, Sparkles } from 'lucide-react';
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
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Extract base64 data without prefix
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      <div className="relative group w-full max-w-md mx-auto aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden border-4 border-slate-700 shadow-2xl transition-all duration-300 hover:border-indigo-500/50">
        <img 
          src={selectedImage.preview} 
          alt="미리보기" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {!isLoading && (
            <button 
              onClick={handleClear}
              className="bg-red-500/90 hover:bg-red-600 text-white p-3 rounded-full transform hover:scale-110 transition-transform"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
        {isLoading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-10">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                    </div>
                </div>
                <p className="mt-4 text-indigo-200 font-medium animate-pulse">AI가 얼굴을 분석 중입니다...</p>
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
        w-full max-w-md mx-auto aspect-[4/3] rounded-2xl border-4 border-dashed cursor-pointer
        flex flex-col items-center justify-center text-center p-6 transition-all duration-300
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' 
          : 'border-slate-700 bg-slate-800/50 hover:border-indigo-400/50 hover:bg-slate-800'
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
      
      <div className={`
        w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center mb-4 transition-transform duration-300
        ${isDragging ? 'scale-110 bg-indigo-500/20 text-indigo-300' : 'text-slate-400 group-hover:text-indigo-300'}
      `}>
        {isDragging ? <UploadCloud className="w-10 h-10" /> : <ImageIcon className="w-10 h-10" />}
      </div>

      <h3 className="text-xl font-semibold text-white mb-2">
        {isDragging ? '여기에 놓으세요!' : '사진 업로드'}
      </h3>
      <p className="text-slate-400 text-sm max-w-[200px]">
        클릭하거나 이미지를 드래그하여 업로드하세요 (JPG, PNG)
      </p>
    </div>
  );
};

export default UploadArea;