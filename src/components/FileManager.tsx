import React, { useState, useEffect } from 'react';
import { Upload, File, Download, Trash2, Eye, MessageSquare, Plus, FileText, Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileService, FileItem } from '@/services/fileService';
import { PromptManager } from '@/components/PromptManager';
import { useToast } from '@/hooks/use-toast';

interface FileManagerProps {
  contestId: string;
}

const FileManager: React.FC<FileManagerProps> = ({ contestId }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submissionDescription, setSubmissionDescription] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [activeTab, setActiveTab] = useState('files');
  const { toast } = useToast();

  // 파일 목록 로드
  useEffect(() => {
    loadFiles();
    loadSubmissionDescription();
  }, [contestId]);

  const loadFiles = async () => {
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
  };

  const loadSubmissionDescription = () => {
    try {
      const stored = localStorage.getItem(`submission_description_${contestId}`);
      if (stored) {
        setSubmissionDescription(stored);
      }
    } catch (error) {
      console.error('Error loading submission description:', error);
    }
  };

  const saveSubmissionDescription = () => {
    try {
      localStorage.setItem(`submission_description_${contestId}`, submissionDescription);
      setIsEditingDescription(false);
      toast({
        title: "저장 완료",
        description: "작품 설명이 저장되었습니다.",
      });
    } catch (error) {
      console.error('Error saving submission description:', error);
      toast({
        title: "오류",
        description: "작품 설명 저장에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleCancelDescription = () => {
    loadSubmissionDescription(); // 원래 데이터로 복원
    setIsEditingDescription(false);
  };

  const getFileIcon = (type: string) => {
    return <File className="h-4 w-4" />;
  };

  const getFileTypeColor = (type: string) => {
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
  };

  const deleteFile = async (fileId: number) => {
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
  };

  const downloadFile = (file: FileItem) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewFile = (file: FileItem) => {
    window.open(file.url, '_blank');
  };

  // 기존 파일 업로드 핸들러 (프롬프트 없이)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    
    if (uploadedFiles.length === 0) return;

    await handleFilesUpload(uploadedFiles);
    
    // 파일 input 초기화
    event.target.value = '';
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFilesUpload(droppedFiles);
    }
  };

  // 파일 업로드 처리 (드래그 앤 드롭과 파일 선택 공통)
  const handleFilesUpload = async (files: File[]) => {
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
  };



  // 파일 업로드 완료 핸들러 (프롬프트와 함께)
  const handleFileUploadComplete = (uploadedFile: FileItem) => {
    setFiles(prev => [uploadedFile, ...prev]);
    toast({
      title: "성공",
      description: `${uploadedFile.name} 파일이 업로드되었습니다.`,
    });
  };

  return (
    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
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
              <span>파일 관리</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-normal text-muted-foreground">
                  {files.length}개 파일
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 파일 업로드 */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-contest-orange transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
            >
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                파일을 드래그하거나 클릭하여 업로드하세요
              </p>
              <label htmlFor="file-upload" className="cursor-pointer">
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                >
                  <span>파일 선택</span>
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.mp4,.mp3"
                />
              </label>
            </div>

            {/* 파일 목록 */}
            <div className="space-y-2">
              {loading ? (
                <p className="text-center text-sm text-muted-foreground py-6">
                  파일 목록을 불러오는 중...
                </p>
              ) : files.length > 0 ? (
                files.map(file => (
                  <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <div className={`p-2 rounded ${getFileTypeColor(file.type)}`}>
                      {getFileIcon(file.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{file.name}</p>
                        {/* 프롬프트가 있는 파일 표시 */}
                        {file.prompt && (
                          <Badge variant="secondary" className="text-xs">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            프롬프트 포함
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{FileService.formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{file.uploaded_at ? new Date(file.uploaded_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      {/* 프롬프트 표시 */}
                      {file.prompt && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <p className="font-medium text-gray-700 mb-1">사용된 프롬프트:</p>
                          <p className="text-gray-600">{file.prompt}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => viewFile(file)}
                        title="파일 보기"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => downloadFile(file)}
                        title="파일 다운로드"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => file.id && deleteFile(file.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        title="파일 삭제"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">파일이 없습니다</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    파일을 업로드하고 사용된 프롬프트를 함께 관리해보세요.
                  </p>

                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="description" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-contest-blue" />
                작품 설명
              </div>
              {!isEditingDescription ? (
                <Button 
                  onClick={() => setIsEditingDescription(true)}
                  size="sm"
                  className="bg-contest-orange hover:bg-contest-orange/90"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  편집
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCancelDescription}
                    variant="outline"
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    취소
                  </Button>
                  <Button 
                    onClick={saveSubmissionDescription}
                    size="sm"
                    className="bg-contest-orange hover:bg-contest-orange/90"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    저장
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditingDescription ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="submission-description">작품 설명</Label>
                  <Textarea
                    id="submission-description"
                    value={submissionDescription}
                    onChange={(e) => setSubmissionDescription(e.target.value)}
                    placeholder="작품에 대한 설명을 입력하세요. 작품의 제목, 컨셉, 제작 과정, 사용한 재료나 기법, 영감을 준 요소 등을 포함하여 자세히 설명해주세요."
                    rows={10}
                    className="mt-2"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {submissionDescription ? (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="whitespace-pre-wrap text-sm">{submissionDescription}</div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">작품 설명이 입력되지 않았습니다.</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      "편집" 버튼을 클릭하여 작품 설명을 작성해보세요.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="prompts" className="space-y-4">
        <div className="flex justify-end mb-2">
          <Button
            onClick={() => window.dispatchEvent(new CustomEvent('openPromptRegisterModal'))}
            size="sm"
            className="bg-contest-orange hover:bg-contest-orange/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            프롬프트 등록
          </Button>
        </div>
        <PromptManager contestId={parseInt(contestId)} />
      </TabsContent>


    </Tabs>
  );
};

export default FileManager;
