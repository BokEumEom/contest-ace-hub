import React, { memo, useState, useEffect, useRef } from 'react';
import { Eye, ZoomIn, ZoomOut, RotateCw, Download as DownloadIcon, RefreshCw, X, MessageSquare, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileItem, FileService } from '@/services/fileService';
import { useImageCache } from './hooks/useImageCache';
import { isImageFile, isVideoFile } from './utils/fileUtils';

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
  
  // 비디오 관련 상태
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoFailed, setIsVideoFailed] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  
  // 이미지 캐싱 훅 사용
  const {
    isLoading: isImageLoading,
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

  // 파일 타입 확인
  const isVideo = file ? isVideoFile(file.name) : false;
  const isImage = file ? isImageFile(file.name) : false;

  // 모달이 열릴 때마다 초기화
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      setShowControls(true);
      setIsVideoLoaded(false);
      setIsVideoFailed(false);
      setIsVideoLoading(false);
    }
  }, [isOpen]);

  // 비디오 로딩 상태 관리
  useEffect(() => {
    if (isOpen && isVideo && file) {
      setIsVideoLoading(true);
      setIsVideoLoaded(false);
      setIsVideoFailed(false);
    }
  }, [isOpen, isVideo, file]);

  // 이미지 관련 핸들러
  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.1));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  // 비디오 관련 핸들러
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleRetry = () => {
    if (videoRef.current) {
      setIsVideoFailed(false);
      setIsVideoLoading(true);
      videoRef.current.load();
    }
  };

  // 시간 포맷팅 함수
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 마우스 휠 줌 처리 (이미지만)
  const handleWheel = (e: React.WheelEvent) => {
    if (!isVideo) {
      e.preventDefault();
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
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
          if (isImage) {
            e.preventDefault();
            handleZoomIn();
          }
          break;
        case '-':
          if (isImage) {
            e.preventDefault();
            handleZoomOut();
          }
          break;
        case 'r':
        case 'R':
          if (isImage) {
            e.preventDefault();
            handleRotate();
          }
          break;
        case ' ':
          if (isVideo) {
            e.preventDefault();
            togglePlayPause();
          }
          break;
        case 'ArrowLeft':
          if (isVideo) {
            e.preventDefault();
            if (videoRef.current) {
              videoRef.current.currentTime = Math.max(0, currentTime - 10);
            }
          }
          break;
        case 'ArrowRight':
          if (isVideo) {
            e.preventDefault();
            if (videoRef.current) {
              videoRef.current.currentTime = Math.min(duration, currentTime + 10);
            }
          }
          break;
        case 'm':
        case 'M':
          if (isVideo) {
            e.preventDefault();
            toggleMute();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isImage, isVideo, currentTime, duration, isMuted]);

  // 마우스 움직임 감지 (비디오 컨트롤 표시/숨김)
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      if (isVideo) {
        setShowControls(true);
        clearTimeout(timeout);
        timeout = setTimeout(() => setShowControls(false), 3000);
      }
    };

    if (isOpen && isVideo) {
      document.addEventListener('mousemove', handleMouseMove);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        clearTimeout(timeout);
      };
    }
  }, [isOpen, isVideo]);

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[95vh] w-[1200px] h-[900px] p-0 flex flex-col [&>button]:hidden">
        {/* 미니멀 툴바 */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-lg p-2 border border-white/20">
          {/* 이미지 컨트롤 */}
          {isImage && (
            <>
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
              </div>
            </>
          )}

          {/* 비디오 컨트롤 */}
          {isVideo && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlayPause}
                disabled={!isVideoLoaded}
                className="h-7 w-7 p-0 hover:bg-white/20 text-white"
                title={isPlaying ? "일시정지 (스페이스바)" : "재생 (스페이스바)"}
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="h-7 w-7 p-0 hover:bg-white/20 text-white"
                title={isMuted ? "음소거 해제 (M)" : "음소거 (M)"}
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </Button>
            </>
          )}
          
          {/* 공통 도구 버튼들 */}
          <div className="flex items-center gap-1">
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
        
        {/* 뷰어 영역 - 전체 화면 */}
        <div className="w-full h-full relative bg-black overflow-hidden">
          {/* 로딩 상태 */}
          {((isImage && isImageLoading) || (isVideo && isVideoLoading)) && !isVideoFailed && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                <p className="text-white text-sm">
                  {isVideo ? '비디오 로딩 중...' : '이미지 로딩 중...'}
                </p>
              </div>
            </div>
          )}
          
          {/* 에러 상태 */}
          {((isImage && isFailed) || (isVideo && isVideoFailed)) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
              <div className="text-center">
                <div className="text-red-400 mb-4 text-lg">
                  {isVideo ? '비디오 로드 실패' : '이미지 로드 실패'}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={isVideo ? handleRetry : reload}
                  className="bg-white text-black hover:bg-gray-100"
                >
                  다시 시도
                </Button>
              </div>
            </div>
          )}
          
          {/* 이미지 표시 */}
          {isImage && isLoaded && (
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

          {/* 비디오 표시 */}
          {isVideo && (
            <>
              <div className="w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={file.url}
                  className="max-w-full max-h-full object-contain"
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      setDuration(videoRef.current.duration);
                      setIsVideoLoaded(true);
                      setIsVideoLoading(false);
                    }
                  }}
                  onLoadStart={() => {
                    setIsVideoLoading(true);
                  }}
                  onCanPlay={() => {
                    setIsVideoLoading(false);
                  }}
                  onError={() => {
                    setIsVideoFailed(true);
                    setIsVideoLoading(false);
                  }}
                  onClick={togglePlayPause}
                />
              </div>
              
              {/* 재생 버튼 오버레이 */}
              {!isPlaying && isVideoLoaded && !isVideoFailed && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    size="lg"
                    className="w-16 h-16 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
                    onClick={togglePlayPause}
                  >
                    <Play className="h-8 w-8 ml-1" />
                  </Button>
                </div>
              )}

              {/* 비디오 컨트롤 */}
              {showControls && isVideoLoaded && !isVideoFailed && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="space-y-3">
                    {/* 진행률 바 */}
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #f97316 0%, #f97316 ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`
                        }}
                      />
                      <span className="text-white text-sm min-w-[60px]">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* 줌 레벨 표시 (이미지) */}
          {isImage && isLoaded && scale !== 1 && (
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-medium">
              {Math.round(scale * 100)}%
            </div>
          )}
          
          {/* 회전 각도 표시 (이미지) */}
          {isImage && isLoaded && rotation !== 0 && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-medium">
              {rotation}°
            </div>
          )}

          {/* 재생 시간 표시 (비디오) */}
          {isVideo && isVideoLoaded && !isVideoFailed && (
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-medium">
              {formatTime(currentTime)} / {formatTime(duration)}
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