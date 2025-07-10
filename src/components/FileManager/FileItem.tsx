import React, { memo } from 'react';
import { Eye, Download, Trash2, MessageSquare, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileItem as FileItemType } from '@/services/fileService';
import { FileService } from '@/services/fileService';
import { useImageCache } from './hooks/useImageCache';

interface FileItemProps {
  file: FileItemType;
  onView: (file: FileItemType) => void;
  onDownload: (file: FileItemType) => void;
  onDelete: (fileId: number) => void;
  getFileTypeColor: (type: string) => string;
}

// 이미지 파일인지 확인하는 함수
const isImageFile = (fileName: string) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return imageExtensions.includes(extension);
};

const FileItem = memo(({ 
  file, 
  onView, 
  onDownload, 
  onDelete, 
  getFileTypeColor 
}: FileItemProps) => {
  // 이미지 캐싱 훅 사용
  const { cachedUrl, isLoading } = useImageCache(
    isImageFile(file.name) ? file.url : null,
    { preloadOnMount: true }
  );

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors group">
      {/* 이미지 파일인 경우 썸네일 표시 */}
      {isImageFile(file.name) ? (
        <div className="relative flex-shrink-0 cursor-pointer" onClick={() => onView(file)}>
          {isLoading && (
            <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded border">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-contest-orange"></div>
            </div>
          )}
          {!isLoading && (
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
      ) : (
        <div className={`w-16 h-16 flex items-center justify-center rounded border flex-shrink-0 ${getFileTypeColor(file.type)}`}>
          <File className="h-4 w-4" />
        </div>
      )}
      
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
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => file.id && onDelete(file.id)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              title="파일 삭제"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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