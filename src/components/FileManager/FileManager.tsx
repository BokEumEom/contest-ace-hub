import React, { useCallback, useMemo, useEffect } from 'react';
import { Upload, FileText, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PromptManager } from '@/components/PromptManager';
import { useFileManager } from './hooks/useFileManager';
import { isImageFile, isVideoFile, getFileTypeColor } from './utils/fileUtils';
import FileUploadArea from './FileUploadArea';
import FileList from './FileList';
import DescriptionEditor from './DescriptionEditor';
import ImageViewerModal from './ImageViewerModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';

// 탭 상수 정의
const TAB_VALUES = {
  FILES: 'files',
  DESCRIPTION: 'description',
  PROMPTS: 'prompts',
} as const;

type TabValue = typeof TAB_VALUES[keyof typeof TAB_VALUES];

interface FileManagerProps {
  contestId: string;
}

const FileManager: React.FC<FileManagerProps> = ({ contestId }) => {
  console.log('FileManager - contestId prop:', contestId);
  
  const {
    // State
    files,
    loading,
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    searchTerm,
    setSearchTerm,
    fileTypeFilter,
    setFileTypeFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    imageViewerFile,
    imageViewerOpen,
    deleteDialogOpen,
    fileToDelete,
    isDeleting,
    
    // Actions
    deleteFile,
    openDeleteDialog,
    closeDeleteDialog,
    executeDelete,
    downloadFile,
    viewFile,
    closeImageViewer,
    handleFilesUpload,
    handleFileUploadComplete,
    handleFilesUploadWithPrompt,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    cleanupDuplicateFiles,
  } = useFileManager(contestId);

  // 파일 뷰어 핸들러 - 이미지와 비디오 파일 모두 ImageViewerModal에서 처리
  const handleViewFile = useCallback((file: any) => {
    if (isImageFile(file.name) || isVideoFile(file.name)) {
      viewFile(file);
    }
  }, [viewFile]);

  // 탭 변경 핸들러 - 메모이제이션
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, [setActiveTab]);

  // 파일 업로드 핸들러 - 메모이제이션
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    
    if (uploadedFiles.length === 0) return;

    await handleFilesUpload(uploadedFiles);
    
    // 파일 input 초기화
    event.target.value = '';
  }, [handleFilesUpload]);

  // 프롬프트 업로드 핸들러 - 메모이제이션
  const handlePromptUpload = useCallback(() => {
    setActiveTab(TAB_VALUES.PROMPTS);
  }, [setActiveTab]);

  // 파일 업로드 영역 props 메모이제이션
  const fileUploadAreaProps = useMemo(() => {
    console.log('Creating fileUploadAreaProps', { 
      handleFilesUploadWithPrompt: !!handleFilesUploadWithPrompt,
      handleFilesUploadWithPromptType: typeof handleFilesUploadWithPrompt,
      contestId: contestId
    });
    
    return {
      onFileSelect: handleFileUpload,
      onDrop: handleDrop,
      onDragOver: handleDragOver,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onPromptUpload: handlePromptUpload,
      onFileUploadWithPrompt: handleFilesUploadWithPrompt,
      contestId: contestId,
    };
  }, [handleFileUpload, handleDrop, handleDragOver, handleDragEnter, handleDragLeave, handlePromptUpload, handleFilesUploadWithPrompt, contestId]);

  // 파일 목록 props 메모이제이션
  const fileListProps = useMemo(() => ({
    files,
    loading,
    searchTerm,
    setSearchTerm,
    fileTypeFilter,
    setFileTypeFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    viewMode,
    setViewMode,
    onView: handleViewFile,
    onDelete: deleteFile,
    onDownload: downloadFile,
    getFileTypeColor,
  }), [files, loading, searchTerm, setSearchTerm, fileTypeFilter, setFileTypeFilter, sortBy, setSortBy, sortOrder, setSortOrder, viewMode, setViewMode, handleViewFile, deleteFile, downloadFile, getFileTypeColor]);

  // 이미지 뷰어 모달 props 메모이제이션
  const imageViewerModalProps = useMemo(() => ({
    file: imageViewerFile,
    isOpen: imageViewerOpen,
    onClose: closeImageViewer,
    onDownload: downloadFile,
  }), [imageViewerFile, imageViewerOpen, closeImageViewer, downloadFile]);

  return (
    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
      <div className="flex items-center mb-2">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value={TAB_VALUES.FILES} className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            파일 관리
          </TabsTrigger>
          <TabsTrigger value={TAB_VALUES.DESCRIPTION} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            작품 설명
          </TabsTrigger>
          <TabsTrigger value={TAB_VALUES.PROMPTS} className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            프롬프트 관리
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value={TAB_VALUES.FILES} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-contest-blue" />
                파일 관리
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-normal text-muted-foreground">
                  {files.length}개 파일
                </span>
                {files.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cleanupDuplicateFiles}
                    className="text-xs"
                    title="중복 파일 정리"
                  >
                    중복 정리
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 파일 업로드 */}
            <FileUploadArea {...fileUploadAreaProps} />

            {/* 파일 목록 */}
            <FileList {...fileListProps} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value={TAB_VALUES.DESCRIPTION} className="space-y-4">
        <DescriptionEditor
          contestId={contestId}
          files={files}
        />
      </TabsContent>

      {/* 프롬프트 관리 탭 - 조건부 렌더링으로 성능 최적화 */}
      {activeTab === TAB_VALUES.PROMPTS && (
        <TabsContent value={TAB_VALUES.PROMPTS} className="space-y-4">
          <PromptManager contestId={parseInt(contestId)} files={files} />
        </TabsContent>
      )}

      {/* 통합 뷰어 모달 (이미지 + 비디오) */}
      <ImageViewerModal {...imageViewerModalProps} />

      {/* 파일 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={executeDelete}
        title="파일 삭제"
        description={fileToDelete ? `"${fileToDelete.name}" 파일을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.` : ''}
        confirmText={isDeleting ? "삭제 중..." : "삭제"}
        cancelText="취소"
        variant="destructive"
      />
    </Tabs>
  );
};

FileManager.displayName = 'FileManager';

export default FileManager; 