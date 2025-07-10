import { useState, useEffect, useCallback } from 'react';
import { FileService, FileItem } from '@/services/fileService';
import { ContestSubmissionService } from '@/services/contestSubmissionService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';

export const useFileManager = (contestId: string) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('files');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [imageViewerFile, setImageViewerFile] = useState<FileItem | null>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // 파일 목록 로드
  const loadFiles = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const fileList = await FileService.getFiles(contestId);
      setFiles(fileList);
    } catch (error) {
      console.error('Error loading files:', error);
      toast({
        title: "오류",
        description: "파일 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [contestId, user, toast]);



  // 파일 삭제
  const deleteFile = useCallback(async (fileId: number) => {
    try {
      const success = await FileService.deleteFile(fileId, contestId);
      
      if (success) {
        setFiles(prev => prev.filter(file => file.id !== fileId));
        toast({
          title: "성공",
          description: "파일이 삭제되었습니다.",
        });
      } else {
        toast({
          title: "오류",
          description: "파일 삭제에 실패했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "오류",
        description: "파일 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  }, [contestId, toast]);

  // 파일 다운로드
  const downloadFile = useCallback((file: FileItem) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // 파일 보기
  const viewFile = useCallback((file: FileItem) => {
    // 이미지 파일인지 확인하는 함수
    const isImageFile = (fileName: string) => {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
      const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
      return imageExtensions.includes(extension);
    };

    if (isImageFile(file.name)) {
      setImageViewerFile(file);
      setImageViewerOpen(true);
    } else {
      // 이미지가 아닌 경우 새 탭에서 열기
      window.open(file.url, '_blank');
    }
  }, []);

  // 이미지 뷰어 닫기
  const closeImageViewer = useCallback(() => {
    setImageViewerOpen(false);
    setImageViewerFile(null);
  }, []);

  // 파일 업로드 처리
  const handleFilesUpload = useCallback(async (files: File[]) => {
    for (const file of files) {
      try {
        const uploadedFile = await FileService.uploadFile(file, contestId);
        
        if (uploadedFile) {
          setFiles(prev => [uploadedFile, ...prev]);
          toast({
            title: "성공",
            description: `${file.name} 파일이 업로드되었습니다.`,
          });
        } else {
          toast({
            title: "오류",
            description: `${file.name} 파일 업로드에 실패했습니다.`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        toast({
          title: "오류",
          description: `${file.name} 파일 업로드 중 오류가 발생했습니다.`,
          variant: "destructive",
        });
      }
    }
  }, [contestId, toast]);

  // 파일 업로드 완료 핸들러 (프롬프트와 함께)
  const handleFileUploadComplete = useCallback((uploadedFile: FileItem) => {
    setFiles(prev => [uploadedFile, ...prev]);
    toast({
      title: "성공",
      description: `${uploadedFile.name} 파일이 업로드되었습니다.`,
    });
  }, [toast]);

  // 드래그 앤 드롭 핸들러
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFilesUpload(droppedFiles);
    }
  }, [handleFilesUpload]);

  // 파일 아이콘 및 색상 유틸리티
  const getFileIcon = useCallback((type: string) => {
    switch (type) {
      case 'document':
        return 'document';
      case 'image':
        return 'image';
      case 'video':
        return 'video';
      case 'audio':
        return 'audio';
      default:
        return 'file';
    }
  }, []);

  const getFileTypeColor = useCallback((type: string) => {
    switch (type) {
      case 'document':
        return 'bg-blue-100 text-blue-700';
      case 'image':
        return 'bg-green-100 text-green-700';
      case 'video':
        return 'bg-purple-100 text-purple-700';
      case 'audio':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }, []);

  // 초기화
  useEffect(() => {
    if (user) {
      loadFiles();
    } else {
      setFiles([]);
    }
  }, [user, loadFiles]);

  return {
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
    loadFiles,
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
    getFileIcon,
    getFileTypeColor,
  };
}; 