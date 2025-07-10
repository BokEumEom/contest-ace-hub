// 이미지 캐싱 유틸리티
interface CachedImage {
  url: string;
  blob: Blob;
  timestamp: number;
  size: number;
}

interface ImageCacheConfig {
  maxMemorySize: number; // MB
  maxAge: number; // milliseconds
  localStorageKey: string;
}

const DEFAULT_CONFIG: ImageCacheConfig = {
  maxMemorySize: 50, // 50MB
  maxAge: 24 * 60 * 60 * 1000, // 24시간
  localStorageKey: 'image-cache',
};

class ImageCache {
  private memoryCache = new Map<string, CachedImage>();
  private config: ImageCacheConfig;

  constructor(config: Partial<ImageCacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadFromLocalStorage();
  }

  // 메모리 캐시에서 이미지 가져오기
  async getFromMemory(url: string): Promise<Blob | null> {
    const cached = this.memoryCache.get(url);
    if (!cached) return null;

    // 캐시 만료 확인
    if (Date.now() - cached.timestamp > this.config.maxAge) {
      this.memoryCache.delete(url);
      return null;
    }

    return cached.blob;
  }

  // 로컬 스토리지에서 이미지 가져오기
  async getFromLocalStorage(url: string): Promise<Blob | null> {
    try {
      const stored = localStorage.getItem(`${this.config.localStorageKey}-${this.hashUrl(url)}`);
      if (!stored) return null;

      const cached: CachedImage = JSON.parse(stored);
      
      // 캐시 만료 확인
      if (Date.now() - cached.timestamp > this.config.maxAge) {
        localStorage.removeItem(`${this.config.localStorageKey}-${this.hashUrl(url)}`);
        return null;
      }

      // Blob으로 변환
      const response = await fetch(cached.url);
      return response.blob();
    } catch (error) {
      console.warn('Failed to load image from localStorage:', error);
      return null;
    }
  }

  // 이미지 캐시에 저장
  async set(url: string, blob: Blob): Promise<void> {
    const cached: CachedImage = {
      url,
      blob,
      timestamp: Date.now(),
      size: blob.size,
    };

    // 메모리 캐시에 저장
    this.memoryCache.set(url, cached);
    
    // 메모리 크기 제한 확인
    await this.cleanupMemoryCache();

    // 로컬 스토리지에 저장 (크기가 작은 경우만)
    if (blob.size < 1024 * 1024) { // 1MB 미만만 저장
      try {
        const key = `${this.config.localStorageKey}-${this.hashUrl(url)}`;
        localStorage.setItem(key, JSON.stringify(cached));
      } catch (error) {
        console.warn('Failed to save image to localStorage:', error);
      }
    }
  }

  // URL 해시 생성
  private hashUrl(url: string): string {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit integer
    }
    return hash.toString();
  }

  // 메모리 캐시 정리
  private async cleanupMemoryCache(): Promise<void> {
    const maxSize = this.config.maxMemorySize * 1024 * 1024; // MB to bytes
    let currentSize = 0;
    const entries = Array.from(this.memoryCache.entries());

    // 현재 크기 계산
    for (const [, cached] of entries) {
      currentSize += cached.size;
    }

    // 크기가 제한을 초과하면 오래된 항목부터 삭제
    if (currentSize > maxSize) {
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      for (const [url] of entries) {
        this.memoryCache.delete(url);
        currentSize -= entries.find(([key]) => key === url)?.[1].size || 0;
        
        if (currentSize <= maxSize * 0.8) { // 80%까지 줄임
          break;
        }
      }
    }
  }

  // 로컬 스토리지에서 캐시 로드
  private loadFromLocalStorage(): void {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.config.localStorageKey));
      
      for (const key of cacheKeys) {
        const stored = localStorage.getItem(key);
        if (stored) {
          const cached: CachedImage = JSON.parse(stored);
          
          // 만료된 캐시 삭제
          if (Date.now() - cached.timestamp > this.config.maxAge) {
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }

  // 캐시 클리어
  clear(): void {
    this.memoryCache.clear();
    
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.config.localStorageKey));
      cacheKeys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error);
    }
  }

  // 캐시 통계
  getStats(): { memorySize: number; memoryCount: number; localStorageCount: number } {
    let memorySize = 0;
    for (const cached of this.memoryCache.values()) {
      memorySize += cached.size;
    }

    let localStorageCount = 0;
    try {
      const keys = Object.keys(localStorage);
      localStorageCount = keys.filter(key => key.startsWith(this.config.localStorageKey)).length;
    } catch (error) {
      console.warn('Failed to get localStorage count:', error);
    }

    return {
      memorySize,
      memoryCount: this.memoryCache.size,
      localStorageCount,
    };
  }
}

// 전역 이미지 캐시 인스턴스
const imageCache = new ImageCache();

// 이미지 프리로딩 함수
export const preloadImage = async (url: string): Promise<void> => {
  try {
    // 먼저 캐시에서 확인
    let blob = await imageCache.getFromMemory(url);
    
    if (!blob) {
      blob = await imageCache.getFromLocalStorage(url);
    }

    if (!blob) {
      // 네트워크에서 다운로드
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
      
      blob = await response.blob();
      await imageCache.set(url, blob);
    }
  } catch (error) {
    console.warn('Failed to preload image:', url, error);
  }
};

// 이미지 URL을 캐시된 URL로 변환
export const getCachedImageUrl = async (url: string): Promise<string> => {
  try {
    let blob = await imageCache.getFromMemory(url);
    
    if (!blob) {
      blob = await imageCache.getFromLocalStorage(url);
    }

    if (blob) {
      return URL.createObjectURL(blob);
    }

    // 캐시에 없으면 원본 URL 반환
    return url;
  } catch (error) {
    console.warn('Failed to get cached image URL:', error);
    return url;
  }
};

// 여러 이미지 프리로딩
export const preloadImages = async (urls: string[]): Promise<void> => {
  const promises = urls.map(url => preloadImage(url));
  await Promise.allSettled(promises);
};

// 캐시 정리
export const clearImageCache = (): void => {
  imageCache.clear();
};

// 캐시 통계 가져오기
export const getImageCacheStats = () => {
  return imageCache.getStats();
};

// 이미지 로딩 상태 관리
export class ImageLoader {
  private loadingImages = new Set<string>();
  private loadedImages = new Set<string>();
  private failedImages = new Set<string>();

  async loadImage(url: string): Promise<boolean> {
    if (this.loadedImages.has(url)) return true;
    if (this.failedImages.has(url)) return false;
    if (this.loadingImages.has(url)) {
      // 이미 로딩 중이면 완료될 때까지 대기
      return new Promise((resolve) => {
        const checkLoaded = () => {
          if (this.loadedImages.has(url)) {
            resolve(true);
          } else if (this.failedImages.has(url)) {
            resolve(false);
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
      });
    }

    this.loadingImages.add(url);

    try {
      await preloadImage(url);
      this.loadedImages.add(url);
      return true;
    } catch (error) {
      this.failedImages.add(url);
      return false;
    } finally {
      this.loadingImages.delete(url);
    }
  }

  isLoaded(url: string): boolean {
    return this.loadedImages.has(url);
  }

  isFailed(url: string): boolean {
    return this.failedImages.has(url);
  }

  isLoading(url: string): boolean {
    return this.loadingImages.has(url);
  }

  clear(): void {
    this.loadingImages.clear();
    this.loadedImages.clear();
    this.failedImages.clear();
  }
}

export default imageCache; 