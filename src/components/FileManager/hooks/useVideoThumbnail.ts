import { useState, useEffect, useRef } from 'react';
import { isVideoFile, extractVideoThumbnailFromUrl } from '../utils/fileUtils';

interface UseVideoThumbnailOptions {
  preloadOnMount?: boolean;
  fallbackIcon?: string;
}

interface UseVideoThumbnailReturn {
  thumbnailUrl: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// 썸네일 캐시 키 생성 함수
const getThumbnailCacheKey = (videoUrl: string): string => {
  // 캐시 버전을 추가하여 새로운 썸네일 생성
  const cacheVersion = 'v2'; // 썸네일 개선 버전
  return `video_thumbnail_${cacheVersion}_${btoa(videoUrl).replace(/[^a-zA-Z0-9]/g, '')}`;
};

// 썸네일 캐시에서 가져오기
const getCachedThumbnail = (videoUrl: string): string | null => {
  try {
    const cacheKey = getThumbnailCacheKey(videoUrl);
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { thumbnail, timestamp } = JSON.parse(cached);
      // 24시간 캐시 유효
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        return thumbnail;
      } else {
        localStorage.removeItem(cacheKey);
      }
    }
  } catch (error) {
    console.warn('Failed to get cached thumbnail:', error);
  }
  return null;
};

// 썸네일 캐시에 저장하기
const setCachedThumbnail = (videoUrl: string, thumbnail: string): void => {
  try {
    const cacheKey = getThumbnailCacheKey(videoUrl);
    const cacheData = {
      thumbnail,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to cache thumbnail:', error);
  }
};

export const useVideoThumbnail = (
  videoUrl: string | null,
  options: UseVideoThumbnailOptions = {}
): UseVideoThumbnailReturn => {
  const { preloadOnMount = true, fallbackIcon } = options;
  
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // 컴포넌트 마운트 상태 추적
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // 컴포넌트 언마운트 시 진행 중인 요청 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 썸네일 추출 함수
  const extractThumbnail = async (url: string) => {
    if (!url || !isVideoFile(url)) {
      setError('Invalid video URL');
      return;
    }

    // 먼저 캐시에서 확인
    const cachedThumbnail = getCachedThumbnail(url);
    if (cachedThumbnail) {
      if (isMountedRef.current) {
        setThumbnailUrl(cachedThumbnail);
        setIsLoading(false);
        setError(null);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 이전 요청이 있다면 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 새로운 AbortController 생성
      abortControllerRef.current = new AbortController();

      const thumbnail = await extractVideoThumbnailFromUrl(url);
      
      // 캐시에 저장
      setCachedThumbnail(url, thumbnail);
      
      // 컴포넌트가 마운트된 상태에서만 상태 업데이트
      if (isMountedRef.current) {
        setThumbnailUrl(thumbnail);
        setIsLoading(false);
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error('Failed to extract video thumbnail:', err);
        setError(err instanceof Error ? err.message : 'Failed to extract thumbnail');
        setIsLoading(false);
        
        // 에러 시 fallback 아이콘 사용
        if (fallbackIcon) {
          setThumbnailUrl(fallbackIcon);
        }
      }
    }
  };

  // URL이 변경될 때 썸네일 추출
  useEffect(() => {
    if (videoUrl && preloadOnMount) {
      extractThumbnail(videoUrl);
    }
  }, [videoUrl, preloadOnMount]);

  // 수동으로 썸네일 다시 추출하는 함수
  const refetch = () => {
    if (videoUrl) {
      // 캐시 무시하고 다시 추출
      const cacheKey = getThumbnailCacheKey(videoUrl);
      localStorage.removeItem(cacheKey);
      extractThumbnail(videoUrl);
    }
  };

  return {
    thumbnailUrl,
    isLoading,
    error,
    refetch,
  };
}; 