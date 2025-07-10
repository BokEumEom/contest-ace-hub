import { useState, useEffect, useCallback, useRef } from 'react';
import { preloadImage, getCachedImageUrl, ImageLoader, getImageCacheStats } from '../utils/imageCache';

interface UseImageCacheOptions {
  preloadOnMount?: boolean;
  preloadDelay?: number;
  retryCount?: number;
  retryDelay?: number;
}

interface ImageCacheState {
  isLoading: boolean;
  isLoaded: boolean;
  isFailed: boolean;
  cachedUrl: string | null;
  error: string | null;
}

const DEFAULT_OPTIONS: UseImageCacheOptions = {
  preloadOnMount: true,
  preloadDelay: 0,
  retryCount: 3,
  retryDelay: 1000,
};

export const useImageCache = (
  imageUrl: string | null,
  options: UseImageCacheOptions = {}
) => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const [state, setState] = useState<ImageCacheState>({
    isLoading: false,
    isLoaded: false,
    isFailed: false,
    cachedUrl: null,
    error: null,
  });

  const imageLoaderRef = useRef<ImageLoader>(new ImageLoader());
  const retryCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // 이미지 로딩 함수
  const loadImage = useCallback(async (url: string, retry = false) => {
    if (!url) return;

    setState(prev => ({
      ...prev,
      isLoading: true,
      isLoaded: false,
      isFailed: false,
      error: null,
    }));

    try {
      // 캐시된 URL 가져오기
      const cachedUrl = await getCachedImageUrl(url);
      
      // 이미지 로딩 상태 확인
      const success = await imageLoaderRef.current.loadImage(url);
      
      if (success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isLoaded: true,
          isFailed: false,
          cachedUrl,
          error: null,
        }));
      } else {
        throw new Error('Failed to load image');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // 재시도 로직
      if (!retry && retryCountRef.current < config.retryCount) {
        retryCountRef.current++;
        timeoutRef.current = setTimeout(() => {
          loadImage(url, true);
        }, config.retryDelay);
        return;
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        isLoaded: false,
        isFailed: true,
        error: errorMessage,
      }));
    }
  }, [config.retryCount, config.retryDelay]);

  // 이미지 URL 변경 시 로딩
  useEffect(() => {
    if (!imageUrl) {
      setState({
        isLoading: false,
        isLoaded: false,
        isFailed: false,
        cachedUrl: null,
        error: null,
      });
      return;
    }

    retryCountRef.current = 0;
    
    if (config.preloadOnMount) {
      if (config.preloadDelay > 0) {
        timeoutRef.current = setTimeout(() => {
          loadImage(imageUrl);
        }, config.preloadDelay);
      } else {
        loadImage(imageUrl);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [imageUrl, config.preloadOnMount, config.preloadDelay, loadImage]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 수동으로 이미지 다시 로딩
  const reload = useCallback(() => {
    if (imageUrl) {
      retryCountRef.current = 0;
      loadImage(imageUrl);
    }
  }, [imageUrl, loadImage]);

  return {
    ...state,
    reload,
  };
};

// 여러 이미지 캐싱 훅
export const useMultipleImageCache = (
  imageUrls: string[],
  options: UseImageCacheOptions = {}
) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [loadedStates, setLoadedStates] = useState<Record<string, boolean>>({});
  const [failedStates, setFailedStates] = useState<Record<string, boolean>>({});
  const [cachedUrls, setCachedUrls] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const imageLoaderRef = useRef<ImageLoader>(new ImageLoader());

  // 이미지 로딩 함수
  const loadImages = useCallback(async (urls: string[]) => {
    const uniqueUrls = [...new Set(urls)];
    
    // 로딩 상태 초기화
    setLoadingStates(prev => {
      const newState = { ...prev };
      uniqueUrls.forEach(url => {
        newState[url] = true;
      });
      return newState;
    });

    // 실패 상태 초기화
    setFailedStates(prev => {
      const newState = { ...prev };
      uniqueUrls.forEach(url => {
        newState[url] = false;
      });
      return newState;
    });

    try {
      // 모든 이미지 프리로딩
      await Promise.allSettled(
        uniqueUrls.map(async (url) => {
          try {
            const cachedUrl = await getCachedImageUrl(url);
            const success = await imageLoaderRef.current.loadImage(url);
            
            if (success) {
              setLoadedStates(prev => ({ ...prev, [url]: true }));
              setCachedUrls(prev => ({ ...prev, [url]: cachedUrl }));
            } else {
              setFailedStates(prev => ({ ...prev, [url]: true }));
              setErrors(prev => ({ ...prev, [url]: 'Failed to load image' }));
            }
          } catch (error) {
            setFailedStates(prev => ({ ...prev, [url]: true }));
            setErrors(prev => ({ 
              ...prev, 
              [url]: error instanceof Error ? error.message : 'Unknown error' 
            }));
          } finally {
            setLoadingStates(prev => ({ ...prev, [url]: false }));
          }
        })
      );
    } catch (error) {
      console.error('Error loading multiple images:', error);
    }
  }, []);

  // 이미지 URL 변경 시 로딩
  useEffect(() => {
    if (imageUrls.length > 0) {
      loadImages(imageUrls);
    }
  }, [imageUrls, loadImages]);

  // 전체 로딩 상태
  const isLoading = Object.values(loadingStates).some(Boolean);
  const isLoaded = imageUrls.length > 0 && imageUrls.every(url => loadedStates[url]);
  const hasErrors = Object.values(failedStates).some(Boolean);

  return {
    loadingStates,
    loadedStates,
    failedStates,
    cachedUrls,
    errors,
    isLoading,
    isLoaded,
    hasErrors,
  };
};

// 이미지 캐시 통계 훅
export const useImageCacheStats = () => {
  const [stats, setStats] = useState(() => getImageCacheStats());

  const refreshStats = useCallback(() => {
    setStats(getImageCacheStats());
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshStats, 5000); // 5초마다 갱신
    return () => clearInterval(interval);
  }, [refreshStats]);

  return {
    stats,
    refreshStats,
  };
};

export default useImageCache; 