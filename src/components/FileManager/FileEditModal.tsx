import React, { useState, useEffect } from 'react';
import { Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileItem } from '@/services/fileService';
import { useToast } from '@/hooks/use-toast';

interface FileEditModalProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (fileId: number, updates: Partial<FileItem>) => Promise<void>;
}

export const FileEditModal: React.FC<FileEditModalProps> = ({
  file,
  isOpen,
  onClose,
  onSave
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    prompt: '',
    ai_model: '',
    prompt_type: 'image' as 'image' | 'document' | 'video' | 'audio' | 'other'
  });
  const [isSaving, setIsSaving] = useState(false);

  // 파일 데이터가 변경될 때 폼 초기화
  useEffect(() => {
    if (file) {
      setFormData({
        name: file.name || '',
        prompt: file.prompt || '',
        ai_model: file.ai_model || '',
        prompt_type: 'image' // 기본값, 실제로는 파일에서 가져와야 함
      });
    }
  }, [file]);

  const handleSave = async () => {
    if (!file?.id) return;

    setIsSaving(true);
    try {
      await onSave(file.id, {
        name: formData.name,
        prompt: formData.prompt,
        ai_model: formData.ai_model
      });
      
      toast({
        title: "성공",
        description: "파일 정보가 업데이트되었습니다.",
      });
      
      onClose();
    } catch (error) {
      console.error('Error updating file:', error);
      toast({
        title: "오류",
        description: "파일 정보 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-contest-orange" />
            파일 정보 편집
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="file-name">파일명</Label>
            <Input
              id="file-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="파일명을 입력하세요"
            />
          </div>

          <div>
            <Label htmlFor="prompt-type">생성 타입</Label>
            <Select 
              value={formData.prompt_type} 
              onValueChange={(value) => setFormData(prev => ({ 
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
              value={formData.ai_model}
              onChange={(e) => setFormData(prev => ({ ...prev, ai_model: e.target.value }))}
              placeholder="AI 모델명 (예: DALL-E, Midjourney)"
            />
          </div>

          <div>
            <Label htmlFor="prompt-text">프롬프트</Label>
            <Textarea
              id="prompt-text"
              value={formData.prompt}
              onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
              className="min-h-[100px] resize-none"
              placeholder="사용된 프롬프트를 입력하세요..."
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !formData.name.trim()}
            className="bg-contest-orange hover:bg-contest-orange/90"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 