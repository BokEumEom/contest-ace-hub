import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, Trash2 } from 'lucide-react';

interface ImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isUploading: boolean;
  hasAvatar: boolean;
  onImageSelect: () => void;
  onImageDelete: () => void;
}

const ImageUploadDialog: React.FC<ImageUploadDialogProps> = ({
  open,
  onOpenChange,
  isUploading,
  hasAvatar,
  onImageSelect,
  onImageDelete
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>프로필 이미지 변경</DialogTitle>
          <DialogDescription>
            새로운 프로필 이미지를 선택하거나 기존 이미지를 삭제할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center">
            <div className="space-y-3">
              <Button
                onClick={onImageSelect}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    업로드 중...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    새 이미지 선택
                  </>
                )}
              </Button>
              {hasAvatar && (
                <Button
                  variant="outline"
                  onClick={onImageDelete}
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={isUploading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  현재 이미지 삭제
                </Button>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500 text-center">
            <p>지원 형식: JPEG, PNG, GIF, WEBP</p>
            <p>최대 파일 크기: 5MB</p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            취소
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadDialog; 