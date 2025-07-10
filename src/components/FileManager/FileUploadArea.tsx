import React, { memo } from 'react';
import { Upload, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadAreaProps {
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onPromptUpload: () => void;
}

const FileUploadArea = memo(({
  onFileSelect,
  onDrop,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onPromptUpload
}: FileUploadAreaProps) => {
  return (
    <div 
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-contest-orange transition-colors bg-gradient-to-br from-gray-50 to-white"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
    >
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 bg-contest-orange/10 rounded-full flex items-center justify-center">
          <Upload className="h-8 w-8 text-contest-orange" />
        </div>
        <h3 className="text-lg font-semibold mb-2">파일 업로드</h3>
        <p className="text-sm text-muted-foreground mb-4">
          파일을 드래그하거나 클릭하여 업로드하세요
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <label htmlFor="file-upload" className="cursor-pointer">
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="w-full sm:w-auto"
            >
              <span>파일 선택</span>
            </Button>
            <input
              id="file-upload"
              type="file"
              multiple
              onChange={onFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.mp4,.webm,.mp3,.wav,.txt,.csv"
            />
          </label>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onPromptUpload}
            className="w-full sm:w-auto"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            프롬프트와 함께 업로드
          </Button>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          <p>지원 형식: PDF, DOC, PPT, XLS, PNG, JPG, MP4, MP3 등</p>
          <p>최대 파일 크기: 50MB</p>
        </div>
      </div>
    </div>
  );
});

FileUploadArea.displayName = 'FileUploadArea';

export default FileUploadArea; 