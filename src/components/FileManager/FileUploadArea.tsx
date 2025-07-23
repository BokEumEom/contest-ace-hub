import React, { memo, useRef, useState } from 'react';
import { Upload, Wand2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FileService } from '@/services/fileService';
import { PromptService } from '@/services/promptService';
import { useToast } from '@/hooks/use-toast';

interface FileUploadAreaProps {
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onPromptUpload?: () => void;
  onFileUploadWithPrompt?: (files: File[], promptData: PromptData) => void;
  contestId?: string; // contestId 추가
}

interface PromptData {
  prompt_text: string;
  prompt_type: 'image' | 'document' | 'video' | 'audio' | 'other';
  ai_model?: string;
  applyToAll: boolean;
}

const FileUploadArea = memo(({ 
  onFileSelect, 
  onDrop, 
  onDragOver, 
  onDragEnter, 
  onDragLeave, 
  onPromptUpload,
  onFileUploadWithPrompt,
  contestId 
}: FileUploadAreaProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [promptData, setPromptData] = useState<PromptData>({
    prompt_text: '',
    prompt_type: 'image',
    ai_model: '',
    applyToAll: true
  });
  const { toast } = useToast();

  // 직접 파일 업로드 함수 (fallback)
  const uploadFilesWithPrompt = async (files: File[], promptData: PromptData) => {
    console.log('uploadFilesWithPrompt called with contestId:', contestId);
    if (!contestId) {
      toast({
        title: "오류",
        description: "공모전 ID가 없습니다.",
        variant: "destructive",
      });
      return;
    }

    for (const file of files) {
      try {
        const promptText = promptData.prompt_text.trim() || '';
        console.log('Direct upload with prompt', { fileName: file.name, promptText, contestId });
        
        const uploadedFile = await FileService.uploadFileWithPrompt(file, contestId, promptText);
        
        if (uploadedFile) {
          // 프롬프트가 있는 경우 프롬프트도 저장
          if (promptText) {
            try {
              await PromptService.createPrompt({
                contest_id: parseInt(contestId),
                file_id: uploadedFile.id,
                prompt_type: promptData.prompt_type,
                prompt_text: promptText,
                ai_model: promptData.ai_model || undefined,
                generation_params: {}
              });
            } catch (error) {
              console.error('Error creating prompt:', error);
            }
          }

          toast({
            title: "성공",
            description: `${file.name} 파일이 프롬프트와 함께 업로드되었습니다.`,
          });
        } else {
          toast({
            title: "오류",
            description: `${file.name} 파일 업로드에 실패했습니다.`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error uploading file with prompt:', error);
        toast({
          title: "오류",
          description: `${file.name} 파일 업로드 중 오류가 발생했습니다.`,
          variant: "destructive",
        });
      }
    }
  };

  // 클릭 시 input[type=file] 트리거
  const handleAreaClick = () => {
    inputRef.current?.click();
  };

  // 파일 선택 처리
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    
    if (files.length > 0) {
      // 이미지 파일이 있으면 프롬프트 입력 모달 표시
      const hasImageFiles = files.some(file => file.type.startsWith('image/'));
      if (hasImageFiles) {
        setShowPromptModal(true);
      } else {
        // 일반 파일은 기존 방식으로 업로드
        onFileSelect(event);
      }
    }
  };

  // 드래그 앤 드롭 처리
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(files);
    
    if (files.length > 0) {
      const hasImageFiles = files.some(file => file.type.startsWith('image/'));
      if (hasImageFiles) {
        setShowPromptModal(true);
      } else {
        onDrop(e);
      }
    }
  };

  // 프롬프트와 함께 업로드
  const handleUploadWithPrompt = () => {
    console.log('handleUploadWithPrompt called', { selectedFiles, promptData, onFileUploadWithPrompt });
    if (selectedFiles.length > 0) {
      if (onFileUploadWithPrompt) {
        console.log('Using onFileUploadWithPrompt prop');
        onFileUploadWithPrompt(selectedFiles, promptData);
      } else {
        console.log('Using direct upload function');
        uploadFilesWithPrompt(selectedFiles, promptData);
      }
      
      // 상태 초기화
      setSelectedFiles([]);
      setPromptData({
        prompt_text: '',
        prompt_type: 'image',
        ai_model: '',
        applyToAll: true
      });
      setShowPromptModal(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } else {
      console.log('handleUploadWithPrompt failed - no selected files');
    }
  };

  // 일반 업로드로 변경
  const handleRegularUpload = () => {
    console.log('handleRegularUpload called', { selectedFiles, onFileSelect });
    if (selectedFiles.length > 0) {
      // FileList 객체 생성하여 기존 핸들러 호출
      const dataTransfer = new DataTransfer();
      selectedFiles.forEach(file => dataTransfer.items.add(file));
      
      const event = {
        target: {
          files: dataTransfer.files
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      console.log('Calling onFileSelect');
      onFileSelect(event);
      setSelectedFiles([]);
      setShowPromptModal(false);
    } else {
      console.log('handleRegularUpload failed - no selected files');
    }
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setShowPromptModal(false);
    setSelectedFiles([]);
    setPromptData({
      prompt_text: '',
      prompt_type: 'image',
      ai_model: '',
      applyToAll: true
    });
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  // 선택된 파일 제거
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      {/* 파일 업로드 영역 */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-contest-orange transition-colors bg-gradient-to-br from-gray-50 to-white cursor-pointer"
        onDrop={handleDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onClick={handleAreaClick}
        tabIndex={0}
        role="button"
        aria-label="파일 업로드"
      >
        <input
          ref={inputRef}
          id="file-upload"
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.mp4,.webm,.mp3,.wav,.txt,.csv"
        />
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 mb-4 bg-contest-orange/10 rounded-full flex items-center justify-center">
            <Upload className="h-8 w-8 text-contest-orange" />
          </div>
          <h3 className="text-lg font-semibold mb-2">파일을 드래그하거나 클릭하여 업로드</h3>
          <p className="text-sm text-muted-foreground mb-4">
            여러 파일을 한 번에 업로드할 수 있습니다.
          </p>
          <div className="mt-4 text-xs text-muted-foreground">
            <p>지원 형식: PDF, DOC, PPT, XLS, PNG, JPG, MP4, MP3 등</p>
            <p>최대 파일 크기: 50MB</p>
          </div>
          {onPromptUpload && (
            <div className="mt-4">
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  onPromptUpload();
                }}
                variant="outline"
                size="sm"
                className="text-contest-orange border-contest-orange hover:bg-contest-orange hover:text-white"
              >
                프롬프트 관리로 이동
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 프롬프트 입력 모달 */}
      <Dialog open={showPromptModal} onOpenChange={setShowPromptModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-contest-orange" />
              프롬프트 정보 입력 (선택사항)
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 flex-1 overflow-y-auto">
            {/* 선택된 파일 목록 */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-sm mb-3">선택된 파일 ({selectedFiles.length}개)</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Badge variant="outline" className="text-xs">
                        {file.type.split('/')[0]}
                      </Badge>
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0 ml-2"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* 프롬프트 입력 폼 */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prompt-type">생성 타입</Label>
                  <Select 
                    value={promptData.prompt_type} 
                    onValueChange={(value) => setPromptData(prev => ({ 
                      ...prev, 
                      prompt_type: value as any 
                    }))}
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
                    value={promptData.ai_model}
                    onChange={(e) => setPromptData(prev => ({ 
                      ...prev, 
                      ai_model: e.target.value 
                    }))}
                    placeholder="AI 모델명 (선택사항)"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="prompt-text">프롬프트</Label>
                <Textarea
                  id="prompt-text"
                  value={promptData.prompt_text}
                  onChange={(e) => setPromptData(prev => ({ 
                    ...prev, 
                    prompt_text: e.target.value 
                  }))}
                  className="min-h-[120px] resize-none"
                  placeholder="파일 생성에 사용된 프롬프트를 입력하세요... (선택사항)"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="apply-to-all"
                  checked={promptData.applyToAll}
                  onCheckedChange={(checked) => setPromptData(prev => ({ 
                    ...prev, 
                    applyToAll: checked as boolean 
                  }))}
                />
                <Label htmlFor="apply-to-all" className="text-sm">
                  모든 파일에 동일한 프롬프트 적용
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCloseModal}
            >
              취소
            </Button>
            <Button
              variant="outline"
              onClick={handleRegularUpload}
            >
              일반 업로드
            </Button>
            <Button
              onClick={handleUploadWithPrompt}
              className="bg-contest-orange hover:bg-contest-orange/90"
              disabled={selectedFiles.length === 0}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              프롬프트와 함께 업로드
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

export default FileUploadArea; 