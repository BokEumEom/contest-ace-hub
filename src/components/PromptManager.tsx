import React, { useState, useEffect, useCallback, memo } from 'react';
import { Wand2, Eye, Edit, Copy, Plus, Trash2, Image, FileText, Video, Music, Settings, File, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PromptService, Prompt } from '@/services/promptService';
import { FileService, FileItem } from '@/services/fileService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';

interface PromptManagerProps {
  contestId: number;
  files?: FileItem[]; // 파일 목록을 props로 받아 중복 로딩 방지
}

export const PromptManager: React.FC<PromptManagerProps> = memo(({ contestId, files = [] }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Prompt>>({});
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [newPromptFileIds, setNewPromptFileIds] = useState<number[]>([]);

  // 프롬프트 목록 로드 - 성능 최적화
  const loadPrompts = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const promptList = await PromptService.getPrompts(contestId);
      setPrompts(promptList);
    } catch (error) {
      console.error('Error loading prompts:', error);
      toast({
        title: "오류",
        description: "프롬프트 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [contestId, user, toast]);

  // 프롬프트 목록 로드
  useEffect(() => {
    if (user) {
      loadPrompts();
    } else {
      setPrompts([]);
    }
    
    // Listen for global event to open prompt register modal
    const handler = () => handleCreatePromptModal();
    window.addEventListener('openPromptRegisterModal', handler);
    return () => window.removeEventListener('openPromptRegisterModal', handler);
  }, [user, loadPrompts]);

  // 프롬프트 보기
  const handleViewPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setViewModalOpen(true);
  };

  // 프롬프트 편집
  const handleEditPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setEditForm({
      prompt_type: prompt.prompt_type,
      prompt_text: prompt.prompt_text,
      ai_model: prompt.ai_model,
      generation_params: prompt.generation_params
    });
    setEditModalOpen(true);
  };

  // 새 프롬프트 생성 모달 열기
  const handleCreatePromptModal = () => {
    setSelectedPrompt(null);
    setEditForm({});
    setNewPromptFileIds([]);
    setEditModalOpen(true);
  };

  // 프롬프트 삭제
  const handleDeletePrompt = async (promptId: number) => {
    if (confirm('이 프롬프트를 삭제하시겠습니까?')) {
      try {
        const success = await PromptService.deletePrompt(promptId, contestId);
        if (success) {
          setPrompts(prev => prev.filter(p => p.id !== promptId));
          toast({
            title: "삭제 완료",
            description: "프롬프트가 삭제되었습니다.",
          });
        } else {
          toast({
            title: "오류",
            description: "프롬프트 삭제에 실패했습니다.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error deleting prompt:', error);
        toast({
          title: "오류",
          description: "프롬프트 삭제 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    }
  };

  // 파일 선택 토글 (새 프롬프트 등록용)
  const toggleNewPromptFileSelection = (fileId: number) => {
    setNewPromptFileIds(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  // 프롬프트 생성
  const handleCreatePrompt = async () => {
    if (!editForm.prompt_text || !editForm.prompt_type) {
      toast({
        title: "오류",
        description: "프롬프트 타입과 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newPrompt = await PromptService.createPrompt({
        ...editForm,
        contest_id: contestId
      } as Prompt);
      
      if (newPrompt) {
        // 선택된 파일들에 프롬프트 연결
        if (newPromptFileIds.length > 0) {
          for (const fileId of newPromptFileIds) {
            try {
              await FileService.updateFilePrompt(fileId, newPrompt.prompt_text);
            } catch (error) {
              console.error(`Error linking prompt to file ${fileId}:`, error);
            }
          }
        }

        setPrompts(prev => [newPrompt, ...prev]);
        setEditModalOpen(false);
        setSelectedPrompt(null);
        setEditForm({});
        setNewPromptFileIds([]);
        toast({
          title: "생성 완료",
          description: "프롬프트가 생성되었습니다.",
        });
      }
    } catch (error) {
      console.error('Error creating prompt:', error);
      toast({
        title: "오류",
        description: "프롬프트 생성에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // 프롬프트 업데이트
  const handleUpdatePrompt = async () => {
    if (!selectedPrompt?.id) return;

    try {
      const updatedPrompt = await PromptService.updatePrompt(selectedPrompt.id, editForm);
      if (updatedPrompt) {
        setPrompts(prev => prev.map(p => p.id === selectedPrompt.id ? updatedPrompt : p));
        setEditModalOpen(false);
        setSelectedPrompt(null);
        setEditForm({});
        toast({
          title: "업데이트 완료",
          description: "프롬프트가 업데이트되었습니다.",
        });
      }
    } catch (error) {
      console.error('Error updating prompt:', error);
      toast({
        title: "오류",
        description: "프롬프트 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // 프롬프트 복사
  const handleCopyPrompt = (promptText: string) => {
    navigator.clipboard.writeText(promptText);
    toast({
      title: "복사 완료",
      description: "프롬프트가 클립보드에 복사되었습니다.",
    });
  };

  // 프롬프트와 파일 연결
  const handleLinkPromptToFile = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setLinkModalOpen(true);
  };

  // 파일에 프롬프트 연결
  const handleLinkFileToPrompt = async (file: FileItem) => {
    if (!selectedPrompt) return;

    try {
      const success = await FileService.updateFilePrompt(file.id!, selectedPrompt.prompt_text);
      if (success) {
        setLinkModalOpen(false);
        setSelectedPrompt(null);
        setSelectedFile(null);
        toast({
          title: "연결 완료",
          description: "프롬프트가 파일에 연결되었습니다.",
        });
      }
    } catch (error) {
      console.error('Error linking prompt to file:', error);
      toast({
        title: "오류",
        description: "프롬프트 연결에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // 프롬프트 타입별 아이콘
  const getPromptTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return Image;
      case 'document': return FileText;
      case 'video': return Video;
      case 'audio': return Music;
      default: return Settings;
    }
  };

  // 프롬프트 타입별 색상
  const getPromptTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'bg-green-100 text-green-700';
      case 'document': return 'bg-blue-100 text-blue-700';
      case 'video': return 'bg-purple-100 text-purple-700';
      case 'audio': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* 프롬프트 관리 카드 - UI 일관성을 위해 Card 구조 사용 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-contest-orange" />
              프롬프트 관리
            </div>
            <Button
              onClick={() => window.dispatchEvent(new CustomEvent('openPromptRegisterModal'))}
              size="sm"
              className="bg-contest-orange hover:bg-contest-orange/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              프롬프트 등록
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-contest-orange mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">프롬프트 목록을 불러오는 중...</p>
            </div>
          ) : user ? (
            <div className="space-y-2">
              {prompts.length > 0 ? (
                prompts.map((prompt) => {
                  const Icon = getPromptTypeIcon(prompt.prompt_type);
                  return (
                    <div key={prompt.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded ${getPromptTypeColor(prompt.prompt_type)}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">
                              {PromptService.getPromptTypeDescription(prompt.prompt_type)}
                            </p>
                            {prompt.ai_model && (
                              <Badge variant="secondary" className="text-xs">
                                {prompt.ai_model}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 break-words">
                            {prompt.prompt_text.length > 100 
                              ? `${prompt.prompt_text.substring(0, 100)}...` 
                              : prompt.prompt_text
                            }
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span>{prompt.created_at ? new Date(prompt.created_at).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPrompt(prompt)}
                          title="프롬프트 보기"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPrompt(prompt)}
                          title="프롬프트 편집"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyPrompt(prompt.prompt_text)}
                          title="프롬프트 복사"
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLinkPromptToFile(prompt)}
                          title="파일과 연결"
                          className="h-8 w-8 p-0"
                        >
                          <Link className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => prompt.id && handleDeletePrompt(prompt.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          title="프롬프트 삭제"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Wand2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">저장된 프롬프트가 없습니다.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    "프롬프트 등록" 버튼을 클릭하여 제작물 생성에 사용된 프롬프트를 등록해보세요.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Wand2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">저장된 프롬프트가 없습니다.</p>
              <p className="text-xs text-muted-foreground mt-1">
                "프롬프트 등록" 버튼을 클릭하여 제작물 생성에 사용된 프롬프트를 등록해보세요.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 프롬프트 보기 모달 */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-contest-orange" />
              프롬프트 상세 보기
            </DialogTitle>
          </DialogHeader>
          {selectedPrompt && (
            <div className="space-y-4 flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">생성 타입</Label>
                  <p className="text-sm text-muted-foreground">
                    {PromptService.getPromptTypeDescription(selectedPrompt.prompt_type)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">AI 모델</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedPrompt.ai_model || 'N/A'}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">프롬프트</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap break-words">{selectedPrompt.prompt_text}</p>
                </div>
              </div>
              {selectedPrompt.generation_params && Object.keys(selectedPrompt.generation_params).length > 0 && (
                <div>
                  <Label className="text-sm font-medium">생성 파라미터</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
                      {JSON.stringify(selectedPrompt.generation_params, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 프롬프트 편집 모달 */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPrompt ? (
                <>
                  <Edit className="h-5 w-5 text-contest-orange" />
                  프롬프트 편집
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-contest-orange" />
                  프롬프트 등록
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prompt-type">생성 타입</Label>
                <Select 
                  value={editForm.prompt_type || ''} 
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, prompt_type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">이미지</SelectItem>
                    <SelectItem value="document">문서</SelectItem>
                    <SelectItem value="video">비디오</SelectItem>
                    <SelectItem value="audio">오디오</SelectItem>
                    <SelectItem value="other">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ai-model">AI 모델</Label>
                <Input
                  id="ai-model"
                  value={editForm.ai_model || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, ai_model: e.target.value }))}
                  placeholder="AI 모델명"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="prompt-text">프롬프트</Label>
              <Textarea
                id="prompt-text"
                value={editForm.prompt_text || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, prompt_text: e.target.value }))}
                className="min-h-[120px] max-h-60 mt-2 resize-none"
                placeholder="프롬프트를 입력하세요..."
              />
            </div>
            {!selectedPrompt && files.length > 0 && (
              <div>
                <Label className="text-sm font-medium">연결할 파일 선택 (선택사항)</Label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {files.map(file => (
                    <div key={file.id} className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={`new-prompt-file-${file.id}`}
                        checked={newPromptFileIds.includes(file.id)}
                        onCheckedChange={() => toggleNewPromptFileSelection(file.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{file.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {file.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          크기: {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {newPromptFileIds.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {newPromptFileIds.length}개 파일이 선택되었습니다.
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              취소
            </Button>
            <Button 
              onClick={selectedPrompt ? handleUpdatePrompt : handleCreatePrompt}
              className="bg-contest-orange hover:bg-contest-orange/90"
            >
              {selectedPrompt ? '업데이트' : '등록'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 파일 연결 모달 */}
      <Dialog open={linkModalOpen} onOpenChange={setLinkModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-contest-orange" />
              프롬프트를 파일과 연결
            </DialogTitle>
          </DialogHeader>
          {selectedPrompt && (
            <div className="space-y-4 flex-1 overflow-y-auto">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-2">선택된 프롬프트:</p>
                <p className="text-sm text-muted-foreground break-words">
                  {selectedPrompt.prompt_text.length > 100 
                    ? `${selectedPrompt.prompt_text.substring(0, 100)}...` 
                    : selectedPrompt.prompt_text
                  }
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2">연결할 파일 선택:</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {files.length > 0 ? (
                    files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleLinkFileToPrompt(file)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {FileService.formatFileSize(file.size)} • {file.type}
                          </p>
                        </div>
                        {file.prompt && (
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            프롬프트 있음
                          </Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      업로드된 파일이 없습니다.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={() => setLinkModalOpen(false)}>
              취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}); 