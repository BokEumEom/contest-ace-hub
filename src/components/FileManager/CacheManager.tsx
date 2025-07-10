import React, { memo, useState } from 'react';
import { Trash2, Settings, Info, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useImageCacheStats } from './hooks/useImageCache';
import { clearImageCache } from './utils/imageCache';
import { useToast } from '@/hooks/use-toast';

const CacheManager: React.FC = memo(() => {
  const { stats, refreshStats } = useImageCacheStats();
  const { toast } = useToast();
  const [isClearing, setIsClearing] = useState(false);

  // 캐시 정리
  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      clearImageCache();
      refreshStats();
      toast({
        title: "성공",
        description: "이미지 캐시가 정리되었습니다.",
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast({
        title: "오류",
        description: "캐시 정리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  // 파일 크기 포맷팅
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-contest-blue" />
          이미지 캐시 관리
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 캐시 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <Info className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">메모리 캐시</p>
              <p className="text-xs text-blue-600">
                {stats.memoryCount}개 파일 • {formatBytes(stats.memorySize)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <HardDrive className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">로컬 스토리지</p>
              <p className="text-xs text-green-600">
                {stats.localStorageCount}개 파일
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
            <Settings className="h-4 w-4 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-orange-800">총 캐시</p>
              <p className="text-xs text-orange-600">
                {stats.memoryCount + stats.localStorageCount}개 파일
              </p>
            </div>
          </div>
        </div>

        {/* 캐시 정보 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">캐시 정보</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>메모리 캐시 크기:</span>
              <span className="font-medium">{formatBytes(stats.memorySize)}</span>
            </div>
            <div className="flex justify-between">
              <span>메모리 캐시 파일 수:</span>
              <span className="font-medium">{stats.memoryCount}개</span>
            </div>
            <div className="flex justify-between">
              <span>로컬 스토리지 파일 수:</span>
              <span className="font-medium">{stats.localStorageCount}개</span>
            </div>
            <div className="flex justify-between">
              <span>총 캐시 파일 수:</span>
              <span className="font-medium">{stats.memoryCount + stats.localStorageCount}개</span>
            </div>
          </div>
        </div>

        {/* 캐시 관리 버튼 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              자동 캐싱 활성화
            </Badge>
            <Badge variant="outline" className="text-xs">
              24시간 만료
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshStats}
              className="text-xs"
            >
              새로고침
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearCache}
              disabled={isClearing}
              className="text-xs"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {isClearing ? '정리 중...' : '캐시 정리'}
            </Button>
          </div>
        </div>

        {/* 캐시 팁 */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700">
              <p className="font-medium mb-1">캐시 팁</p>
              <ul className="space-y-1">
                <li>• 이미지가 자동으로 캐시되어 빠른 로딩을 제공합니다</li>
                <li>• 메모리 캐시는 브라우저 세션 동안 유지됩니다</li>
                <li>• 로컬 스토리지 캐시는 브라우저를 닫아도 유지됩니다</li>
                <li>• 캐시는 24시간 후 자동으로 만료됩니다</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

CacheManager.displayName = 'CacheManager';

export default CacheManager; 