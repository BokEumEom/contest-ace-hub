import React, { memo } from 'react';
import { Eye, Download, Trash2, MessageSquare, File, Video, Music, Image, Wand2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileItem as FileItemType } from '@/services/fileService';
import { FileService } from '@/services/fileService';
import { useImageCache } from './hooks/useImageCache';
import { useVideoThumbnail } from './hooks/useVideoThumbnail';
import { isImageFile, isVideoFile, isAudioFile, getFileTypeColor } from './utils/fileUtils';

interface FileItemProps {
  file: FileItemType;
  onView: (file: FileItemType) => void;
  onDownload: (file: FileItemType) => void;
  onDelete: (fileId: number) => void;
  onEdit?: (file: FileItemType) => void;
  getFileTypeColor: (type: string) => string;
}

const FileItem = memo(({ 
  file, 
  onView, 
  onDownload, 
  onDelete, 
  onEdit,
  getFileTypeColor 
}: FileItemProps) => {
  // 이미지 캐싱 훅 사용
  const { cachedUrl, isLoading: imageLoading } = useImageCache(
    isImageFile(file.name) ? file.url : null,
    { preloadOnMount: true }
  );

  // 비디오 썸네일 훅 사용
  const { thumbnailUrl, isLoading: videoLoading, error: videoError } = useVideoThumbnail(
    isVideoFile(file.name) ? file.url : null,
    { preloadOnMount: true }
  );

  // 파일 타입별 아이콘 결정
  const getFileIcon = () => {
    if (isImageFile(file.name)) return <Image className="h-4 w-4" />;
    if (isVideoFile(file.name)) return <Video className="h-4 w-4" />;
    if (isAudioFile(file.name)) return <Music className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  // 파일이 뷰어로 열릴 수 있는지 확인 (이미지, 비디오 파일)
  const canView = isImageFile(file.name) || isVideoFile(file.name);

  // 썸네일 렌더링 함수
  const renderThumbnail = () => {
    if (isImageFile(file.name)) {
      return (
        <div className="relative flex-shrink-0 cursor-pointer" onClick={() => onView(file)}>
          {imageLoading && (
            <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded border">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-contest-orange"></div>
            </div>
          )}
          {!imageLoading && (
            <img 
              src={cachedUrl || file.url} 
              alt={file.name}
              className="w-16 h-16 object-cover rounded border hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                // 이미지 로드 실패 시 아이콘으로 대체
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const fallbackIcon = document.createElement('div');
                  fallbackIcon.className = `w-16 h-16 flex items-center justify-center ${getFileTypeColor('image')} rounded border`;
                  fallbackIcon.innerHTML = '<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                  parent.appendChild(fallbackIcon);
                }
              }}
            />
          )}
          {/* 호버 시 확대 아이콘 표시 */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
            <Eye className="h-4 w-4 text-white" />
          </div>
        </div>
      );
    }

    if (isVideoFile(file.name)) {
      return (
        <div className="relative flex-shrink-0 cursor-pointer" onClick={() => onView(file)}>
          {videoLoading && (
            <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded border">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-contest-orange"></div>
            </div>
          )}
          {!videoLoading && thumbnailUrl && !videoError && (
            <div className="relative">
              <img 
                src={thumbnailUrl} 
                alt={file.name}
                className="w-16 h-16 object-cover rounded border hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  // 썸네일 로드 실패 시 아이콘으로 대체
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const fallbackIcon = document.createElement('div');
                    fallbackIcon.className = `w-16 h-16 flex items-center justify-center ${getFileTypeColor('video')} rounded border`;
                    fallbackIcon.innerHTML = '<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>';
                    parent.appendChild(fallbackIcon);
                  }
                }}
              />
              {/* 비디오 재생 아이콘 오버레이 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          )}
          {(!thumbnailUrl || videoError) && (
            <div className={`w-16 h-16 flex items-center justify-center rounded border flex-shrink-0 ${getFileTypeColor('video')}`}>
              <Video className="h-6 w-6" />
            </div>
          )}
          {/* 호버 시 확대 아이콘 표시 */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
            <Eye className="h-4 w-4 text-white" />
          </div>
        </div>
      );
    }

    // 기타 파일 타입 (오디오, 문서 등)
    return (
      <div 
        className={`w-16 h-16 flex items-center justify-center rounded border flex-shrink-0 ${getFileTypeColor(file.type)} ${canView ? 'cursor-pointer hover:scale-105 transition-transform duration-200' : ''}`}
        onClick={canView ? () => onView(file) : undefined}
      >
        {getFileIcon()}
        {/* 뷰어로 열릴 수 있는 파일의 경우 호버 시 아이콘 표시 */}
        {canView && (
          <div className="absolute inset-0 bg-white bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
            <Eye className="h-4 w-4 text-gray-700" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors group">
      {renderThumbnail()}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-sm truncate" title={file.name}>{file.name}</p>
              {/* 프롬프트가 있는 파일 표시 */}
              {file.prompt && (
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  프롬프트
                </Badge>
              )}
              {/* AI 모델 정보 표시 */}
              {file.ai_model && (
                <Badge variant="outline" className="text-xs flex-shrink-0 bg-purple-50 text-purple-700 border-purple-200">
                  <Wand2 className="h-3 w-3 mr-1" />
                  {file.ai_model}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {FileService.formatFileSize(file.size)}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {file.uploaded_at ? new Date(file.uploaded_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => onDownload(file)}
              title="파일 다운로드"
            >
              <Download className="h-4 w-4" />
            </Button>
            {/* 편집 권한이 있는 경우에만 편집 버튼 표시 */}
            {file.canEdit && onEdit && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onEdit(file)}
                className="h-8 w-8 p-0"
                title="파일 정보 편집"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {/* 삭제 권한이 있는 경우에만 삭제 버튼 표시 */}
            {file.canDelete && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => file.id && onDelete(file.id)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                title="파일 삭제"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* 프롬프트 표시 */}
        {file.prompt && (
          <div className="mt-2 p-2 bg-blue-50 rounded text-xs border border-blue-200">
            <p className="font-medium text-blue-700 mb-1">사용된 프롬프트:</p>
            <p className="text-blue-600 line-clamp-2">{file.prompt}</p>
          </div>
        )}
      </div>
    </div>
  );
});

FileItem.displayName = 'FileItem';

export default FileItem; 