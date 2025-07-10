import React, { memo, useCallback } from 'react';
import { Upload, FileText, MessageSquare, HardDrive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PromptManager } from '@/components/PromptManager';
import { useFileManager } from './FileManager/hooks/useFileManager';
import { isImageFile, getFileTypeColor } from './FileManager/utils/fileUtils';
import FileUploadArea from './FileManager/FileUploadArea';
import FileList from './FileManager/FileList';
import DescriptionEditor from './FileManager/DescriptionEditor';
import ImageViewerModal from './FileManager/ImageViewerModal';
import CacheManager from './FileManager/CacheManager';

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

  // 탭 변경 핸들러
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, [setActiveTab]);

  // 파일 업로드 핸들러
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    
    if (uploadedFiles.length === 0) return;

    await handleFilesUpload(uploadedFiles);
    
    // 파일 input 초기화
    event.target.value = '';
  }, [handleFilesUpload]);

  // 프롬프트 업로드 핸들러
  const handlePromptUpload = useCallback(() => {
    setActiveTab('prompts');
  }, [setActiveTab]);

  return (
    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
      <div className="flex items-center mb-2">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="files" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            파일 관리
          </TabsTrigger>
          <TabsTrigger value="description" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            작품 설명
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            프롬프트 관리
          </TabsTrigger>
          <TabsTrigger value="cache" className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            캐시 관리
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="files" className="space-y-4">
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
            <FileUploadArea
              onFileSelect={handleFileUpload}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onPromptUpload={handlePromptUpload}
            />

            {/* 파일 목록 */}
            <FileList
              files={files}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              fileTypeFilter={fileTypeFilter}
              setFileTypeFilter={setFileTypeFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onView={viewFile}
              onDownload={downloadFile}
              onDelete={deleteFile}
              getFileTypeColor={getFileTypeColor}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="description" className="space-y-4">
        <DescriptionEditor
          contestId={contestId}
          files={files}
        />
      </TabsContent>

      {/* 프롬프트 관리 탭 - 조건부 렌더링으로 성능 최적화 */}
      {activeTab === 'prompts' && (
        <TabsContent value="prompts" className="space-y-4">
          <PromptManager contestId={parseInt(contestId)} files={files} />
        </TabsContent>
      )}

      {/* 캐시 관리 탭 */}
      <TabsContent value="cache" className="space-y-4">
        <CacheManager />
      </TabsContent>

      {/* 이미지 뷰어 모달 */}
      <ImageViewerModal
        file={imageViewerFile}
        isOpen={imageViewerOpen}
        onClose={closeImageViewer}
        onDownload={downloadFile}
      />
    </Tabs>
  );
});

FileManager.displayName = 'FileManager';

export default FileManager;
