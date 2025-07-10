import React, { memo, useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadAreaProps {
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onPromptUpload?: () => void;
}

const FileUploadArea = memo(({ onFileSelect, onDrop, onDragOver, onDragEnter, onDragLeave, onPromptUpload }: FileUploadAreaProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // 클릭 시 input[type=file] 트리거
  const handleAreaClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-contest-orange transition-colors bg-gradient-to-br from-gray-50 to-white cursor-pointer"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onClick={handleAreaClick}
      tabIndex={0}
      role="button"
      aria-label="파일 업로드"
    >
      <input
        ref={inputRef}
        id="file-upload"
        type="file"
        multiple
        onChange={onFileSelect}
        className="hidden"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.mp4,.webm,.mp3,.wav,.txt,.csv"
      />
      <div className="flex flex-col items-center justify-center">
        <div className="w-16 h-16 mb-4 bg-contest-orange/10 rounded-full flex items-center justify-center">
          <Upload className="h-8 w-8 text-contest-orange" />
        </div>
        <h3 className="text-lg font-semibold mb-2">파일을 드래그하거나 클릭하여 업로드</h3>
        <p className="text-sm text-muted-foreground mb-4">
          여러 파일을 한 번에 업로드할 수 있습니다.
        </p>
        <div className="mt-4 text-xs text-muted-foreground">
          <p>지원 형식: PDF, DOC, PPT, XLS, PNG, JPG, MP4, MP3 등</p>
          <p>최대 파일 크기: 50MB</p>
        </div>
        {onPromptUpload && (
          <div className="mt-4">
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onPromptUpload();
              }}
              variant="outline"
              size="sm"
              className="text-contest-orange border-contest-orange hover:bg-contest-orange hover:text-white"
            >
              프롬프트 관리로 이동
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});

export default FileUploadArea; 