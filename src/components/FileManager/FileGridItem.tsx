import React, { memo } from 'react';
import { Eye, Download, Trash2, MessageSquare, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileItem as FileItemType } from '@/services/fileService';
import { FileService } from '@/services/fileService';

interface FileGridItemProps {
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

const FileGridItem = memo(({ 
  file, 
  onView, 
  onDownload, 
  onDelete, 
  getFileTypeColor 
}: FileGridItemProps) => {
  return (
    <div className="relative group border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* 이미지 파일인 경우 썸네일 표시 */}
      {isImageFile(file.name) ? (
        <div className="relative mb-3 cursor-pointer" onClick={() => onView(file)}>
          <img 
            src={file.url} 
            alt={file.name}
            className="w-full h-32 object-cover rounded border hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const fallbackIcon = document.createElement('div');
                fallbackIcon.className = `w-full h-32 flex items-center justify-center ${getFileTypeColor('image')} rounded`;
                fallbackIcon.innerHTML = '<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                parent.appendChild(fallbackIcon);
              }
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
            <Eye className="h-6 w-6 text-white" />
          </div>
        </div>
      ) : (
        <div className={`w-full h-32 flex items-center justify-center mb-3 ${getFileTypeColor(file.type)} rounded`}>
          <File className="h-8 w-8" />
        </div>
      )}
      
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate" title={file.name}>{file.name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span>{FileService.formatFileSize(file.size)}</span>
              <span>•</span>
              <span>{file.uploaded_at ? new Date(file.uploaded_at).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
          
          <div className="flex gap-1 ml-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={() => onDownload(file)}
              title="파일 다운로드"
            >
              <Download className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => file.id && onDelete(file.id)}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              title="파일 삭제"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* 프롬프트가 있는 파일 표시 */}
        {file.prompt && (
          <Badge variant="secondary" className="text-xs">
            <MessageSquare className="h-3 w-3 mr-1" />
            프롬프트 포함
          </Badge>
        )}
      </div>
    </div>
  );
});

FileGridItem.displayName = 'FileGridItem';

export default FileGridItem; 