import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, X, UploadCloud, Loader2 } from 'lucide-react';
import { ImageFile } from '../types';

interface UploadAreaProps {
  onImageSelected: (image: ImageFile | null) => void;
  selectedImage: ImageFile | null;
  isLoading: boolean;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onImageSelected, selectedImage, isLoading }) => {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
    // Reset value to allow selecting the same file again if needed
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageSelected(null);
  };

  const triggerCamera = (e: React.MouseEvent) => {
    e.stopPropagation();
    cameraInputRef.current?.click();
  };

  const triggerGallery = (e: React.MouseEvent) => {
    e.stopPropagation();
    galleryInputRef.current?.click();
  };

  if (selectedImage) {
    return (
      <div className="relative w-full max-w-sm mx-auto aspect-[3/4] rounded-2xl overflow-hidden shadow-lg bg-slate-50 border border-slate-100">
        <img 
          src={selectedImage.preview} 
          alt="Preview" 
          className="w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 bg-black/20 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
          {!isLoading && (
            <button 
              onClick={handleClear}
              className="bg-white/90 text-slate-700 px-4 py-2 rounded-full shadow-sm font-medium text-sm hover:bg-white transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              사진 변경
            </button>
          )}
        </div>
        
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 p-6 text-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-lg font-bold text-slate-800">분석 중입니다</p>
            <p className="text-slate-500 text-sm mt-2">얼굴 특징을 스캔하고 있어요...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Hidden Inputs */}
      <input
        type="file"
        ref={galleryInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        capture="user" // This forces camera launch on mobile
      />
      
      <div
        onClick={triggerGallery} // Default click opens gallery
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          aspect-[4/5] rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer
          flex flex-col items-center justify-center p-6 bg-white
          ${isDragging 
            ? 'border-indigo-400 bg-indigo-50' 
            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
          }
        `}
      >
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 text-slate-400">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-2">사진 업로드</h3>
        <p className="text-slate-500 text-sm text-center leading-relaxed max-w-[200px]">
          아래 버튼을 눌러 촬영하거나<br/>앨범에서 선택하세요
        </p>

        <div className="mt-8 flex gap-3 w-full max-w-[240px]">
          {/* Camera Button */}
          <button 
            onClick={triggerCamera}
            className="flex-1 bg-indigo-50 py-3 rounded-xl flex items-center justify-center gap-2 text-indigo-600 text-sm font-medium hover:bg-indigo-100 transition-colors"
          >
            <Camera className="w-4 h-4" />
            촬영
          </button>
          
          {/* Gallery Button */}
          <button 
            onClick={triggerGallery}
            className="flex-1 bg-slate-100 py-3 rounded-xl flex items-center justify-center gap-2 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            앨범
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadArea;