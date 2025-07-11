import React, { memo, useCallback, useMemo } from 'react';
import { Upload, FileText, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PromptManager } from '@/components/PromptManager';
import { useFileManager } from './hooks/useFileManager';
import { isImageFile, getFileTypeColor } from './utils/fileUtils';
import FileUploadArea from './FileUploadArea';
import FileList from './FileList';
import DescriptionEditor from './DescriptionEditor';
import ImageViewerModal from './ImageViewerModal';

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

const FileManager: React.FC<FileManagerProps> = memo(({ contestId }) => {
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
    
    // Actions
    deleteFile,
    downloadFile,
    viewFile,
    closeImageViewer,
    handleFilesUpload,
    handleFileUploadComplete,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
  } = useFileManager(contestId);

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
  const fileUploadAreaProps = useMemo(() => ({
    onFileSelect: handleFileUpload,
    onDrop: handleDrop,
    onDragOver: handleDragOver,
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onPromptUpload: handlePromptUpload,
  }), [handleFileUpload, handleDrop, handleDragOver, handleDragEnter, handleDragLeave, handlePromptUpload]);

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
    onView: viewFile,
    onDownload: downloadFile,
    onDelete: deleteFile,
    getFileTypeColor,
  }), [
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
    viewFile,
    downloadFile,
    deleteFile,
    getFileTypeColor,
  ]);

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

      {/* 이미지 뷰어 모달 */}
      <ImageViewerModal {...imageViewerModalProps} />
    </Tabs>
  );
});

FileManager.displayName = 'FileManager';

export default FileManager; 