import React, { memo, useCallback, useState } from 'react';
import { Upload, FileText, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PromptManager } from '@/components/PromptManager';
import { useFileManager } from './FileManager/hooks/useFileManager';
import { isImageFile, getFileTypeColor } from './FileManager/utils/fileUtils';
import FileUploadArea from './FileManager/FileUploadArea';
import FileList from './FileManager/FileList';
import DescriptionEditor from './FileManager/DescriptionEditor';
import ImageViewerModal from './FileManager/ImageViewerModal';
import { FileEditModal } from './FileManager/FileEditModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FileService, FileItem } from '@/services/fileService';
import { useToast } from '@/hooks/use-toast';


interface FileManagerProps {
  contestId: string;
}

const FileManager: React.FC<FileManagerProps> = memo(({ contestId }) => {
  console.log('FileManager - contestId prop:', contestId);
  
  const { toast } = useToast();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [fileToEdit, setFileToEdit] = useState<FileItem | null>(null);
  
  const {
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
    handleFilesUpload,
    handleFileUploadComplete,
    handleFilesUploadWithPrompt,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    setFiles,
    viewFile,
    downloadFile,
    deleteFile,
    fileToDelete,
    deleteDialogOpen,
    closeDeleteDialog,
    executeDelete,
    isDeleting,
    activeTab,
    setActiveTab,
    imageViewerFile,
    imageViewerOpen,
    closeImageViewer,
    getFileTypeColor
  } = useFileManager(contestId);

  // 탭 변경 핸들러
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, [setActiveTab]);

  // 파일 업로드 핸들러 (FileUploadArea용)
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      handleFilesUpload(files);
    }
  }, [handleFilesUpload]);

  // 프롬프트 업로드 핸들러
  const handlePromptUpload = useCallback(() => {
    setActiveTab('prompts');
  }, [setActiveTab]);

  // 파일 편집 핸들러
  const handleEditFile = useCallback((file: FileItem) => {
    setFileToEdit(file);
    setEditModalOpen(true);
  }, []);

  // 파일 저장 핸들러
  const handleSaveFile = useCallback(async (fileId: number, updates: Partial<FileItem>) => {
    try {
      const updatedFile = await FileService.updateFile(fileId, updates);
      if (updatedFile) {
        // 파일 목록에서 해당 파일 업데이트
        setFiles(prev => prev.map(file => 
          file.id === fileId 
            ? { ...file, ...updates }
            : file
        ));
        
        toast({
          title: "성공",
          description: "파일 정보가 업데이트되었습니다.",
        });
      } else {
        toast({
          title: "오류",
          description: "파일 정보 업데이트에 실패했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving file:', error);
      toast({
        title: "오류",
        description: "파일 정보 업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  }, [toast]);

  return (
    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
      <div className="flex items-center mb-2">
        <TabsList className="grid w-full grid-cols-3">
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
              onFileUploadWithPrompt={handleFilesUploadWithPrompt}
              contestId={contestId}
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
              onEdit={handleEditFile}
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



      {/* 이미지 뷰어 모달 */}
      <ImageViewerModal
        file={imageViewerFile}
        isOpen={imageViewerOpen}
        onClose={closeImageViewer}
        onDownload={downloadFile}
      />

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

      {/* 파일 편집 모달 */}
      <FileEditModal
        file={fileToEdit}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveFile}
      />
    </Tabs>
  );
});

FileManager.displayName = 'FileManager';

export default FileManager;
