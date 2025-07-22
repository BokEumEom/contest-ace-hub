import { useState, useCallback, useEffect } from 'react';
import { FileItem } from '@/services/fileService';
import { FileService } from '@/services/fileService';
import { useToast } from '@/hooks/use-toast';

interface UseFileDeleteProps {
  contestId: string;
  files: FileItem[]; // 파일 목록 추가
  onFileDeleted?: (fileId: number) => void;
}

export const useFileDelete = ({ contestId, files, onFileDeleted }: UseFileDeleteProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // 상태 변화 추적
  useEffect(() => {
    console.log(`useFileDelete - deleteDialogOpen changed to: ${deleteDialogOpen}`);
  }, [deleteDialogOpen]);

  // 파일 삭제 확인 다이얼로그 열기
  const openDeleteDialog = useCallback((file: FileItem) => {
    console.log(`openDeleteDialog called for file: ${file.name} (ID: ${file.id})`);
    
    // 권한 확인
    if (!file.canDelete) {
      console.warn(`User does not have delete permission for file: ${file.name}`);
      toast({
        title: "권한 없음",
        description: "이 파일을 삭제할 권한이 없습니다.",
        variant: "destructive",
      });
      return;
    }

    console.log(`Setting fileToDelete to: ${file.name} and opening dialog`);
    setFileToDelete(file);
    setDeleteDialogOpen(prev => {
      console.log(`setDeleteDialogOpen called with prev: ${prev}, setting to true`);
      return true;
    });
    
    // 상태 업데이트 확인을 위한 setTimeout
    setTimeout(() => {
      console.log(`Dialog should now be open. deleteDialogOpen: true`);
    }, 0);
  }, [toast]);

  // 파일 삭제 확인 다이얼로그 닫기
  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setFileToDelete(null);
    setIsDeleting(false);
  }, []);

  // 파일 삭제 실행
  const executeDelete = useCallback(async () => {
    if (!fileToDelete || !fileToDelete.id) {
      console.error('No file to delete');
      toast({
        title: "오류",
        description: "삭제할 파일을 찾을 수 없습니다.",
        variant: "destructive",
      });
      closeDeleteDialog();
      return;
    }

    setIsDeleting(true);

    try {
      console.log(`Attempting to delete file: ${fileToDelete.name} (ID: ${fileToDelete.id})`);
      
      const success = await FileService.deleteFile(fileToDelete.id, contestId);
      
      if (success) {
        // 콜백 호출로 부모 컴포넌트에서 파일 목록 업데이트
        onFileDeleted?.(fileToDelete.id);

        toast({
          title: "성공",
          description: `"${fileToDelete.name}" 파일이 삭제되었습니다.`,
        });
        
        console.log(`File ${fileToDelete.name} deleted successfully`);
      } else {
        toast({
          title: "오류",
          description: "파일 삭제에 실패했습니다. 권한을 확인하거나 다시 시도해주세요.",
          variant: "destructive",
        });
        
        console.error(`Failed to delete file: ${fileToDelete.name}`);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      
      // 더 구체적인 에러 메시지 제공
      let errorMessage = "파일 삭제 중 오류가 발생했습니다.";
      
      if (error instanceof Error) {
        if (error.message.includes('permission') || error.message.includes('권한')) {
          errorMessage = "파일을 삭제할 권한이 없습니다.";
        } else if (error.message.includes('network') || error.message.includes('네트워크')) {
          errorMessage = "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.";
        } else if (error.message.includes('storage')) {
          errorMessage = "파일 저장소에서 오류가 발생했습니다.";
        }
      }
      
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      closeDeleteDialog();
    }
  }, [fileToDelete, contestId, onFileDeleted, toast, closeDeleteDialog]);

  // 파일 삭제 (기존 함수 - 호환성 유지)
  const deleteFile = useCallback(async (fileId: number) => {
    try {
      console.log(`deleteFile called with fileId: ${fileId}`);
      
      // 파일 목록에서 실제 파일 정보 찾기
      const file = files.find(f => f.id === fileId);
      if (!file) {
        console.error(`File not found with ID: ${fileId}`);
        toast({
          title: "오류",
          description: "파일을 찾을 수 없습니다.",
          variant: "destructive",
        });
        return;
      }

      console.log(`Found file: ${file.name} (canDelete: ${file.canDelete})`);

      // 권한 확인
      if (!file.canDelete) {
        console.warn(`User does not have delete permission for file: ${file.name}`);
        toast({
          title: "권한 없음",
          description: "이 파일을 삭제할 권한이 없습니다.",
          variant: "destructive",
        });
        return;
      }

      // 다이얼로그 열기
      openDeleteDialog(file);
    } catch (error) {
      console.error('Error in deleteFile:', error);
      toast({
        title: "오류",
        description: "파일 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  }, [files, openDeleteDialog, toast]);

  return {
    // State
    deleteDialogOpen,
    fileToDelete,
    isDeleting,
    
    // Actions
    openDeleteDialog,
    closeDeleteDialog,
    executeDelete,
    deleteFile,
  };
}; 