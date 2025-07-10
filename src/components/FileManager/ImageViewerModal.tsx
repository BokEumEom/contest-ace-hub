import React, { memo, useState, useEffect } from 'react';
import { Eye, ZoomIn, ZoomOut, RotateCw, Download as DownloadIcon, RefreshCw, X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileItem, FileService } from '@/services/fileService';
import { useImageCache } from './hooks/useImageCache';

interface ImageViewerModalProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (file: FileItem) => void;
}

const ImageViewerModal = memo(({ 
  file, 
  isOpen, 
  onClose, 
  onDownload 
}: ImageViewerModalProps) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  
  // 이미지 캐싱 훅 사용
  const {
    isLoading,
    isLoaded,
    isFailed,
    cachedUrl,
    error,
    reload
  } = useImageCache(file?.url || null, {
    preloadOnMount: true,
    retryCount: 3,
    retryDelay: 1000,
  });

  // 모달이 열릴 때마다 초기화
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
    }
  }, [isOpen]);

  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.1));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  // 마우스 휠 줌 처리
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          handleRotate();
          break;

      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleZoomIn, handleZoomOut, handleRotate]);

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[95vh] w-[1200px] h-[900px] p-0 flex flex-col [&>button]:hidden">
        {/* 미니멀 툴바 */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-lg p-2 border border-white/20">
          {/* 줌 컨트롤 */}
          <div className="flex items-center gap-1 bg-white/10 rounded-md p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={scale <= 0.1}
              className="h-7 w-7 p-0 hover:bg-white/20 text-white"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs font-medium min-w-[50px] text-center text-white">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={scale >= 5}
              className="h-7 w-7 p-0 hover:bg-white/20 text-white"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>
          
          {/* 도구 버튼들 */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRotate}
              className="h-7 w-7 p-0 hover:bg-white/20 text-white"
              title="회전 (R)"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDownload(file)}
              className="h-7 w-7 p-0 hover:bg-white/20 text-white"
              title="다운로드"
            >
              <DownloadIcon className="h-3.5 w-3.5" />
            </Button>
          </div>
          
          {/* 닫기 버튼 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 ml-1 hover:bg-red-500/20 hover:text-red-300 text-white"
            title="닫기 (ESC)"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        {/* 이미지 뷰어 영역 - 전체 화면 */}
        <div className="w-full h-full relative bg-black overflow-hidden">
          {/* 로딩 상태 */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                <p className="text-white text-sm">이미지 로딩 중...</p>
              </div>
            </div>
          )}
          
          {/* 에러 상태 */}
          {isFailed && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
              <div className="text-center">
                <div className="text-red-400 mb-4 text-lg">이미지 로드 실패</div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={reload}
                  className="bg-white text-black hover:bg-gray-100"
                >
                  다시 시도
                </Button>
              </div>
            </div>
          )}
          
          {/* 이미지 표시 */}
          {isLoaded && (
            <div 
              className="w-full h-full flex items-center justify-center cursor-zoom-in"
              onWheel={handleWheel}
            >
              <img
                src={cachedUrl || file.url}
                alt={file.name}
                className="max-w-full max-h-full object-contain transition-all duration-300 ease-out select-none"
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                }}
                draggable={false}
              />
            </div>
          )}
          
          {/* 줌 레벨 표시 */}
          {isLoaded && scale !== 1 && (
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-medium">
              {Math.round(scale * 100)}%
            </div>
          )}
          
          {/* 회전 각도 표시 */}
          {isLoaded && rotation !== 0 && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-medium">
              {rotation}°
            </div>
          )}
        </div>
        
        {/* 프롬프트 정보 - 조건부 표시 */}
        {file.prompt && (
          <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white max-h-28 overflow-y-auto">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-3.5 w-3.5 text-blue-300 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-blue-200 mb-1">사용된 프롬프트</p>
                <p className="text-xs text-gray-200 leading-relaxed">{file.prompt}</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});

ImageViewerModal.displayName = 'ImageViewerModal';

export default ImageViewerModal; 